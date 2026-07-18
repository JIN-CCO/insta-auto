// 2단계: 방금 렌더한(그리고 GitHub에 push된) 이미지를 인스타에 캐러셀로 발행한다.
const fs = require('fs');
const path = require('path');
const { publishCarousel } = require('./lib/publish');

const IG_USER_ID = process.env.IG_USER_ID;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY; // "owner/repo"
const BRANCH = process.env.GITHUB_REF_NAME || 'main';
const STATE_FILE = path.join(__dirname, 'state.json');

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { nextIndex: 0 };
  }
}

(async () => {
  if (!IG_USER_ID || !IG_ACCESS_TOKEN) throw new Error('IG_USER_ID / IG_ACCESS_TOKEN 환경변수가 없습니다.');
  if (!REPO) throw new Error('GITHUB_REPOSITORY 환경변수가 없습니다 (로컬 테스트면 직접 지정하세요).');

  const folder = fs.readFileSync(path.join(__dirname, '.current_post'), 'utf8').trim();
  const manifestPath = path.join(__dirname, 'output', folder, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // GitHub raw 공개 URL로 이미지 주소 구성
  const imageUrls = manifest.files.map(
    (f) => `https://raw.githubusercontent.com/${REPO}/${BRANCH}/output/${folder}/${f}`
  );

  console.log(`발행 시작: ${manifest.id} (이미지 ${imageUrls.length}장)`);
  const mediaId = await publishCarousel(IG_USER_ID, IG_ACCESS_TOKEN, imageUrls, manifest.caption);
  console.log(`✅ 발행 완료! media id: ${mediaId}`);

  // 성공 시에만 다음 주제로 인덱스 이동
  const state = loadState();
  state.nextIndex = (typeof manifest.index === 'number' ? manifest.index : state.nextIndex) + 1;
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log(`다음 인덱스: ${state.nextIndex}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
