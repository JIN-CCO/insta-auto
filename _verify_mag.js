// 매거진 전 슬라이드 넘침/클리핑 자동 검사 (placeholder 사진 기준)
const { chromium } = require('playwright');
const content = require('./content');
const { magPages } = require('./lib/render_mag');

const issues = [];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 0; i < content.length; i++) {
    const pages = magPages(content[i], content[(i + 1) % content.length], 'makeit_pedia', { cover: null, details: {} });
    for (const pg of pages) {
      await page.setContent(pg.html, { waitUntil: 'networkidle' });
      const bad = await page.evaluate(() => {
        const W = 1080, H = 1350, out = [];
        document.querySelectorAll('.ctitle,.csub,.bh,.bd,.ah,.ad,.lh,.dh,.nq,.nsub,.it p,.foot').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.right > W + 1) out.push(`${el.className}: 우측넘침`);
          if (r.bottom > H + 1) out.push(`${el.className}: 하단넘침`);
          if (r.left < -1) out.push(`${el.className}: 좌측넘침`);
          if (el.scrollWidth > el.clientWidth + 1) out.push(`${el.className}: 가로잘림`);
        });
        // 슬라이드 자체 세로 넘침
        const s = document.querySelector('.slide');
        if (s && s.scrollHeight > H + 2) out.push(`slide 세로넘침(${s.scrollHeight})`);
        return out;
      });
      if (bad.length) issues.push(`[${content[i].id}] ${pg.name}: ${[...new Set(bad)].join(', ')}`);
    }
  }
  await browser.close();
  if (issues.length) { console.log('❌ 문제:\n' + issues.map(s => '  - ' + s).join('\n')); process.exit(1); }
  console.log(`✓ 매거진 검토 통과 — ${content.length}편 전 슬라이드 넘침 없음`);
})();
