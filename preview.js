// 수동 업로드용 재고 렌더 — 지정한 주제들을 사진 포함해 캐러셀 + 릴스로 생성 (발행 안 함)
// preview/<id>/ 에 slideNN.png, reel.mp4, manifest.json 저장.
const fs = require('fs');
const path = require('path');
const { renderMagCarousel, photoSlots } = require('./lib/render_mag');
const { fetchStockPhoto } = require('./lib/stock');
const { buildReel } = require('./lib/reel');
const content = require('./content');

const OUT = path.join(__dirname, 'preview');
const PHOTO_ROOT = path.join(__dirname, '.photos'); // gitignore 대상

// 렌더할 주제 인덱스 (기본: 3~5번째). PREVIEW_INDICES=2,3,4 처럼 덮어쓰기 가능
const INDICES = (process.env.PREVIEW_INDICES || '2,3,4')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const idx of INDICES) {
    const topic = content[idx % content.length];
    const nextTopic = content[(idx + 1) % content.length];
    const dir = path.join(OUT, topic.id);
    const pdir = path.join(PHOTO_ROOT, topic.id);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(pdir, { recursive: true });

    const photos = { cover: null, details: {} };
    const cp = path.join(pdir, 'cover.jpg');
    if (await fetchStockPhoto(topic.photo.cover, 'portrait', cp, idx)) photos.cover = cp;
    const slots = photoSlots(topic);
    for (let k = 0; k < slots.length; k++) {
      const si = slots[k];
      const pp = path.join(pdir, `d${si}.jpg`);
      if (await fetchStockPhoto(topic.photo.detail, 'landscape', pp, idx + k)) photos.details[si] = pp;
    }
    const op = path.join(pdir, 'outro.jpg');
    if (await fetchStockPhoto('cnc machining metal precision', 'portrait', op, idx)) photos.outro = op;

    const manifest = await renderMagCarousel(topic, nextTopic, 'makeit_magazine', photos, dir);
    try {
      const slides = manifest.files.map((f) => path.join(dir, f));
      await buildReel(slides, path.join(dir, 'reel.mp4'), { dur: 2.6, trans: 0.6 });
      console.log(`  🎬 ${topic.id} 릴스 생성 완료`);
    } catch (e) {
      console.log(`  릴스 실패(${topic.id}):`, e.message);
    }
    console.log(`✅ ${topic.id} 완료 — 캐러셀 ${manifest.files.length}장 + 릴스`);
  }
  console.log('전체 재고 렌더 완료:', INDICES.join(', '));
})().catch((e) => { console.error(e); process.exit(1); });
