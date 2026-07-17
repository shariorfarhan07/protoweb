"""
Fixed catalog of granular permissions and the built-in (system) roles.

Permissions are referenced everywhere by their string ``key`` (e.g. ``orders.manage``).
The catalog below is the single source of truth — it is seeded into the DB on
startup, and the admin Roles UI lets a super-admin compose custom roles from it.
"""

# ── Permission catalog ──────────────────────────────────────────────────────────
# (key, label, group, description)
PERMISSION_CATALOG: list[tuple[str, str, str, str]] = [
    # General
    ("admin.access",   "Access admin panel",       "General", "Sign in to the admin dashboard at all."),
    # Orders
    ("orders.view",    "View orders",              "Orders",  "See all customer orders."),
    ("orders.manage",  "Update orders",            "Orders",  "Change order status."),
    # Catalog / products
    ("products.view",  "View products (admin)",    "Catalog", "Browse the admin product & inventory lists."),
    ("products.manage","Manage products & stock",  "Catalog", "Create, edit, delete products, variants and stock."),
    ("catalog.manage", "Manage catalog structure", "Catalog", "Manage categories, brands and product types."),
    # Content
    ("reviews.moderate","Moderate reviews",        "Content", "Approve, edit and delete product reviews."),
    ("blog.manage",    "Manage blog",              "Content", "Create, edit and delete blog posts, videos and projects."),
    ("messages.view",  "View messages",            "Content", "Read contact-form messages and newsletter subscribers."),
    ("messages.manage","Manage messages",          "Content", "Mark messages read, delete messages and remove subscribers."),
    # Insights
    ("reports.view",   "View reports & analytics", "Insights","See the dashboard stats and sales reports."),
    # Access control
    ("users.view",     "View users",               "Access",  "See the list of user accounts."),
    ("users.manage",   "Manage users",             "Access",  "Change a user's role and enable/disable accounts."),
    ("roles.manage",   "Manage roles",             "Access",  "Create, edit and delete roles and their permissions."),
]

ALL_PERMISSION_KEYS: list[str] = [p[0] for p in PERMISSION_CATALOG]


# ── System (built-in) roles ─────────────────────────────────────────────────────
# slug → definition. These cannot be deleted; their permission sets are the
# defaults but a super-admin may re-tune the non-superuser ones in the UI.
SYSTEM_ROLES: list[dict] = [
    {
        "slug": "super_admin",
        "name": "Super Admin",
        "description": "Full, unrestricted access to everything — now and in the future.",
        "is_superuser": True,
        "sort_order": 1,
        "permissions": [],  # superuser implies all; no explicit list needed
    },
    {
        "slug": "admin",
        "name": "Admin",
        "description": "Day-to-day store management. Can view users but not change roles.",
        "is_superuser": False,
        "sort_order": 2,
        "permissions": [
            "admin.access", "orders.view", "orders.manage",
            "products.view", "products.manage", "catalog.manage",
            "reviews.moderate", "blog.manage", "reports.view", "users.view",
            "messages.view", "messages.manage",
        ],
    },
    {
        "slug": "inventory_manager",
        "name": "Inventory Manager",
        "description": "Manages products and stock levels.",
        "is_superuser": False,
        "sort_order": 3,
        "permissions": ["admin.access", "products.view", "products.manage"],
    },
    {
        "slug": "support",
        "name": "Support",
        "description": "Handles customer orders and reviews.",
        "is_superuser": False,
        "sort_order": 4,
        "permissions": ["admin.access", "orders.view", "orders.manage", "reviews.moderate", "users.view", "messages.view", "messages.manage"],
    },
    {
        "slug": "customer",
        "name": "Customer",
        "description": "Standard shopper account. No admin access.",
        "is_superuser": False,
        "sort_order": 5,
        "permissions": [],
    },
]
