const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { getArt } = require('./art');

const ACCENT = '#0066FF';
const ACCENT2 = '#4D9BFF';
const NAVY = '#12284B';
const GRAY = '#5B6B85';
const LIGHT = '#F4F7FB';

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
  return `<span class="dots">${Array.from({ length: Math.min(total, 6) }, (_, i) => `<i class="${i === active ? 'on' : ''}"></i>`).join('')}</span>`;
}

function css() {
  return `
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
  /* 사진 본문 */
  .p-top{position:absolute;top:0;left:0;right:0;height:640px;overflow:hidden;}
  .p-body{position:absolute;top:640px;left:0;right:0;bottom:0;background:#fff;padding:52px 80px;display:flex;flex-direction:column;}
  .mdots{display:flex;gap:9px;margin-bottom:26px;}.mdots i{width:9px;height:9px;border-radius:50%;background:#D5DEEC;}
  .mdots i.on{width:26px;border-radius:6px;background:${ACCENT};}
  .bh{font-size:56px;font-weight:800;color:${NAVY};line-height:1.22;letter-spacing:-3px;}
  .bd{font-size:34px;font-weight:500;color:#38455C;line-height:1.5;margin-top:26px;}
  .bd b{color:${NAVY};font-weight:800;}
  /* 결론(색 카드) */
  .answer{background:${NAVY};color:#fff;padding:96px 84px;display:flex;flex-direction:column;justify-content:center;height:1350px;}
  .chip-d{align-self:flex-start;background:rgba(255,255,255,0.14);color:${ACCENT2};font-size:25px;font-weight:800;letter-spacing:2px;padding:11px 24px;border-radius:999px;}
  .ah{font-size:72px;font-weight:800;line-height:1.24;letter-spacing:-3px;margin-top:40px;}
  .ad{font-size:34px;font-weight:500;color:#B9C8E4;line-height:1.55;margin-top:34px;}
  /* 리스트 카드 */
  .card{background:${LIGHT};height:1350px;padding:90px 84px;display:flex;flex-direction:column;}
  .chip-l{align-self:flex-start;background:#E3ECFB;color:${ACCENT};font-size:26px;font-weight:800;padding:12px 26px;border-radius:999px;}
  .lh{font-size:60px;font-weight:800;color:${NAVY};line-height:1.2;letter-spacing:-3px;margin-top:36px;}
  .items{margin-top:48px;display:flex;flex-direction:column;}
  .it{display:flex;gap:28px;align-items:flex-start;padding:32px 4px;border-top:2px solid #DCE3EE;}
  .it:first-child{border-top:2px solid ${NAVY};}
  .no{font-size:34px;font-weight:900;color:${ACCENT};min-width:52px;}
  .it p{font-size:35px;font-weight:600;color:#38455C;line-height:1.4;padding-top:2px;}
  /* 도식 카드 */
  .dcard{background:${LIGHT};height:1350px;padding:90px 84px;display:flex;flex-direction:column;}
  .dh{font-size:60px;font-weight:800;color:${NAVY};line-height:1.2;letter-spacing:-3px;margin-top:36px;}
  .dart{margin-top:auto;margin-bottom:auto;align-self:center;}
  /* 다음편 */
  .next{background:${ACCENT};color:#fff;height:1350px;padding:96px 84px;display:flex;flex-direction:column;justify-content:center;}
  .nlabel{align-self:flex-start;background:#fff;color:${ACCENT};font-size:28px;font-weight:900;padding:12px 28px;border-radius:999px;}
  .nq{font-size:72px;font-weight:800;line-height:1.22;letter-spacing:-3px;margin-top:36px;}
  .nsub{font-size:34px;font-weight:700;margin-top:44px;opacity:0.95;}
  .nfollow{align-self:flex-start;background:#fff;color:${ACCENT};font-size:38px;font-weight:900;padding:20px 44px;border-radius:999px;margin-top:22px;box-shadow:0 12px 30px rgba(0,0,0,0.2);}
  /* 공통 푸터 */
  .foot{position:absolute;left:80px;right:80px;bottom:48px;display:flex;justify-content:space-between;align-items:center;font-size:25px;font-weight:700;color:${GRAY};}
  .answer .foot,.next .foot{color:rgba(255,255,255,0.7);position:static;margin-top:56px;padding:0;}
  `;
}

