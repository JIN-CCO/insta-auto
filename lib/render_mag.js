const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { getArt, makeitLogo, magazineLockup } = require('./art');
const { POPPINS_AGAZINE } = require('./fonts');

const ACCENT = '#0066FF';   // 브랜드 블루
const MINT = '#1FC7A0';     // 하이라이터(민트)
const NAVY = '#0C1526';

const SERIES_CHIP = {
  '이거 왜 이렇게 만들었을까?': '설계의 이유',
  '망가지는 데는 이유가 있다': '고장의 과학',
  '싼 제품과 비싼 제품': '가격의 비밀',
  '알고 보면 다 이유가 있다': '생활의 공학',
  '누가 이렇게 설계했을까?': '개선 제안',
};

function uri(p) { if (!p || !fs.existsSync(p)) return null; return `data:image/jpeg;base64,${fs.readFileSync(p).toString('base64')}`; }
function bgDiv(u, label) {
  return u ? `<div class="bg" style="background-image:url('${u}')"></div>`
    : `<div class="bg ph-empty"><span>🖼 ${label || '사진'}</span></div>`;
}
function isDiagram(art) { return !!art && (art.startsWith('flatVsCurved') || art === 'circleVsSquare' || art.startsWith('cornerStress')); }
function dots(total, active) {
  return `<span class="dots">${Array.from({ length: Math.min(total, 6) }, (_, i) => `<i class="${i === active ? 'on' : ''}"></i>`).join('')}</span>`;
}
// 커버 질문의 마지막 줄에 민트 하이라이터
function coverHL(q) {
  const parts = String(q).split('<br>');
  const last = parts.pop();
  const head = parts.length ? parts.join('<br>') + '<br>' : '';
  return `${head}<span class="mhl">${last}</span>`;
}

function css() {
  return `
  @font-face{font-family:'PoppinsMz';src:url('${POPPINS_AGAZINE}') format('truetype');font-weight:500;font-display:block;}
  *{margin:0;padding:0;box-sizing:border-box;font-family:'Noto Sans CJK KR','Noto Sans KR',sans-serif;word-break:keep-all;}
  body{width:1080px;height:1350px;}
  .slide{width:1080px;height:1350px;position:relative;overflow:hidden;background:${NAVY};}
  .bg{position:absolute;inset:0;background-size:cover;background-position:center;}
  .ph-empty{display:flex;align-items:center;justify-content:center;background:linear-gradient(150deg,#2A4A7A,#0C1526);color:rgba(255,255,255,0.5);font-size:34px;font-weight:800;}
  .dk{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(6,12,26,0.5) 0%,rgba(6,12,26,0.12) 28%,rgba(6,12,26,0.5) 58%,rgba(6,12,26,0.93) 100%);}
  /* 커버 */
  .c-top{position:absolute;top:60px;left:80px;right:80px;display:flex;justify-content:space-between;align-items:center;z-index:4;}
  .brand{color:#fff;font-size:30px;font-weight:900;text-shadow:0 2px 10px rgba(0,0,0,0.5);}
  .brand .m{color:#8FB6FF;}
  .dots{display:flex;gap:10px;}.dots i{width:11px;height:11px;border-radius:50%;background:rgba(255,255,255,0.5);}
  .dots i.on{width:30px;border-radius:6px;background:${ACCENT};}
  .c-bottom{position:absolute;left:80px;right:88px;bottom:140px;z-index:4;}
  .chip{display:inline-block;background:${ACCENT};color:#fff;font-size:30px;font-weight:900;padding:14px 32px;border-radius:999px;margin-bottom:30px;box-shadow:0 10px 26px rgba(0,102,255,0.5);}
  .ctitle{color:#fff;font-size:82px;font-weight:900;line-height:1.16;letter-spacing:-4px;text-shadow:0 4px 20px rgba(0,0,0,0.5);}
  .ctitle .mhl{background:${MINT};color:#fff;padding:2px 14px;border-radius:8px;-webkit-box-decoration-break:clone;box-decoration-break:clone;}
  .csub{color:rgba(255,255,255,0.9);font-size:31px;font-weight:600;margin-top:26px;text-shadow:0 2px 12px rgba(0,0,0,0.5);}
  /* 본문 공통 */
  .pg{position:absolute;top:74px;right:82px;color:#fff;font-size:30px;font-weight:800;z-index:4;text-shadow:0 2px 8px rgba(0,0,0,0.5);}
  .handle{position:absolute;bottom:56px;left:82px;color:rgba(255,255,255,0.72);font-size:28px;font-weight:800;z-index:4;text-shadow:0 2px 8px rgba(0,0,0,0.5);}
  .stack{position:absolute;left:80px;right:80px;bottom:120px;z-index:3;}
  .mtag{display:inline-block;background:${MINT};color:#fff;font-size:30px;font-weight:900;padding:11px 26px;border-radius:8px;transform:rotate(-1deg);box-shadow:0 8px 20px rgba(31,199,160,0.4);}
  .bh{color:#fff;font-size:56px;font-weight:900;line-height:1.2;letter-spacing:-2.5px;margin-top:24px;text-shadow:0 3px 16px rgba(0,0,0,0.55);}
  .card{background:rgba(8,14,28,0.62);border:1px solid rgba(255,255,255,0.14);border-radius:22px;padding:34px 38px;margin-top:26px;}
  .bd{color:#EAF1FF;font-size:37px;font-weight:600;line-height:1.5;}
  .bd b{color:#fff;font-weight:900;}
  .items{display:flex;flex-direction:column;gap:18px;}
  .item{display:flex;gap:18px;align-items:flex-start;}
  .item i{width:16px;height:16px;border-radius:50%;background:${MINT};margin-top:14px;flex:0 0 auto;}
  .item p{color:#EAF1FF;font-size:34px;font-weight:600;line-height:1.4;}
  .item p b{color:#fff;font-weight:900;}
  .dpanel{background:#fff;border-radius:20px;padding:30px 28px;margin-top:24px;display:flex;justify-content:center;}
  .dpanel svg{display:block;width:100%;height:auto;max-width:900px;}
  /* 브랜드 아웃트로 */
  .outro{display:flex;align-items:center;justify-content:center;}
  .outro-ov{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(8,14,28,0.68) 0%,rgba(8,14,28,0.6) 42%,rgba(8,14,28,0.88) 100%);}
  .outro-fg{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 80px;}
  .mzlock{display:inline-flex;align-items:flex-end;margin-bottom:64px;}
  .mzsym{line-height:0;}
  .mztxt{font-family:'PoppinsMz','Noto Sans KR',sans-serif;font-weight:500;line-height:0.74;letter-spacing:-2px;margin-left:-20px;}
  .outro-q{color:#fff;font-size:70px;font-weight:900;line-height:1.26;letter-spacing:-3px;}
  .outro-q .mhl{background:${MINT};color:#fff;padding:2px 14px;border-radius:8px;}
  .outro-follow{display:flex;align-items:center;gap:12px;background:${ACCENT};color:#fff;font-size:40px;font-weight:900;padding:22px 56px;border-radius:999px;margin-top:50px;box-shadow:0 16px 40px rgba(0,102,255,0.45);}
  .outro-handle{color:rgba(255,255,255,0.62);font-size:27px;font-weight:700;margin-top:38px;letter-spacing:1px;}
  `;
}

