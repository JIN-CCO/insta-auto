// 매거진 프리뷰 — 실제 Pexels 사진으로 한 편(생수병) 전체를 렌더 (발행 안 함)
const fs = require('fs');
const path = require('path');
const { renderMagCarousel, photoSlots } = require('./lib/render_mag');
const { fetchStockPhoto } = require('./lib/stock');
const content = require('./content');

const OUT = path.join(__dirname, 'preview');
const PDIR = path.join(OUT, '_photos');

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(PDIR, { recursive: true });

  const topic = content[0];
  const nextTopic = content[1];

  const photos = { cover: null, details: {} };
  const cp = path.join(PDIR, 'cover.jpg');
  if (await fetchStockPhoto(topic.photo.cover, 'portrait', cp, 0)) photos.cover = cp;
  const slots = photoSlots(topic);
  for (let k = 0; k < slots.length; k++) {
    const si = slots[k];
    const pp = path.join(PDIR, 'd' + si + '.jpg');
    if (await fetchStockPhoto(topic.photo.detail, 'landscape', pp, k)) photos.details[si] = pp;
  }

  const np = path.join(PDIR, 'next.jpg');
  if (await fetchStockPhoto(nextTopic.photo.cover, 'landscape', np, 0)) photos.next = np;

  await renderMagCarousel(topic, nextTopic, 'makeit_pedia', photos, OUT);
  console.log('프리뷰 완료 — 커버사진', photos.cover ? 'O' : 'X', '| 본문사진', Object.keys(photos.details).length + '장');
})().catch(function (e) { console.error(e); process.exit(1); });
