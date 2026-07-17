import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');

const screenshotsDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

let passed = 0, failed = 0;

function pass(name) { console.log(`  ✓ ${name}`); passed++; }
function fail(name, err) { console.log(`  ✗ ${name}: ${err}`); failed++; }

async function assert(cond, name, msg = '') {
  if (cond) pass(name);
  else fail(name, msg || 'assertion failed');
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 800 });

console.log('\n=== PrototypeBD — Full App Test ===\n');

// ── 1. PAGE LOAD ──────────────────────────────────────────────
console.log('[ Page Load ]');
try {
  await page.goto(htmlPath, { waitUntil: 'networkidle' });
  const title = await page.title();
  await assert(title === 'Prototypebd', 'Page title is correct', `got "${title}"`);
  await page.screenshot({ path: path.join(screenshotsDir, '01-initial-load.png') });
  pass('Page loaded and screenshot saved');
} catch (e) { fail('Page load', e.message); }

// ── 2. NAVBAR ────────────────────────────────────────────────
console.log('\n[ Navbar ]');
try {
  const logo = await page.$('.logo');
  await assert(logo !== null, 'Logo element exists');

  const logoText = await page.$eval('.logo', el => el.textContent.trim());
  await assert(logoText.toLowerCase().includes('prototype'), 'Logo has brand name', `got "${logoText}"`);

  const navLinks = await page.$$('.nav-links a');
  await assert(navLinks.length >= 3, `Nav links count (≥3)`, `got ${navLinks.length}`);

  const linkLabels = await page.$$eval('.nav-links a', els => els.map(e => e.textContent.trim()));
  pass(`Nav links: ${linkLabels.join(', ')}`);

  const navbar = await page.$('.navbar');
  const isSticky = await page.$eval('.navbar', el => getComputedStyle(el).position);
  await assert(isSticky === 'sticky', 'Navbar is sticky-positioned', `got "${isSticky}"`);
} catch (e) { fail('Navbar', e.message); }

// ── 3. SEARCH BAR ────────────────────────────────────────────
console.log('\n[ Search Bar ]');
try {
  // Initially closed
  const initiallyOpen = await page.$eval('#searchBar', el => el.classList.contains('open'));
  await assert(!initiallyOpen, 'Search bar initially closed');

  // Open via icon button
  await page.click('button[aria-label="Search"]');
  await page.waitForTimeout(400); // animation
  const nowOpen = await page.$eval('#searchBar', el => el.classList.contains('open'));
  await assert(nowOpen, 'Search bar opens on icon click');

  // Input focused
  const focused = await page.evaluate(() => document.activeElement.id);
  await assert(focused === 'searchInput', 'Search input focused after open', `focused: "${focused}"`);

  await page.screenshot({ path: path.join(screenshotsDir, '02-search-open.png') });
  pass('Search open screenshot saved');

  // Type something
  await page.type('#searchInput', 'filament');
  const val = await page.$eval('#searchInput', el => el.value);
  await assert(val === 'filament', 'Can type in search input', `got "${val}"`);

  // Close via ✕ button
  await page.click('.search-close');
  await page.waitForTimeout(200);
  const closedAfterBtn = await page.$eval('#searchBar', el => el.classList.contains('open'));
  await assert(!closedAfterBtn, 'Search closes via close button');

  // Input cleared on close
  const cleared = await page.$eval('#searchInput', el => el.value);
  await assert(cleared === '', 'Search input cleared on close', `value: "${cleared}"`);

  // Open again, close via Escape
  await page.click('button[aria-label="Search"]');
  await page.waitForTimeout(400);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const closedEsc = await page.$eval('#searchBar', el => el.classList.contains('open'));
  await assert(!closedEsc, 'Search closes via Escape key');
} catch (e) { fail('Search bar', e.message); }

