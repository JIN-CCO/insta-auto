const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { getArt } = require('./art');

// MakeIT 블루 팔레트
const BLUE = '#2563EB';
const DEEP = '#1D4FC4';
const NAVY = '#12284B';
const PAPER = '#F4F7FB';
const SKY = '#DBEAFE';
const GRAY = '#5B6B85';

function css() {
  return `
  *{margin:0;padding:0;box-sizing:border-box;font-family:'Noto Sans CJK KR','Noto Sans KR',sans-serif;}
  body{width:1080px;height:1350px;}
  .slide{width:1080px;height:1350px;position:relative;overflow:hidden;padding:104px 84px;display:flex;flex-direction:column;}
  .cover{background:linear-gradient(165deg, #2E6BF2 0%, ${DEEP} 100%);color:#fff;}
  .stag{font-size:27px;font-weight:700;letter-spacing:1px;opacity:0.92;}
  .cq{font-size:94px;font-weight:900;line-height:1.14;letter-spacing:-2px;margin-top:58px;position:relative;z-index:2;}
  .cart{position:absolute;right:80px;bottom:140px;z-index:1;}
  .next .cq{margin-top:34px;}
  .nlabel{display:inline-block;align-self:flex-start;background:#fff;color:${BLUE};font-size:30px;font-weight:900;padding:12px 26px;border-radius:999px;margin-top:120px;}
  .nsub{font-size:34px;font-weight:700;margin-top:52px;opacity:0.9;}
  .nfollow{display:inline-block;align-self:flex-start;background:#fff;color:${BLUE};font-size:36px;font-weight:900;padding:20px 42px;border-radius:999px;margin-top:26px;box-shadow:0 10px 26px rgba(10,30,77,0.25);}
  .swipe{margin-left:auto;font-weight:900;}
  .body{background:${PAPER};color:${NAVY};}
  .chip{display:inline-block;align-self:flex-start;background:${SKY};color:${BLUE};font-size:28px;font-weight:800;padding:12px 26px;border-radius:999px;}
  .bh{font-size:76px;font-weight:900;line-height:1.16;letter-spacing:-2px;margin-top:44px;}
  .bd{font-size:36px;font-weight:500;color:${GRAY};line-height:1.55;margin-top:36px;max-width:880px;}
  .bart{margin-top:auto;margin-bottom:44px;align-self:center;}
  .answer{background:${NAVY};color:#fff;justify-content:center;}
  .chip.onnavy{background:rgba(255,255,255,0.12);color:#9EC2FF;align-self:flex-start;}
  .ah{font-size:82px;font-weight:900;line-height:1.18;letter-spacing:-2px;margin-top:46px;}
  .ad{font-size:36px;font-weight:500;color:#B9C8E4;line-height:1.55;margin-top:38px;max-width:880px;}
  .blist{margin-top:56px;display:flex;flex-direction:column;gap:34px;}
  .brow{display:flex;gap:28px;align-items:flex-start;background:#fff;border-radius:20px;padding:34px 38px;box-shadow:0 8px 22px rgba(10,30,77,0.08);}
  .bnum{min-width:56px;height:56px;border-radius:50%;background:${BLUE};color:#fff;font-size:30px;font-weight:900;display:flex;align-items:center;justify-content:center;}
  .btxt{font-size:35px;font-weight:600;line-height:1.45;padding-top:4px;}
  .foot{position:absolute;left:84px;right:84px;bottom:60px;display:flex;gap:26px;align-items:center;font-size:25px;font-weight:700;letter-spacing:1px;}
  .cover .foot{color:#fff;opacity:0.92;}
  .foot.light{color:#8FA3C8;}
  .foot.dark{color:${GRAY};}
  .logo{font-weight:900;letter-spacing:3px;}
  `;
}

