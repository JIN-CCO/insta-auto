// 매거진 A안 프리뷰 — 실제 Pexels 사진으로 커버+본문 2장을 렌더 (발행 안 함)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { fetchStockPhoto } = require('./lib/stock');

const ACCENT = '#0066FF';
const NAVY = '#12284B';
const GRAY = '#5B6B85';
const OUT = path.join(__dirname, 'preview');

function dataUri(p) {
  if (!p || !fs.existsSync(p)) return null;
  return `data:image/jpeg;base64,${fs.readFileSync(p).toString('base64')}`;
}
function photoLayer(uri, label) {
  if (uri) return `<div class="photo" style="background-image:url('${uri}')"></div>`;
  return `<div class="photo ph-empty"><span>🖼 ${label || '사진'}</span></div>`;
}

function coverHTML(coverUri) {
  return `<div class="slide cover">
    ${photoLayer(coverUri, '커버 사진')}
    <div class="grad"></div>
    <div class="topbar"><span class="brand">MakeIT 매거진</span>
      <span class="dots"><i class="on"></i><i></i><i></i><i></i><i></i></span></div>
    <div class="cbottom">
      <span class="chip">설계의 세계</span>
      <div class="ctitle">생수병 바닥은<br>왜 <b>꽃 모양</b>일까</div>
      <div class="csub">매일 쓰는 물건에 숨은 설계 이야기</div>
    </div>
  </div>`;
}
function contentHTML(photoUri) {
  return `<div class="slide content">
    <div class="ctop">${photoLayer(photoUri, '본문 사진')}</div>
    <div class="cbody">
      <div class="mdots"><i></i><i></i><i class="on"></i><i></i><i></i></div>
      <div class="bh">압력을 견디는<br>꽃 모양 바닥</div>
      <ul class="blist">
        <li><b>탄산·충격</b>을 곡면 전체로 분산시켜<br>얇은 플라스틱으로도 버틴다</li>
        <li>평평하면 바닥이 <b>부풀어 흔들리고</b><br>같은 강도에 재료가 더 든다</li>
      </ul>
      <div class="foot"><span>@makeit_pedia</span><span>3 / 6</span></div>
    </div>
  </div>`;
}

function page(inner) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box;font-family:'Noto Sans CJK KR','Noto Sans KR',sans-serif;word-break:keep-all;}
  body{width:1080px;height:1350px;}
  .slide{width:1080px;height:1350px;position:relative;overflow:hidden;background:#fff;}
  .photo{position:absolute;inset:0;background-size:cover;background-position:center;}
  .ph-empty{display:flex;align-items:center;justify-content:center;background:linear-gradient(150deg,#6B8FBF,#2A3F5F);color:rgba(255,255,255,0.7);font-size:34px;font-weight:800;}
  .grad{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(10,20,45,0.25) 0%,rgba(10,20,45,0) 32%,rgba(10,20,45,0.55) 68%,rgba(10,20,45,0.9) 100%);}
  .topbar{position:absolute;top:60px;left:0;right:0;display:flex;flex-direction:column;align-items:center;gap:16px;z-index:2;}
  .brand{color:#fff;font-size:26px;font-weight:800;letter-spacing:1px;text-shadow:0 2px 8px rgba(0,0,0,0.4);}
  .dots{display:flex;gap:9px;}.dots i{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,0.5);}
  .dots i.on{width:26px;border-radius:6px;background:${ACCENT};}
  .cbottom{position:absolute;left:0;right:0;bottom:150px;z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 80px;}
  .chip{background:rgba(255,255,255,0.22);color:#fff;font-size:26px;font-weight:800;padding:12px 28px;border-radius:999px;margin-bottom:26px;}
  .ctitle{color:#fff;font-size:84px;font-weight:900;line-height:1.18;letter-spacing:-2px;text-shadow:0 3px 18px rgba(0,0,0,0.45);}
  .ctitle b{color:#4D9BFF;}
  .csub{color:rgba(255,255,255,0.92);font-size:32px;font-weight:600;margin-top:24px;text-shadow:0 2px 12px rgba(0,0,0,0.4);}
  .content .ctop{position:absolute;top:0;left:0;right:0;height:660px;overflow:hidden;}
  .cbody{position:absolute;top:660px;left:0;right:0;bottom:0;background:#fff;padding:56px 80px;}
  .mdots{display:flex;gap:9px;margin-bottom:30px;}.mdots i{width:9px;height:9px;border-radius:50%;background:#D5DEEC;}
  .mdots i.on{width:26px;border-radius:6px;background:${ACCENT};}
  .bh{font-size:66px;font-weight:900;color:${NAVY};line-height:1.2;letter-spacing:-2px;}
  .blist{list-style:none;margin-top:44px;display:flex;flex-direction:column;gap:34px;}
  .blist li{position:relative;padding-left:44px;font-size:37px;font-weight:500;color:#38455C;line-height:1.42;}
  .blist li:before{content:'';position:absolute;left:0;top:14px;width:20px;height:20px;border-radius:50%;background:${ACCENT};}
  .blist b{color:${NAVY};font-weight:800;}
  .foot{position:absolute;left:80px;right:80px;bottom:50px;display:flex;justify-content:space-between;font-size:26px;font-weight:700;color:${GRAY};}
  </style></head><body>${inner}</body></html>`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  // 실제 Pexels 사진 가져오기 (커버=세로, 본문=가로)
  await fetchStockPhoto('water bottle minimal studio', 'portrait', path.join(OUT, 'cover.jpg'), 0);
  await fetchStockPhoto('plastic water bottles production', 'landscape', path.join(OUT, 'content.jpg'), 0);

  const coverUri = dataUri(path.join(OUT, 'cover.jpg'));
  const contentUri = dataUri(path.join(OUT, 'content.jpg'));

  const browser = await chromium.launch();
  const pg = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await pg.setContent(page(coverHTML(coverUri)), { waitUntil: 'networkidle' });
  await pg.screenshot({ path: path.join(OUT, 'mag_cover.png') });
  await pg.setContent(page(contentHTML(contentUri)), { waitUntil: 'networkidle' });
  await pg.screenshot({ path: path.join(OUT, 'mag_content.png') });
  await browser.close();
  console.log('프리뷰 렌더 완료:', coverUri ? '커버사진 O' : '커버사진 X(placeholder)', contentUri ? '본문사진 O' : '본문사진 X');
})().catch((e) => { console.error(e); process.exit(1); });