function contentSlide(s, photoUri, handle, pageNo, total) {
  let body = '';
  if (s.items) {
    body = `<div class="card"><div class="items">${s.items.map((it) => `<div class="item"><i></i><p>${it}</p></div>`).join('')}</div></div>`;
  } else if (isDiagram(s.art)) {
    body = `<div class="dpanel">${getArt(s.art)}</div>`;
  } else if (s.d) {
    body = `<div class="card"><div class="bd">${s.d}</div></div>`;
  }
  return `<div class="slide">
    ${bgDiv(photoUri, '사진')}
    <div class="dk"></div>
    <span class="pg">${String(pageNo).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
    <div class="stack">
      ${s.chip ? `<span class="mtag">${s.chip}</span>` : ''}
      <div class="bh">${s.h}</div>
      ${body}
    </div>
    <span class="handle">@${handle}</span>
  </div>`;
}

function magPages(topic, nextTopic, handle, photos) {
  const chip = SERIES_CHIP[topic.series] || topic.series;
  const contentSlides = topic.slides;
  const total = 1 + contentSlides.length + (nextTopic ? 1 : 0);
  const pages = [];

  pages.push({ name: 'slide01.png', html: `<div class="slide">
    ${bgDiv(uri(photos.cover), '커버')}
    <div class="dk"></div>
    <div class="c-top"><span class="brand"><span class="m">M</span>akeIT 매거진</span>${dots(total, 0)}</div>
    <div class="c-bottom"><span class="chip">${chip}</span>
      <div class="ctitle">${coverHL(topic.coverQ)}</div>
      <div class="csub">매일 쓰는 물건에 숨은 설계 이야기</div></div>
  </div>` });

  contentSlides.forEach((s, i) => {
    const pageNo = i + 2;
    pages.push({ name: `slide${String(pageNo).padStart(2, '0')}.png`, html: contentSlide(s, uri(photos.details[i]), handle, pageNo, total) });
  });

  if (nextTopic) {
    const n = contentSlides.length + 2;
    const outroBg = uri(photos.outro) || uri(photos.cover);
    pages.push({ name: `slide${String(n).padStart(2, '0')}.png`, html: `<div class="slide outro">
      ${outroBg ? `<div class="bg" style="background-image:url('${outroBg}')"></div><div class="outro-ov"></div>` : '<div class="bg ph-empty"></div>'}
      <div class="outro-fg">
        ${magazineLockup(ACCENT, '#ffffff', 172)}
        <div class="outro-q">더 많은 이야기가<br><span class="mhl">궁금하다면?</span></div>
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
  caption += `\n\n💬 댓글에 "견적" 남기면 → 도면 제작 견적받는 법을 바로 DM으로 보내드려요\n📌 저장해두고 다시 보기 · 📤 궁금해할 친구에게 공유하기`;
  caption += `\n\n${topic.hashtags}`;
  const title = topic.coverQ.replace(/<br>/g, ' ');
  // 스레드용 텍스트 훅 (커버 1장 + 텍스트)
  const teaserSlide = topic.slides.find((s) => s.d);
  const teaser = teaserSlide ? teaserSlide.d.replace(/<[^>]+>/g, '') : '매일 쓰는 물건에 숨은 설계 이야기';
  const tHash = (topic.hashtags || '').split(/\s+/).filter(Boolean).slice(0, 3).join(' ');
  const threadsText = `${title}\n\n${teaser}\n\n👉 전체 내용은 인스타그램 @${handle} 에서\n\n${tHash}`.trim();
  const manifest = { id: topic.id, title, series: topic.series, no: topic.no, caption, threadsText, files };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return manifest;
}

module.exports = { renderMagCarousel, photoSlots, magPages };