// ── 4. HERO CAROUSEL ─────────────────────────────────────────
console.log('\n[ Hero Carousel ]');
try {
  const slides = await page.$$('.slide');
  await assert(slides.length === 4, `4 slides present`, `got ${slides.length}`);

  // Verify initial state
  const initialTransform = await page.$eval('#slides', el => el.style.transform);
  await assert(initialTransform.includes('0%') || initialTransform === '', 'Slides at position 0 initially', `transform: "${initialTransform}"`);

  const initialCounter = await page.$eval('#slide-counter, #counter', el => el.textContent.trim());
  await assert(initialCounter === '01 / 04', 'Counter shows 01 / 04', `got "${initialCounter}"`);

  const activeDot = await page.$$eval('.dot', dots => dots.filter(d => d.classList.contains('active')).length);
  await assert(activeDot === 1, 'Exactly one active dot initially');

  await page.screenshot({ path: path.join(screenshotsDir, '03-carousel-slide1.png') });

  // Next button
  await page.click('.carousel-btn.next');
  await page.waitForTimeout(300);
  const afterNext = await page.$eval('#slides', el => el.style.transform);
  await assert(afterNext.includes('100%'), 'Next button advances to slide 2', `transform: "${afterNext}"`);

  const counter2 = await page.$eval('#counter', el => el.textContent.trim());
  await assert(counter2 === '02 / 04', 'Counter updates to 02 / 04', `got "${counter2}"`);
  await page.screenshot({ path: path.join(screenshotsDir, '04-carousel-slide2.png') });

  // Prev button
  await page.click('.carousel-btn.prev');
  await page.waitForTimeout(300);
  const afterPrev = await page.$eval('#slides', el => el.style.transform);
  await assert(afterPrev.includes('0%'), 'Prev button goes back to slide 1', `transform: "${afterPrev}"`);

  // Dot navigation
  await page.click('.dot:nth-child(3)');
  await page.waitForTimeout(300);
  const afterDot = await page.$eval('#slides', el => el.style.transform);
  await assert(afterDot.includes('200%'), 'Dot click navigates to slide 3', `transform: "${afterDot}"`);
  await page.screenshot({ path: path.join(screenshotsDir, '05-carousel-slide3.png') });

  // Wrap-around: prev from slide 1 goes to slide 4
  await page.click('.dot:nth-child(1)');
  await page.waitForTimeout(300);
  await page.click('.carousel-btn.prev');
  await page.waitForTimeout(300);
  const wrapCounter = await page.$eval('#counter', el => el.textContent.trim());
  await assert(wrapCounter === '04 / 04', 'Prev from slide 1 wraps to slide 4', `got "${wrapCounter}"`);
} catch (e) { fail('Hero carousel', e.message); }

// ── 5. CATEGORY CARDS ────────────────────────────────────────
console.log('\n[ Category Cards ]');
try {
  const cards = await page.$$('.category-card');
  await assert(cards.length === 4, `4 category cards`, `got ${cards.length}`);

  const imgs = await page.$$('.category-card img');
  await assert(imgs.length === 4, `4 product images in cards`, `got ${imgs.length}`);

  // Check all images loaded (naturalWidth > 0)
  const allLoaded = await page.$$eval('.category-card img', imgs =>
    imgs.every(img => img.complete && img.naturalWidth > 0)
  );
  await assert(allLoaded, 'All category images loaded successfully');

  const sectionHeader = await page.$eval('.section-header h2', el => el.textContent.trim());
  await assert(sectionHeader === 'Categories', 'Section header reads "Categories"', `got "${sectionHeader}"`);

  await page.screenshot({ path: path.join(screenshotsDir, '06-categories.png'), fullPage: true });
  pass('Full-page categories screenshot saved');
} catch (e) { fail('Category cards', e.message); }

// ── 6. RESPONSIVENESS (mobile) ───────────────────────────────
console.log('\n[ Responsiveness ]');
try {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(300);
  const bodyWidth = await page.$eval('body', el => el.scrollWidth);
  await assert(bodyWidth <= 375, 'No horizontal overflow on mobile', `scrollWidth: ${bodyWidth}px`);
  await page.screenshot({ path: path.join(screenshotsDir, '07-mobile.png'), fullPage: true });
  pass('Mobile screenshot saved');
  await page.setViewportSize({ width: 1280, height: 800 });
} catch (e) { fail('Responsiveness', e.message); }

// ── 7. JS ERRORS ─────────────────────────────────────────────
console.log('\n[ JS Console Errors ]');
const jsErrors = [];
page.on('pageerror', err => jsErrors.push(err.message));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await assert(jsErrors.length === 0, 'No JavaScript errors', jsErrors.join('; '));

// ── SUMMARY ──────────────────────────────────────────────────
await browser.close();
console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`Screenshots saved to: test-screenshots/`);
if (failed > 0) {
  console.log('\nFAILED TESTS:');
  process.exit(1);
} else {
  console.log('\nAll tests passed!');
}
