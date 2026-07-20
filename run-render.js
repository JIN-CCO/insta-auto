// 1단계: 다음 주제의 사진을 가져와 매거진 캐러셀을 렌더하고 manifest를 만든다.
const fs = require('fs');
const path = require('path');
const { renderMagCarousel, photoSlots } = require('./lib/render_mag');
const { fetchStockPhoto } = require('./lib/stock');
const content = require('./content');

const HANDLE = process.env.IG_HANDLE || 'makeit_pedia';
const STATE_FILE = path.join(__dirname, 'state.json');
const PHOTO_DIR = path.join(__dirname, '.photos');

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return { nextIndex: 0 }; }
}

(async () => {
  const state = loadState();
  const idx = state.nextIndex % content.length;
  const topic = content[idx];
  const nextTopic = content[(idx + 1) % content.length];

  const runId = process.env.GITHUB_RUN_ID || String(Date.now());
  const folder = `${topic.id}-${runId}`;
  const outDir = path.join(__dirname, 'output', folder);
  fs.mkdirSync(PHOTO_DIR, { recursive: true });

  // 사진 가져오기 (없으면 placeholder로 대체됨)
  const photos = { cover: null, details: {} };
  const coverPath = path.join(PHOTO_DIR, 'cover.jpg');
  if (await fetchStockPhoto(topic.photo.cover, 'portrait', coverPath, idx)) photos.cover = coverPath;

  const slots = photoSlots(topic);
  for (let k = 0; k < slots.length; k++) {
    const si = slots[k];
    const pp = path.join(PHOTO_DIR, `d${si}.jpg`);
    if (await fetchStockPhoto(topic.photo.detail, 'landscape', pp, idx + k)) photos.details[si] = pp;
  }
  // 다음 편 미리보기 사진
  const nextPath = path.join(PHOTO_DIR, 'next.jpg');
  if (nextTopic && await fetchStockPhoto(nextTopic.photo.cover, 'landscape', nextPath, 0)) photos.next = nextPath;

  const manifest = await renderMagCarousel(topic, nextTopic, HANDLE, photos, outDir);
  manifest.folder = folder;
  manifest.index = idx;
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(__dirname, '.current_post'), folder);
  fs.writeFileSync(path.join(__dirname, '.post_title'), `${manifest.title} (${topic.series} #${String(topic.no).padStart(2, '0')})`);

  const remaining = content.length - idx - 1;
  console.log(`렌더 완료: ${topic.id} · ${topic.series} #${topic.no} (${idx + 1}/${content.length}) → ${manifest.files.length}장, 사진 ${photos.cover ? 1 : 0}+${Object.keys(photos.details).length}`);
  if (remaining <= 3) console.log(`⚠️  남은 주제 ${remaining}개. content.js에 새 주제 추가 권장.`);
})().catch((e) => { console.error(e); process.exit(1); });
