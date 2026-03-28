"""
Seed script — populates the database with sample data for PrototypeBD.
Run: python seed.py
Skips seeding if categories already exist (idempotent).
"""
import asyncio
import os

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.models.base import Base
from app.models.brand import Brand
from app.models.category import Category
from app.models.filament_variant import FilamentVariant
from app.models.product import Product
from app.models.product_image import ProductImage

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite+aiosqlite:///./prototypebd.db")

engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Skip if already seeded
        existing = (await session.execute(select(Category))).scalars().first()
        if existing:
            print("Database already seeded — skipping.")
            return

        # ── Categories ────────────────────────────────────────────────────────
        cat_printer = Category(
            name="3D Printers",
            slug="3d-printers",
            description="High-precision FDM and resin 3D printers for every maker.",
            image_url="/images/asthetic-printer-595x595.png",
            gradient_css="linear-gradient(135deg, #ddeeff, #b8d8f8)",
        )
        cat_cnc = Category(
            name="CNC Machines",
            slug="cnc-machines",
            description="Reliable CNC machines designed for precision and performance.",
            image_url="/images/Twotrees-595x595.png",
            gradient_css="linear-gradient(135deg, #ffe8d6, #ffd0b0)",
        )
        cat_laser = Category(
            name="Laser Engravers",
            slug="laser-engravers",
            description="Pinpoint accuracy on wood, metal, acrylic and more.",
            image_url="/images/Laser-Engraver-595x595.png",
            gradient_css="linear-gradient(135deg, #d6ffe8, #b0f0cc)",
        )
        cat_filament = Category(
            name="Filament",
            slug="filament",
            description="Premium filament with consistent color and flawless finish.",
            image_url="/images/Filament.png",
            gradient_css="linear-gradient(135deg, #ead6ff, #d4b0f5)",
        )
        session.add_all([cat_printer, cat_cnc, cat_laser, cat_filament])
        await session.flush()

        # ── Brands ────────────────────────────────────────────────────────────
        brand_bambu = Brand(name="Bambu Lab", slug="bambu-lab")
        brand_creality = Brand(name="Creality", slug="creality")
        brand_twotrees = Brand(name="Two Trees", slug="two-trees")
        brand_esun = Brand(name="eSUN", slug="esun")
        brand_hatchbox = Brand(name="Hatchbox", slug="hatchbox")
        brand_atomstack = Brand(name="Atomstack", slug="atomstack")
        session.add_all([brand_bambu, brand_creality, brand_twotrees, brand_esun, brand_hatchbox, brand_atomstack])
        await session.flush()

        # ── 3D Printers ───────────────────────────────────────────────────────
        p1 = Product(
            slug="bambu-lab-p1s",
            name="Bambu Lab P1S",
            short_desc="All-in-one enclosed printer with AMS support. 600mm/s speed.",
            long_desc="""<h2>Bambu Lab P1S — The Professional's Choice</h2>
<p>The P1S is Bambu Lab's flagship enclosed 3D printer, engineered for professionals who demand speed, precision, and reliability.</p>
<h3>Key Highlights</h3>
<ul>
  <li>Print speed up to <strong>600mm/s</strong></li>
  <li>Multi-color printing with AMS (Automatic Material System)</li>
  <li>Active vibration compensation (AVC)</li>
  <li>Built-in AI camera monitoring</li>
</ul>
<h3>Build Volume</h3>
<p>256 × 256 × 256 mm — perfect for functional prototypes and production parts.</p>""",
            price=95000,
            compare_price=105000,
            sku="BL-P1S-001",
            stock_qty=12,
            is_active=True,
            is_featured=True,
            product_type="printer",
            specifications={
                "Build Volume": "256 × 256 × 256 mm",
                "Layer Resolution": "0.05 – 0.35 mm",
                "Print Speed": "up to 600 mm/s",
                "Nozzle Diameter": "0.4 mm (default)",
                "Heated Bed": "Yes (up to 120°C)",
                "Enclosure": "Yes (active temperature control)",
                "Multi-color": "Yes (AMS, up to 16 colors)",
                "Connectivity": "Wi-Fi, LAN, USB",
                "Weight": "15.88 kg",
            },
            meta_title="Bambu Lab P1S 3D Printer | PrototypeBD",
            meta_desc="Buy the Bambu Lab P1S enclosed 3D printer in Bangladesh. 600mm/s speed, AMS multi-color, AI monitoring.",
            category_id=cat_printer.id,
            brand_id=brand_bambu.id,
        )

        p2 = Product(
            slug="creality-ender-3-v3-se",
            name="Creality Ender-3 V3 SE",
            short_desc="Budget-friendly beginner printer with auto-leveling and 250mm/s speed.",
            long_desc="""<h2>Creality Ender-3 V3 SE</h2>
<p>The perfect entry-level 3D printer for beginners and hobbyists. Auto-leveling eliminates the frustration of manual bed leveling.</p>
<h3>Features</h3>
<ul>
  <li>CR Touch auto-leveling (25-point)</li>
  <li>Print speed up to <strong>250mm/s</strong></li>
  <li>PEI spring steel print surface</li>
  <li>Dual Z-axis for stability</li>
</ul>""",
            price=22000,
            compare_price=26000,
            sku="CR-E3V3SE-001",
            stock_qty=30,
            is_active=True,
            is_featured=True,
            product_type="printer",
            specifications={
                "Build Volume": "220 × 220 × 250 mm",
                "Layer Resolution": "0.1 – 0.35 mm",
                "Print Speed": "up to 250 mm/s",
                "Nozzle Diameter": "0.4 mm",
                "Heated Bed": "Yes (up to 100°C)",
                "Enclosure": "No",
                "Multi-color": "No",
                "Connectivity": "MicroSD, USB",
                "Weight": "7.8 kg",
            },
            meta_title="Creality Ender-3 V3 SE | PrototypeBD",
            meta_desc="Buy the Creality Ender-3 V3 SE in Bangladesh. Best budget 3D printer with auto-leveling.",
            category_id=cat_printer.id,
            brand_id=brand_creality.id,
        )

        # ── CNC Machines ──────────────────────────────────────────────────────
        p3 = Product(
            slug="two-trees-totem-s",
            name="Two Trees Totem S CNC Router",
            short_desc="3018 CNC router for wood, acrylic, PCB engraving. GRBL-based.",
            long_desc="""<h2>Two Trees Totem S CNC Router</h2>
<p>A versatile desktop CNC router for hobbyists and small businesses. Carve wood, engrave acrylic, and mill PCBs with precision.</p>
<h3>Specifications</h3>
<ul>
  <li>Working area: <strong>300 × 180 × 45 mm</strong></li>
  <li>GRBL 1.1 firmware</li>
  <li>ER11 collet spindle</li>
  <li>Compatible with Candle, LaserGRBL, UGS</li>
</ul>""",
            price=18000,
            sku="TT-TOTEM-S-001",
            stock_qty=15,
            is_active=True,
            is_featured=False,
            product_type="cnc",
            specifications={
                "Working Area": "300 × 180 × 45 mm",
                "Spindle Speed": "0 – 10,000 RPM",
                "Spindle Power": "775 motor, 24V",
                "Controller": "GRBL 1.1",
                "Software": "Candle / LaserGRBL / UGS",
                "Frame": "Aluminium extrusion",
                "Stepper Motors": "NEMA 17",
                "Weight": "3.5 kg",
            },
            category_id=cat_cnc.id,
            brand_id=brand_twotrees.id,
        )

        # ── Laser Engravers ────────────────────────────────────────────────────
        p4 = Product(
            slug="atomstack-a5-pro",
            name="Atomstack A5 Pro Laser Engraver",
            short_desc="40W laser engraver for wood, leather, and dark metals. Eye-protection design.",
            long_desc="""<h2>Atomstack A5 Pro</h2>
<p>Professional-grade laser engraver with a compressed spot design for ultra-fine engravings.</p>
<ul>
  <li>Laser power: <strong>5W optical output</strong></li>
  <li>Fixed focal length — no manual focus needed</li>
  <li>Eye-protection safety design</li>
  <li>Engrave on wood, leather, cardboard, dark plastics</li>
</ul>""",
            price=16500,
            sku="AS-A5PRO-001",
            stock_qty=20,
            is_active=True,
            is_featured=True,
            product_type="cnc",  # laser engravers are in cnc category
            specifications={
                "Laser Power": "5W optical output (40W equivalent)",
                "Working Area": "410 × 400 mm",
                "Engraving Speed": "up to 6000 mm/min",
                "Focal Length": "Fixed (compressed spot)",
                "Compatible Materials": "Wood, Leather, Cardboard, Dark plastic",
                "Software": "LaserGRBL / LightBurn",
                "Connectivity": "USB",
                "Weight": "4.2 kg",
            },
            meta_title="Atomstack A5 Pro Laser Engraver | PrototypeBD",
            meta_desc="Buy the Atomstack A5 Pro laser engraver in Bangladesh. 40W equivalent, 410×400mm working area.",
            category_id=cat_laser.id,
            brand_id=brand_atomstack.id,
        )

        # ── Filament ──────────────────────────────────────────────────────────
        p5 = Product(
            slug="esun-pla-plus-1kg",
            name="eSUN PLA+ Filament 1KG",
            short_desc="High-quality PLA+ filament. Stronger than standard PLA. Available in 20+ colors.",
            long_desc="""<h2>eSUN PLA+ 1KG Filament</h2>
<p>eSUN PLA+ is an enhanced PLA formula offering improved toughness, better layer adhesion, and reduced warping compared to standard PLA.</p>
<h3>Why PLA+?</h3>
<ul>
  <li>30% tougher than standard PLA</li>
  <li>Excellent surface finish</li>
  <li>Low warping — ideal for large prints</li>
  <li>Prints at 190–230°C</li>
</ul>""",
            price=1800,
            sku="ESUN-PLAPLUS-1KG",
            stock_qty=200,
            is_active=True,
            is_featured=True,
            product_type="filament",
            meta_title="eSUN PLA+ 1KG Filament | PrototypeBD",
            meta_desc="Buy eSUN PLA+ 1KG filament in Bangladesh. 20+ colors, 1.75mm, high-quality FDM filament.",
            category_id=cat_filament.id,
            brand_id=brand_esun.id,
        )

        p6 = Product(
            slug="hatchbox-petg-1kg",
            name="Hatchbox PETG Filament 1KG",
            short_desc="Food-safe PETG filament. Great for functional parts needing chemical resistance.",
            long_desc="""<h2>Hatchbox PETG 1KG</h2>
<p>PETG combines the ease of PLA printing with the durability of ABS. Perfect for functional prototypes, outdoor items, and food-safe containers.</p>""",
            price=2200,
            sku="HB-PETG-1KG",
            stock_qty=80,
            is_active=True,
            is_featured=False,
            product_type="filament",
            category_id=cat_filament.id,
            brand_id=brand_hatchbox.id,
        )

        session.add_all([p1, p2, p3, p4, p5, p6])
        await session.flush()

        # ── Product Images ─────────────────────────────────────────────────────
        session.add_all([
            ProductImage(product_id=p1.id, url="/images/asthetic-printer-595x595.png",
                         alt_text="Bambu Lab P1S", is_primary=True, sort_order=0),
            ProductImage(product_id=p2.id, url="/images/asthetic-printer-595x595.png",
                         alt_text="Creality Ender-3 V3 SE", is_primary=True, sort_order=0),
            ProductImage(product_id=p3.id, url="/images/Twotrees-595x595.png",
                         alt_text="Two Trees Totem S", is_primary=True, sort_order=0),
            ProductImage(product_id=p4.id, url="/images/Laser-Engraver-595x595.png",
                         alt_text="Atomstack A5 Pro", is_primary=True, sort_order=0),
            ProductImage(product_id=p5.id, url="/images/Filament.png",
                         alt_text="eSUN PLA+ Filament", is_primary=True, sort_order=0),
            ProductImage(product_id=p6.id, url="/images/Filament.png",
                         alt_text="Hatchbox PETG Filament", is_primary=True, sort_order=0),
        ])

        # ── Filament Variants ─────────────────────────────────────────────────
        colors = [
            ("White", "#FFFFFF", "PLA"),
            ("Black", "#1a1a1a", "PLA"),
            ("Red", "#e53e3e", "PLA"),
            ("Blue", "#3182ce", "PLA"),
            ("Green", "#38a169", "PLA"),
            ("Yellow", "#d69e2e", "PLA"),
            ("Grey", "#718096", "PLA"),
            ("Orange", "#dd6b20", "PLA"),
        ]
        for i, (color_name, color_hex, material) in enumerate(colors):
            session.add(
                FilamentVariant(
                    product_id=p5.id,
                    color_name=color_name,
                    color_hex=color_hex,
                    material=material,
                    diameter_mm=1.75,
                    weight_grams=1000,
                    price_delta=0,
                    sku=f"ESUN-PLAPLUS-{color_name.upper()}-175",
                    stock_qty=30,
                    image_url="/images/Filament.png",
                    is_active=True,
                )
            )

        petg_colors = [
            ("Clear", "#f0f0f0", "PETG"),
            ("Black", "#1a1a1a", "PETG"),
            ("Blue", "#2b6cb0", "PETG"),
        ]
        for color_name, color_hex, material in petg_colors:
            session.add(
                FilamentVariant(
                    product_id=p6.id,
                    color_name=color_name,
                    color_hex=color_hex,
                    material=material,
                    diameter_mm=1.75,
                    weight_grams=1000,
                    price_delta=0,
                    sku=f"HB-PETG-{color_name.upper()}-175",
                    stock_qty=25,
                    image_url="/images/Filament.png",
                    is_active=True,
                )
            )

        await session.commit()
        print("Database seeded successfully!")
        print(f"  Categories: 4")
        print(f"  Brands: 6")
        print(f"  Products: 6")
        print(f"  Filament variants: {len(colors) + len(petg_colors)}")


if __name__ == "__main__":
    asyncio.run(seed())
