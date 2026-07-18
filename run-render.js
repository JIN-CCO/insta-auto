// 1단계: 다음 주제를 골라 캐러셀 이미지를 렌더링하고 manifest를 만든다.
const fs = require('fs');
const path = require('path');
const { renderCarousel } = require('./lib/render');
const content = require('./content');

const HANDLE = process.env.IG_HANDLE || 'makeit_pedia';
const STATE_FILE = path.join(__dirname, 'state.json');

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { nextIndex: 0 };
  }
}

(async () => {
  const state = loadState();
  const idx = state.nextIndex % content.length;
  const topic = content[idx];
  const nextTopic = content[(idx + 1) % content.length]; // 다음 편 예고용

  const runId = process.env.GITHUB_RUN_ID || String(Date.now());
  const folder = `${topic.id}-${runId}`;
  const outDir = path.join(__dirname, 'output', folder);

  const manifest = await renderCarousel(topic, nextTopic, HANDLE, outDir);
  manifest.folder = folder;
  manifest.index = idx;
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(__dirname, '.current_post'), folder);

  const remaining = content.length - idx - 1;
  console.log(`렌더 완료: ${topic.id} · ${topic.series} #${topic.no} (${idx + 1}/${content.length}) → output/${folder} [${manifest.files.length}장]`);
  if (remaining <= 3) {
    console.log(`⚠️  남은 주제 ${remaining}개. content.js에 새 주제를 추가하세요 (다 쓰면 처음부터 반복됩니다).`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
