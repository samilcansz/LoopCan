const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const filePath = path.resolve('index.html');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
  await page.goto('file:///' + filePath.replace(/\\/g, '/'));
  await new Promise(r => setTimeout(r, 2000));

  // Scroll through the page to trigger fade-up animations
  await page.evaluate(async () => {
    await new Promise(r => {
      let pos = 0;
      const interval = setInterval(() => {
        pos += 400;
        window.scrollTo(0, pos);
        if (pos > document.body.scrollHeight) { clearInterval(interval); r(); }
      }, 80);
    });
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 1200));

  // Full page
  await page.screenshot({ path: 'screenshots/desktop_full.png', fullPage: true });

  // Hero (above the fold)
  await page.screenshot({ path: 'screenshots/desktop_hero.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });

  // Section screenshots
  const sections = [
    { id: 'nasil-calisiyoruz', name: 'how_it_works', wait: 400 },
    { id: 'neden-biz',         name: 'why_loopcan',  wait: 1200 }, // wait for flow animation
    { id: 'blog',              name: 'blog',          wait: 400  },
    { id: 'sss',               name: 'faq',           wait: 400  },
    { id: 'iletisim',          name: 'contact',       wait: 400  },
  ];

  for (const s of sections) {
    await page.evaluate(id => document.getElementById(id)?.scrollIntoView({ behavior: 'instant' }), s.id);
    await new Promise(r => setTimeout(r, s.wait));
    const el = await page.$('#' + s.id);
    if (el) await el.screenshot({ path: `screenshots/${s.name}.png` });
  }

  // Mobile hero
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('file:///' + filePath.replace(/\\/g, '/'));
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'screenshots/mobile_hero.png', clip: { x: 0, y: 0, width: 390, height: 844 } });

  // Mobile full
  await page.evaluate(async () => {
    await new Promise(r => {
      let pos = 0;
      const interval = setInterval(() => {
        pos += 400;
        window.scrollTo(0, pos);
        if (pos > document.body.scrollHeight) { clearInterval(interval); r(); }
      }, 80);
    });
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshots/mobile_full.png', fullPage: true });

  await browser.close();
  console.log('Screenshots done.');
})();