function slideHTML(s, ctx) {
  const foot = (cls) => `<div class="foot ${cls}"><span class="logo">MAKEIT</span><span>@${ctx.handle}</span>${cls === 'coverfoot' ? '<span class="swipe">넘겨보기 →</span>' : ''}</div>`;
  if (s.type === 'cover') {
    return `<div class="slide cover">
      <div class="stag">${ctx.series} · #${String(ctx.no).padStart(2, '0')}</div>
      <div class="cq">${s.q}</div>
      ${s.art ? `<div class="cart">${getArt(s.art, { onBlue: true })}</div>` : ''}
      <div class="foot"><span class="logo">MAKEIT</span><span>@${ctx.handle}</span><span class="swipe">넘겨보기 →</span></div>
    </div>`;
  }
  if (s.type === 'next') {
    return `<div class="slide cover next">
      <div class="stag">${s.series} · #${String(s.no).padStart(2, '0')}</div>
      <div class="nlabel">다음 편</div>
      <div class="cq">${s.q}</div>
      <div class="nsub">더 많은 내용이 궁금하다면?</div>
      <div class="nfollow">계정 팔로우!</div>
      <div class="foot"><span class="logo">MAKEIT</span><span>@${ctx.handle}</span></div>
    </div>`;
  }
  if (s.type === 'answer') {
    return `<div class="slide answer">
      <div class="chip onnavy">${s.chip}</div>
      <div class="ah">${s.h}</div>
      ${s.d ? `<div class="ad">${s.d}</div>` : ''}
      <div class="foot light"><span class="logo">MAKEIT</span><span>@${ctx.handle}</span></div>
    </div>`;
  }
  if (s.type === 'list') {
    return `<div class="slide body">
      <div class="chip">${s.chip}</div>
      <div class="bh">${s.h}</div>
      <div class="blist">${s.items.map((it, i) => `
        <div class="brow"><div class="bnum">${i + 1}</div><div class="btxt">${it}</div></div>`).join('')}
      </div>
      <div class="foot dark"><span class="logo">MAKEIT</span><span>@${ctx.handle}</span></div>
    </div>`;
  }
  // body
  return `<div class="slide body">
    <div class="chip">${s.chip}</div>
    <div class="bh">${s.h}</div>
    ${s.d ? `<div class="bd">${s.d}</div>` : ''}
    ${s.art ? `<div class="bart">${getArt(s.art)}</div>` : ''}
    <div class="foot dark"><span class="logo">MAKEIT</span><span>@${ctx.handle}</span></div>
  </div>`;
}

// topic → [{name, html}] 슬라이드별 완성 HTML (렌더·검사 공용)
function slidePagesFor(topic, nextTopic, handle) {
  const ctx = { handle, series: topic.series, no: topic.no };
  const all = [
    { type: 'cover', q: topic.coverQ, art: topic.coverArt },
    ...topic.slides,
  ];
  if (nextTopic) {
    all.push({ type: 'next', q: nextTopic.coverQ, series: nextTopic.series, no: nextTopic.no });
  }
  return all.map((s, i) => ({
    name: `slide${String(i + 1).padStart(2, '0')}.png`,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css()}</style></head><body>${slideHTML(s, ctx)}</body></html>`,
  }));
}

// topic + nextTopic(다음 게시물, 예고용) → 슬라이드 PNG들 + manifest
async function renderCarousel(topic, nextTopic, handle, outDir) {
  const pages = slidePagesFor(topic, nextTopic, handle);

  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  const files = [];
  for (let i = 0; i < pages.length; i++) {
    await page.setContent(pages[i].html, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(outDir, pages[i].name) });
    files.push(pages[i].name);
  }
  await browser.close();

  let caption = topic.caption;
  if (nextTopic) caption += `\n다음 편: ${nextTopic.coverQ.replace(/<br>/g, ' ')}`;
  caption += `\n\n${topic.hashtags}`;

  const title = topic.coverQ.replace(/<br>/g, ' ');
  const manifest = { id: topic.id, title, series: topic.series, no: topic.no, caption, files };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return manifest;
}

module.exports = { renderCarousel, slidePagesFor };
