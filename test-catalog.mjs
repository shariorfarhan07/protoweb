import { chromium } from 'playwright';

const b = await chromium.launch({ headless: true });
const p = await b.newPage();
await p.setViewportSize({ width: 1440, height: 900 });
await p.goto('http://localhost:5000', { waitUntil: 'networkidle' });

const cards = await p.$$('.product-card');
const tabs  = await p.$$('.filter-tab');
const count = await p.$eval('#productCount', el => el.textContent);
console.log(`Product cards (all): ${cards.length}`);
console.log(`Filter tabs:         ${tabs.length}`);
console.log(`Count label:         ${count}`);
await p.screenshot({ path: 'test-screenshots/catalog-all.png', fullPage: true });

// laser filter
await p.click('.filter-tab[data-filter="laser"]');
await p.waitForTimeout(200);
const laserCards = await p.$$('.product-card');
console.log(`Laser cards:         ${laserCards.length}`);
await p.screenshot({ path: 'test-screenshots/catalog-laser.png' });

// filament filter
await p.click('.filter-tab[data-filter="filament"]');
await p.waitForTimeout(200);
const filCards = await p.$$('.product-card');
console.log(`Filament cards:      ${filCards.length}`);
await p.screenshot({ path: 'test-screenshots/catalog-filament.png' });

// add to cart
await p.click('.filter-tab[data-filter="all"]');
await p.waitForTimeout(200);
await p.click('.add-to-cart-btn');
await p.waitForTimeout(300);
const badge = await p.$eval('#cartBadge', el => ({
  text: el.textContent.trim(),
  visible: el.classList.contains('visible')
}));
console.log(`Cart badge text:     ${badge.text}`);
console.log(`Cart badge visible:  ${badge.visible}`);

await b.close();
console.log('\nAll checks done.');
