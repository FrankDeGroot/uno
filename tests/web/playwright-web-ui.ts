import { chromium, type Browser, type Page } from 'playwright';

const TARGET_URL = 'http://localhost:3000';

function pass(name: string): void { console.log(`✅ ${name}`); }
function fail(name: string, detail: string): void { console.log(`❌ ${name}: ${detail}`); }

async function openGame(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  await page.goto(TARGET_URL);
  await page.waitForSelector('#hand button', { timeout: 8000 });
  return page;
}

const browser = await chromium.launch({ headless: false, slowMo: 100 });
let allPassed = true;

// Test 1: Page Load
{
  const page = await openGame(browser);
  try {
    const title = await page.title();
    if (title !== 'WoMiWo UNO') throw new Error(`title="${title}"`);
    for (const sel of ['#info', '#message-area', '#hand-area', '#actions', '#new-game-btn']) {
      await page.waitForSelector(sel, { timeout: 3000 });
    }
    pass('Test 1: Page Load');
  } catch (e) {
    fail('Test 1: Page Load', (e as Error).message);
    allPassed = false;
  }
  await page.close();
}

// Test 2: New Game Initialization
{
  const page = await openGame(browser);
  try {
    const cardCount = await page.locator('#hand button').count();
    if (cardCount === 0) throw new Error('no cards in hand');

    const computerCount = await page.locator('#computer-count').textContent();
    if (!computerCount || isNaN(parseInt(computerCount))) throw new Error(`invalid computer count: "${computerCount}"`);

    const topCardHtml = await page.locator('#top-card').innerHTML();
    if (!topCardHtml || topCardHtml.trim() === '—') throw new Error('top card not rendered');

    if (await page.locator('#draw-btn').isDisabled()) throw new Error('draw button disabled on fresh game');

    pass('Test 2: New Game Initialization');
  } catch (e) {
    fail('Test 2: New Game Initialization', (e as Error).message);
    allPassed = false;
  }
  await page.close();
}

// Test 3: Draw Card
// Server auto-passes when drawn card is unplayable (re-enables draw for next turn).
// Drawable card → draw button disabled, pass button visible.
// Unplayable card → turn auto-passed, AI runs, draw button re-enabled, hand grew.
{
  const page = await openGame(browser);
  try {
    const handBefore = await page.locator('#hand button').count();
    await page.click('#draw-btn');
    await page.waitForTimeout(1500);

    const drawDisabled = await page.locator('#draw-btn').isDisabled();
    const handAfter = await page.locator('#hand button').count();

    if (!drawDisabled && handAfter <= handBefore) {
      throw new Error(`draw had no effect: button enabled and hand unchanged (${handBefore} cards)`);
    }

    pass('Test 3: Draw Card');
  } catch (e) {
    fail('Test 3: Draw Card', (e as Error).message);
    allPassed = false;
  }
  await page.close();
}

// Test 4: Play a Non-Wild Card
{
  let played = false;
  for (let attempt = 0; attempt < 5 && !played; attempt++) {
    const page = await openGame(browser);
    try {
      const enabledBtns = await page.locator('#hand button:not([disabled])').all();
      let targetBtn = null;
      for (const btn of enabledBtns) {
        const cls = await btn.getAttribute('class') ?? '';
        if (!cls.includes('card-wild')) { targetBtn = btn; break; }
      }
      if (!targetBtn) { await page.close(); continue; }

      const topBefore = await page.locator('#top-card').innerHTML();
      await targetBtn.click();
      await page.waitForTimeout(1200);

      const topAfter = await page.locator('#top-card').innerHTML();
      const gameOver = await page.locator('#message.gameover').count() > 0;
      if (topBefore === topAfter && !gameOver) throw new Error('top card unchanged after play');

      pass('Test 4: Play a Card');
      played = true;
      await page.close();
    } catch (e) {
      await page.close();
      if (attempt === 4) { fail('Test 4: Play a Card', (e as Error).message); allPassed = false; }
    }
  }
  if (!played && !allPassed) {
    fail('Test 4: Play a Card', 'no non-wild playable card in 5 attempts');
    allPassed = false;
  }
}

// Test 5: Wild Card Color Picker
{
  let tested = false;
  for (let attempt = 0; attempt < 5 && !tested; attempt++) {
    const page = await openGame(browser);
    try {
      const enabledBtns = await page.locator('#hand button:not([disabled])').all();
      let wildBtn = null;
      for (const btn of enabledBtns) {
        const cls = await btn.getAttribute('class') ?? '';
        if (cls.includes('card-wild')) { wildBtn = btn; break; }
      }
      if (!wildBtn) { await page.close(); continue; }

      await wildBtn.click();
      await page.waitForSelector('#color-picker', { state: 'visible', timeout: 3000 });

      await page.click('#color-buttons button:has-text("Blue")');
      await page.waitForTimeout(1200);

      if (await page.locator('#color-picker').isVisible()) throw new Error('color picker still visible after selection');
      const activeColor = await page.locator('#active-color').textContent();
      if (activeColor !== 'blue') throw new Error(`expected "blue", got "${activeColor}"`);

      pass('Test 5: Wild Card Color Picker');
      tested = true;
      await page.close();
    } catch (e) {
      await page.close();
      if (attempt === 4) { fail('Test 5: Wild Card Color Picker', (e as Error).message); allPassed = false; }
    }
  }
  if (!tested) {
    console.log('⚠️  Test 5: Wild Card Color Picker — no wild card dealt in 5 attempts, skipped');
  }
}

// Test 6: New Game Reset
// draw auto-passes when drawn card is unplayable, so pass button may not show.
{
  const page = await openGame(browser);
  try {
    await page.click('#draw-btn');
    await page.waitForTimeout(1200);

    await page.click('#new-game-btn');
    await page.waitForSelector('#hand button', { timeout: 8000 });

    if (await page.locator('#pass-btn').isVisible()) throw new Error('pass button visible after new game');
    if (await page.locator('#draw-btn').isDisabled()) throw new Error('draw button disabled after new game');
    const topHtml = await page.locator('#top-card').innerHTML();
    if (!topHtml || topHtml.trim() === '—') throw new Error('top card not rendered after new game');

    pass('Test 6: New Game Reset');
  } catch (e) {
    fail('Test 6: New Game Reset', (e as Error).message);
    allPassed = false;
  }
  await page.screenshot({ path: '/tmp/womino-final.png', fullPage: true });
  await page.close();
}

await browser.close();
console.log(allPassed ? '\n✅ All tests passed' : '\n❌ Some tests failed');
process.exit(allPassed ? 0 : 1);
