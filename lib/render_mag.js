const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { getArt, makeitLogo, magazineLockup } = require('./art');
const { POPPINS_AGAZINE } = require('./fonts');

const ACCENT = '#0066FF';
const NAVY = '#12284B';
const GRAY = '#5B6B85';

const SERIES_CHIP = {
  '이거 왜 이렇게 만들었을까?': '설계의 이유',
  '망가지는 데는 이유가 있다': '고장의 과학',
  '싼 제품과 비싼 제품': '가격의 비밀',
  '알고 보면 다 이유가 있다': '생활의 공학',
  '누가 이렇게 설계했을까?': '개선 제안',
};

function uri(p) { if (!p || !fs.existsSync(p)) return null; return `data:image/jpeg;base64,${fs.readFileSync(p).toString('base64')}`; }
function photoDiv(u, label) {
  return u ? `<div class="photo" style="background-image:url('${u}')"></div>`
    : `<div class="photo ph-empty"><span>🖼 ${label || '사진'}</span></div>`;
}
function isDiagram(art) { return !!art && (art.startsWith('flatVsCurved') || art === 'circleVsSquare' || art.startsWith('cornerStress')); }
function dots(total, active) {
  return `<span class="mdots">${Array.from({ length: Math.min(total, 6) }, (_, i) => `<i class="${i === active ? 'on' : ''}"></i>`).join('')}</span>`;
}

function css() {
  return `
  @font-face{font-family:'PoppinsMz';src:url('${POPPINS_AGAZINE}') format('truetype');font-weight:500;font-display:block;}
  *{margin:0;padding:0;box-sizing:border-box;font-family:'Noto Sans CJK KR','Noto Sans KR',sans-serif;word-break:keep-all;}
  body{width:1080px;height:1350px;}
  .slide{width:1080px;height:1350px;position:relative;overflow:hidden;background:#fff;}
  .photo{position:absolute;inset:0;background-size:cover;background-position:center;}
  .ph-empty{display:flex;align-items:center;justify-content:center;background:linear-gradient(150deg,#6B8FBF,#2A3F5F);color:rgba(255,255,255,0.7);font-size:34px;font-weight:800;}
  /* 커버 */
  .grad{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(10,20,45,0.25) 0%,rgba(10,20,45,0) 32%,rgba(10,20,45,0.55) 66%,rgba(10,20,45,0.9) 100%);}
  .topbar{position:absolute;top:60px;left:0;right:0;display:flex;flex-direction:column;align-items:center;gap:16px;z-index:2;}
  .brand{color:#fff;font-size:26px;font-weight:800;letter-spacing:1px;text-shadow:0 2px 8px rgba(0,0,0,0.4);}
  .dots{display:flex;gap:9px;}.dots i{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,0.5);}
  .dots i.on{width:26px;border-radius:6px;background:${ACCENT};}
  .cbottom{position:absolute;left:0;right:0;bottom:150px;z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 80px;}
  .chip-w{background:rgba(255,255,255,0.22);color:#fff;font-size:24px;font-weight:800;padding:12px 28px;border-radius:999px;margin-bottom:26px;}
  .ctitle{color:#fff;font-size:74px;font-weight:800;line-height:1.2;letter-spacing:-3.5px;text-shadow:0 3px 18px rgba(0,0,0,0.45);}
  .csub{color:rgba(255,255,255,0.92);font-size:30px;font-weight:600;margin-top:24px;text-shadow:0 2px 12px rgba(0,0,0,0.4);}
  /* 사진 + 카드 (모든 본문 공통) */
  .p-top{position:absolute;top:0;left:0;right:0;height:560px;overflow:hidden;}
  .p-body{position:absolute;top:560px;left:0;right:0;bottom:0;background:#fff;padding:48px 80px;display:flex;flex-direction:column;}
  .mdots{display:flex;gap:9px;margin-bottom:22px;}.mdots i{width:9px;height:9px;border-radius:50%;background:#D5DEEC;}
  .mdots i.on{width:26px;border-radius:6px;background:${ACCENT};}
  .chip-l{align-self:flex-start;background:#E3ECFB;color:${ACCENT};font-size:24px;font-weight:800;padding:9px 22px;border-radius:999px;margin-bottom:18px;}
  .bh{font-size:54px;font-weight:800;color:${NAVY};line-height:1.22;letter-spacing:-3px;}
  .bd{font-size:33px;font-weight:500;color:#38455C;line-height:1.5;margin-top:22px;}
  .bd b{color:${NAVY};font-weight:800;}
  .citems{margin-top:26px;display:flex;flex-direction:column;}
  .cit{display:flex;gap:24px;align-items:flex-start;padding:22px 2px;border-top:2px solid #E2E8F2;}
  .cit:first-child{border-top:2px solid ${NAVY};}
  .cit span{font-size:30px;font-weight:900;color:${ACCENT};min-width:46px;}
  .cit p{font-size:32px;font-weight:600;color:#38455C;line-height:1.38;padding-top:2px;}
  .cart-in{margin-top:auto;margin-bottom:10px;align-self:center;transform:scale(0.92);transform-origin:center;}
  .nsub2{font-size:32px;font-weight:700;color:${GRAY};margin-top:24px;}
  .nfollow2{align-self:flex-start;background:${ACCENT};color:#fff;font-size:34px;font-weight:900;padding:16px 40px;border-radius:999px;margin-top:20px;box-shadow:0 10px 26px rgba(0,102,255,0.28);}
  .foot{position:absolute;left:80px;right:80px;bottom:44px;display:flex;justify-content:space-between;align-items:center;font-size:25px;font-weight:700;color:${GRAY};}
  /* 브랜드 아웃트로 */
  .outro{position:relative;background:#0C1526;display:flex;align-items:center;justify-content:center;}
  .outro-photo{position:absolute;inset:0;background-size:cover;background-position:center;}
  .outro-ov{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(8,14,28,0.66) 0%,rgba(8,14,28,0.6) 42%,rgba(8,14,28,0.86) 100%);}
  .outro-fg{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 80px;}
  .mzlock{display:inline-flex;align-items:flex-end;margin-bottom:66px;}
  .mzsym{line-height:0;}
  .mztxt{font-family:'PoppinsMz','Noto Sans KR',sans-serif;font-weight:500;line-height:0.74;letter-spacing:-2px;margin-left:-20px;}
  .outro-q{color:#fff;font-size:70px;font-weight:800;line-height:1.26;letter-spacing:-3px;}
  .outro-follow{display:flex;align-items:center;gap:12px;background:${ACCENT};color:#fff;font-size:40px;font-weight:900;padding:22px 56px;border-radius:999px;margin-top:52px;box-shadow:0 16px 40px rgba(0,102,255,0.4);}
  .outro-handle{color:rgba(255,255,255,0.62);font-size:27px;font-weight:700;margin-top:40px;letter-spacing:1px;}
  `;
}