function foot(handle, page, total, cls) {
  const pg = page ? `${String(page).padStart(2, '0')} / ${String(total).padStart(2, '0')}` : '';
  return `<div class="foot ${cls || ''}"><span>@${handle}</span><span>${pg}</span></div>`;
}

// topic + photos → 슬라이드 페이지 HTML 배열
function magPages(topic, nextTopic, handle, photos) {
  const chip = SERIES_CHIP[topic.series] || topic.series;
  const pages = [];
  const contentSlides = topic.slides;
  const total = 1 + contentSlides.length + (nextTopic ? 1 : 0);

  // 1) 커버
  pages.push({ name: 'slide01.png', html: `<div class="slide">
    ${photoDiv(uri(photos.cover), '커버')}
    <div class="grad"></div>
    <div class="topbar"><span class="brand">MakeIT 매거진</span>${dots(total, 0)}</div>
    <div class="cbottom"><span class="chip-w">${chip}</span>
      <div class="ctitle">${topic.coverQ}</div>
      <div class="csub">매일 쓰는 물건에 숨은 설계 이야기</div></div>
  </div>` });

  // 2) 본문 슬라이드들
  contentSlides.forEach((s, i) => {
    const pageNo = i + 2;
    let inner;
    if (s.type === 'answer') {
      inner = `<div class="slide answer">
        <span class="chip-d">${s.chip || '결론'}</span>
        <div class="ah">${s.h}</div>${s.d ? `<div class="ad">${s.d}</div>` : ''}
        ${foot(handle, pageNo, total, 'x')}</div>`;
    } else if (s.type === 'list') {
      inner = `<div class="slide card">
        <span class="chip-l">${s.chip || ''}</span>
        <div class="lh">${s.h}</div>
        <div class="items">${s.items.map((it, k) => `<div class="it"><span class="no">${String(k + 1).padStart(2, '0')}</span><p>${it}</p></div>`).join('')}</div>
        ${foot(handle, pageNo, total)}</div>`;
    } else if (s.type === 'body' && isDiagram(s.art)) {
      inner = `<div class="slide dcard">
        <span class="chip-l">${s.chip || '원리'}</span>
        <div class="dh">${s.h}</div>
        <div class="dart">${getArt(s.art)}</div>
        ${foot(handle, pageNo, total)}</div>`;
    } else {
      // 사진 본문
      inner = `<div class="slide">
        <div class="p-top">${photoDiv(uri(photos.details[i]), '사진')}</div>
        <div class="p-body">${dots(total, Math.min(pageNo - 1, 5))}
          <div class="bh">${s.h}</div>${s.d ? `<div class="bd">${s.d}</div>` : ''}
          ${foot(handle, pageNo, total)}</div></div>`;
    }
    pages.push({ name: `slide${String(pageNo).padStart(2, '0')}.png`, html: inner });
  });

  // 3) 다음 편
  if (nextTopic) {
    const n = contentSlides.length + 2;
    pages.push({ name: `slide${String(n).padStart(2, '0')}.png`, html: `<div class="slide next">
      <span class="nlabel">다음 편</span>
      <div class="nq">${nextTopic.coverQ}</div>
      <div class="nsub">더 많은 내용이 궁금하다면?</div>
      <div class="nfollow">계정 팔로우!</div>
      ${foot(handle, null, null, 'x')}</div>` });
  }
  return pages.map((p) => ({ name: p.name, html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css()}</style></head><body>${p.html}</body></html>` }));
}

// 사진 슬롯 정보(어떤 본문 슬라이드가 사진을 쓰는지) — run-render가 사진을 미리 받기 위해 사용
function photoSlots(topic) {
  const slots = [];
  topic.slides.forEach((s, i) => {
    if (s.type === 'body' && !isDiagram(s.art)) slots.push(i);
  });
  return slots; // 사진이 필요한 slides 인덱스 배열
}

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
