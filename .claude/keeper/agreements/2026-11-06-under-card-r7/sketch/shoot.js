const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const d = process.argv[2];
  for (const v of ['1','2','4']) for (const h of [0,1]) {
    const p = await b.newPage({ viewport:{width:412,height:915}, deviceScaleFactor:2 });
    await p.goto('file://' + d + '/sketch.html?v=' + v + (h ? '&h=1' : '')); await p.waitForTimeout(1500);
    await p.screenshot({ path: d + '/s' + v + (h ? '-hints' : '') + '.png' }); await p.close(); }
  await b.close(); })();
