from typing import Optional

from fastapi import HTTPException, status
from slugify import slugify
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.core.permissions import (
    ALL_PERMISSION_KEYS,
    PERMISSION_CATALOG,
    SYSTEM_ROLES,
)
from app.models.role import Permission, Role
from app.models.user import User
from app.schemas.rbac import RoleCreate, RoleOut, RoleUpdate

logger = get_logger("app.services.rbac")


class RbacService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # ── Permission resolution ────────────────────────────────────────────────

    async def permissions_for_role(self, slug: str) -> set[str]:
        """Resolve the effective permission keys for a role slug.

        A superuser role implicitly holds every permission in the catalog.
        Unknown slugs resolve to an empty set (no access).
        """
        role = (
            await self.db.execute(select(Role).where(Role.slug == slug))
        ).scalars().first()
        if not role:
            return set()
        if role.is_superuser:
            return set(ALL_PERMISSION_KEYS)
        return {p.key for p in role.permissions}

    async def user_permissions(self, user: User) -> set[str]:
        return await self.permissions_for_role(user.role)

    async def is_superuser_role(self, slug: str) -> bool:
        role = (
            await self.db.execute(select(Role).where(Role.slug == slug))
        ).scalars().first()
        return bool(role and role.is_superuser)

    # ── Queries ──────────────────────────────────────────────────────────────

    async def _user_counts(self) -> dict[str, int]:
        rows = (
            await self.db.execute(
                select(User.role, func.count()).group_by(User.role)
            )
        ).all()
        return {slug: cnt for slug, cnt in rows}

    def _to_out(self, role: Role, user_count: int) -> RoleOut:
        return RoleOut(
            id=role.id,
            slug=role.slug,
            name=role.name,
            description=role.description,
            is_system=role.is_system,
            is_superuser=role.is_superuser,
            sort_order=role.sort_order,
            permissions=sorted(p.key for p in role.permissions),
            user_count=user_count,
        )

    async def list_roles(self) -> list[RoleOut]:
        roles = (
            await self.db.execute(select(Role).order_by(Role.sort_order, Role.name))
        ).scalars().all()
        counts = await self._user_counts()
        return [self._to_out(r, counts.get(r.slug, 0)) for r in roles]

    async def list_permissions(self) -> list[Permission]:
        return list(
            (
                await self.db.execute(select(Permission).order_by(Permission.sort_order, Permission.group))
            ).scalars().all()
        )

    async def _get_role_or_404(self, role_id: int) -> Role:
        role = (
            await self.db.execute(select(Role).where(Role.id == role_id))
        ).scalars().first()
        if not role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
        return role

    async def _resolve_permissions(self, keys: list[str]) -> list[Permission]:
        keys = list(dict.fromkeys(keys))  # dedupe, preserve order
        if not keys:
            return []
        perms = list(
            (
                await self.db.execute(select(Permission).where(Permission.key.in_(keys)))
            ).scalars().all()
        )
        found = {p.key for p in perms}
        unknown = [k for k in keys if k not in found]
        if unknown:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Unknown permission(s): {', '.join(unknown)}",
            )
        return perms

    # ── Mutations ────────────────────────────────────────────────────────────

    async def create_role(self, data: RoleCreate) -> RoleOut:
        slug = slugify(data.name)[:40] or "role"
        existing = (
            await self.db.execute(select(Role).where(Role.slug == slug))
        ).scalars().first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A role with slug '{slug}' already exists",
            )
        role = Role(
            slug=slug,
            name=data.name.strip(),
            description=(data.description or None),
            is_system=False,
            is_superuser=False,
            sort_order=100,
            permissions=await self._resolve_permissions(data.permissions),
        )
        self.db.add(role)
        await self.db.commit()
        logger.info(
            "Role created: slug=%s perms=%d", slug, len(data.permissions),
            extra={"event": "role_created", "slug": slug},
        )
        role = await self._get_role_or_404(role.id)
        return self._to_out(role, 0)

    async def update_role(self, role_id: int, data: RoleUpdate) -> RoleOut:
        role = await self._get_role_or_404(role_id)
        if data.name is not None:
            role.name = data.name.strip()
        if data.description is not None:
            role.description = data.description or None
        if data.permissions is not None:
            if role.is_superuser:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The super-admin role always has all permissions and cannot be edited.",
                )
            role.permissions = await self._resolve_permissions(data.permissions)
        await self.db.commit()
        logger.info(
            "Role updated: slug=%s", role.slug,
            extra={"event": "role_updated", "slug": role.slug},
        )
        role = await self._get_role_or_404(role.id)
        counts = await self._user_counts()
        return self._to_out(role, counts.get(role.slug, 0))

    async def delete_role(self, role_id: int) -> None:
        role = await self._get_role_or_404(role_id)
        if role.is_system:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Built-in roles cannot be deleted.",
            )
        counts = await self._user_counts()
        in_use = counts.get(role.slug, 0)
        if in_use:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot delete: {in_use} user(s) still have this role. Reassign them first.",
            )
        await self.db.delete(role)
        await self.db.commit()
        logger.info("Role deleted: slug=%s", role.slug, extra={"event": "role_deleted", "slug": role.slug})

    # ── Seeding ──────────────────────────────────────────────────────────────

    async def seed(self) -> None:
        """Idempotently upsert the permission catalog and the system roles."""
        # Permissions: insert any missing; keep labels/groups in sync.
        existing_perms = {
            p.key: p
            for p in (await self.db.execute(select(Permission))).scalars().all()
        }
        for i, (key, label, group, desc) in enumerate(PERMISSION_CATALOG):
            p = existing_perms.get(key)
            if p:
                p.label, p.group, p.description, p.sort_order = label, group, desc, i
            else:
                self.db.add(Permission(key=key, label=label, group=group, description=desc, sort_order=i))
        await self.db.commit()

        perm_by_key = {
            p.key: p
            for p in (await self.db.execute(select(Permission))).scalars().all()
        }

        # System roles: create if missing. For existing system roles we refresh
        # name/description/superuser flag but only (re)apply the default
        # permission set on first creation, so admins' later tweaks are preserved.
        existing_roles = {
            r.slug: r
            for r in (await self.db.execute(select(Role))).scalars().all()
        }
        for spec in SYSTEM_ROLES:
            r = existing_roles.get(spec["slug"])
            if r:
                r.name = spec["name"]
                r.description = spec["description"]
                r.is_superuser = spec["is_superuser"]
                r.is_system = True
                r.sort_order = spec["sort_order"]
            else:
                self.db.add(
                    Role(
                        slug=spec["slug"],
                        name=spec["name"],
                        description=spec["description"],
                        is_system=True,
                        is_superuser=spec["is_superuser"],
                        sort_order=spec["sort_order"],
                        permissions=[perm_by_key[k] for k in spec["permissions"] if k in perm_by_key],
                    )
                )
        await self.db.commit()
