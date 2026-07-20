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
  /* 배경사진 공통 */
  .bgphoto{position:absolute;inset:0;background-size:cover;background-position:center;}
  .bg-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(150deg,#33507F,#0E1A30);color:rgba(255,255,255,0.55);font-size:34px;font-weight:800;}
  /* 커버 */
  .cov-grad{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(6,12,26,0.5) 0%,rgba(6,12,26,0.05) 34%,rgba(6,12,26,0.5) 66%,rgba(6,12,26,0.93) 100%);}
  .cov-top{position:absolute;top:58px;left:66px;right:66px;z-index:2;display:flex;justify-content:space-between;align-items:center;}
  .cov-bottom{position:absolute;left:66px;right:66px;bottom:104px;z-index:2;display:flex;flex-direction:column;align-items:flex-start;}
  .chip-w{background:${ACCENT};color:#fff;font-size:24px;font-weight:800;padding:11px 26px;border-radius:999px;margin-bottom:28px;letter-spacing:0.3px;}
  .ctitle{color:#fff;font-size:78px;font-weight:800;line-height:1.16;letter-spacing:-3.5px;text-shadow:0 4px 22px rgba(0,0,0,0.5);}
  .csub{color:rgba(255,255,255,0.9);font-size:29px;font-weight:600;margin-top:26px;text-shadow:0 2px 12px rgba(0,0,0,0.45);}
  .cov-line{width:66px;height:6px;background:${ACCENT};border-radius:3px;margin-top:34px;}
  /* 상단바 공통 */
  .u-brand{color:#fff;font-size:23px;font-weight:800;letter-spacing:0.5px;opacity:0.92;text-shadow:0 2px 8px rgba(0,0,0,0.45);}
  .u-dots{display:flex;gap:8px;}.u-dots i{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.45);}
  .u-dots i.on{width:24px;border-radius:5px;background:${ACCENT};}
  /* 본문: 풀 배경사진 + 유리 카드 */
  .g-grad{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(6,12,26,0.5) 0%,rgba(6,12,26,0.12) 24%,rgba(6,12,26,0.34) 54%,rgba(6,12,26,0.8) 100%);}
  .g-top{position:absolute;top:58px;left:66px;right:66px;z-index:3;display:flex;justify-content:space-between;align-items:center;}
  .g-card{position:absolute;left:48px;right:48px;bottom:48px;z-index:3;background:rgba(16,27,50,0.30);backdrop-filter:blur(30px) saturate(150%);-webkit-backdrop-filter:blur(30px) saturate(150%);border:1.5px solid rgba(255,255,255,0.22);border-radius:42px;padding:50px 50px 42px;box-shadow:0 26px 64px rgba(0,0,0,0.42);}
  .g-chip{display:inline-block;background:${ACCENT};color:#fff;font-size:23px;font-weight:800;padding:9px 24px;border-radius:999px;margin-bottom:22px;}
  .g-h{color:#fff;font-size:52px;font-weight:800;line-height:1.24;letter-spacing:-2.5px;}
  .g-d{color:rgba(255,255,255,0.93);font-size:31px;font-weight:500;line-height:1.5;margin-top:20px;}
  .g-d b{color:#fff;font-weight:800;}
  .g-items{margin-top:22px;display:flex;flex-direction:column;}
  .g-it{display:flex;gap:22px;align-items:flex-start;padding:19px 0;border-top:1.5px solid rgba(255,255,255,0.16);}
  .g-it:first-child{border-top:none;padding-top:2px;}
  .g-it span{font-size:28px;font-weight:900;color:#7FB0FF;min-width:44px;}
  .g-it p{font-size:30px;font-weight:600;color:#fff;line-height:1.36;padding-top:1px;}
  .g-diagram{margin-top:24px;background:#fff;border-radius:24px;padding:24px;display:flex;justify-content:center;}
  .g-foot{display:flex;justify-content:space-between;align-items:center;margin-top:28px;font-size:23px;font-weight:700;color:rgba(255,255,255,0.72);}
  /* 브랜드 아웃트로 */
  .outro{background:radial-gradient(120% 90% at 50% 30%,#1B2C4A 0%,#12203A 55%,#0C1526 100%);display:flex;align-items:center;justify-content:center;}
  .outro-fg{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 80px;}
  .mzlock{display:inline-flex;align-items:flex-end;margin-bottom:66px;}
  .mzsym{line-height:0;}
  .mztxt{font-family:'PoppinsMz','Noto Sans KR',sans-serif;font-weight:500;line-height:0.74;letter-spacing:-2px;margin-left:-20px;}
  .outro-q{color:#fff;font-size:70px;font-weight:800;line-height:1.26;letter-spacing:-3px;}
  .outro-follow{display:flex;align-items:center;gap:12px;background:${ACCENT};color:#fff;font-size:40px;font-weight:900;padding:22px 56px;border-radius:999px;margin-top:52px;box-shadow:0 16px 40px rgba(0,102,255,0.4);}
  .outro-handle{color:rgba(255,255,255,0.62);font-size:27px;font-weight:700;margin-top:40px;letter-spacing:1px;}
  `;
}

function bgPhoto(u) {
  return u ? `<div class="bgphoto" style="background-image:url('${u}')"></div>`
    : `<div class="bg-empty">🖼 사진</div>`;
}
function udots(total, active) {
  return `<span class="u-dots">${Array.from({ length: Math.min(total, 6) }, (_, i) => `<i class="${i === active ? 'on' : ''}"></i>`).join('')}</span>`;
}

function contentSlide(s, photoUri, handle, pageNo, total) {
  let inner = '';
  if (s.items) {
    inner = `<div class="g-items">${s.items.map((it, k) => `<div class="g-it"><span>${String(k + 1).padStart(2, '0')}</span><p>${it}</p></div>`).join('')}</div>`;
  } else {
    if (s.d) inner += `<div class="g-d">${s.d}</div>`;
    if (isDiagram(s.art)) inner += `<div class="g-diagram">${getArt(s.art)}</div>`;
  }
  const pg = `${String(pageNo).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  return `<div class="slide">
    ${bgPhoto(photoUri)}
    <div class="g-grad"></div>
    <div class="g-top"><span class="u-brand">MakeIT 매거진</span>${udots(total, Math.min(pageNo - 1, 5))}</div>
    <div class="g-card">
      ${s.chip ? `<span class="g-chip">${s.chip}</span>` : ''}
      <div class="g-h">${s.h}</div>
      ${inner}
      <div class="g-foot"><span>@${handle}</span><span>${pg}</span></div>
    </div>
  </div>`;
}

function magPages(topic, nextTopic, handle, photos) {
  const chip = SERIES_CHIP[topic.series] || topic.series;
  const contentSlides = topic.slides;
  const total = 1 + contentSlides.length + (nextTopic ? 1 : 0);
  const pages = [];

  pages.push({ name: 'slide01.png', html: `<div class="slide">
    ${bgPhoto(uri(photos.cover))}
    <div class="cov-grad"></div>
    <div class="cov-top"><span class="u-brand">MakeIT 매거진</span>${udots(total, 0)}</div>
    <div class="cov-bottom"><span class="chip-w">${chip}</span>
      <div class="ctitle">${topic.coverQ}</div>
      <div class="csub">매일 쓰는 물건에 숨은 설계 이야기</div>
      <div class="cov-line"></div></div>
  </div>` });

  contentSlides.forEach((s, i) => {
    const pageNo = i + 2;
    pages.push({ name: `slide${String(pageNo).padStart(2, '0')}.png`, html: contentSlide(s, uri(photos.details[i]), handle, pageNo, total) });
  });

  if (nextTopic) {
    const n = contentSlides.length + 2;
    pages.push({ name: `slide${String(n).padStart(2, '0')}.png`, html: `<div class="slide outro">
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