function foot(handle, page, total, light) {
  const pg = page ? `${String(page).padStart(2, '0')} / ${String(total).padStart(2, '0')}` : '';
  return `<div class="foot"><span>@${handle}</span><span>${pg}</span></div>`;
}

function contentSlide(s, photoUri, handle, pageNo, total) {
  let inner = '';
  if (s.items) {
    inner = `<div class="citems">${s.items.map((it, k) => `<div class="cit"><span>${String(k + 1).padStart(2, '0')}</span><p>${it}</p></div>`).join('')}</div>`;
  } else {
    if (s.d) inner += `<div class="bd">${s.d}</div>`;
    if (isDiagram(s.art)) inner += `<div class="cart-in">${getArt(s.art)}</div>`;
  }
  return `<div class="slide">
    <div class="p-top">${photoDiv(photoUri, '사진')}</div>
    <div class="p-body">
      ${dots(total, Math.min(pageNo - 1, 5))}
      ${s.chip ? `<span class="chip-l">${s.chip}</span>` : ''}
      <div class="bh">${s.h}</div>
      ${inner}
      ${foot(handle, pageNo, total)}
    </div>
  </div>`;
}

function magPages(topic, nextTopic, handle, photos) {
  const chip = SERIES_CHIP[topic.series] || topic.series;
  const contentSlides = topic.slides;
  const total = 1 + contentSlides.length + (nextTopic ? 1 : 0);
  const pages = [];

  pages.push({ name: 'slide01.png', html: `<div class="slide">
    ${photoDiv(uri(photos.cover), '커버')}
    <div class="grad"></div>
    <div class="topbar"><span class="brand">MakeIT 매거진</span>${dots(total, 0)}</div>
    <div class="cbottom"><span class="chip-w">${chip}</span>
      <div class="ctitle">${topic.coverQ}</div>
      <div class="csub">매일 쓰는 물건에 숨은 설계 이야기</div></div>
  </div>` });

  contentSlides.forEach((s, i) => {
    const pageNo = i + 2;
    pages.push({ name: `slide${String(pageNo).padStart(2, '0')}.png`, html: contentSlide(s, uri(photos.details[i]), handle, pageNo, total) });
  });

  if (nextTopic) {
    const n = contentSlides.length + 2;
    const outroBg = uri(photos.cover);
    pages.push({ name: `slide${String(n).padStart(2, '0')}.png`, html: `<div class="slide outro">
      ${outroBg ? `<div class="outro-photo" style="background-image:url('${outroBg}')"></div><div class="outro-ov"></div>` : ''}
      <div class="outro-fg">
        ${magazineLockup(ACCENT, '#ffffff', 172)}
        <div class="outro-q">더 많은 이야기가<br>궁금하다면?</div>
        <div class="outro-follow">＋ 팔로우 하기</div>
        <div class="outro-handle">@${handle}</div>
      </div>
    </div>` });
  }
  return pages.map((p) => ({ name: p.name, html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css()}</style></head><body>${p.html}</body></html>` }));
}

// 모든 본문 슬라이드가 사진을 사용 → 전 인덱스 반환
function photoSlots(topic) { return topic.slides.map((_, i) => i); }

async function renderMagCarousel(topic, nextTopic, handle, photos, outDir) {
  const pages = magPages(topic, nextTopic, handle, photos);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  const files = [];
  for (const pg of pages) {
    await page.setContent(pg.html, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(outDir, pg.name) });
    files.push(pg.name);
  }
  await browser.close();

  let caption = topic.caption;
  if (nextTopic) caption += `\n다음 편: ${nextTopic.coverQ.replace(/<br>/g, ' ')}`;
  caption += `\n\n📌 저장해두고 다음에 또 보기\n📤 이거 궁금해할 친구에게 보내주기`;
  caption += `\n\n${topic.hashtags}`;
  const title = topic.coverQ.replace(/<br>/g, ' ');
  const manifest = { id: topic.id, title, series: topic.series, no: topic.no, caption, files };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return manifest;
}

module.exports = { renderMagCarousel, photoSlots, magPages };
