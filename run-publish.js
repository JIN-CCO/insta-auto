// 2단계: 방금 렌더한(그리고 GitHub에 push된) 이미지를 인스타에 캐러셀로 발행한다.
const fs = require('fs');
const path = require('path');
const { publishCarousel, publishReel, getPermalink } = require('./lib/publish');
const { publishThreadsImage, getThreadsPermalink } = require('./lib/threads');
const { notifySlack } = require('./lib/notify');

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
  // 일시정지 스위치 — state.json의 paused:true 이면 발행하지 않고 종료 (인스타 차단 대기용)
  if (loadState().paused) {
    console.log('⏸️  일시정지(paused) 상태입니다 — 인스타 발행을 건너뜁니다.');
    return;
  }
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

  let permalink = null;
  try { permalink = await getPermalink(mediaId, IG_ACCESS_TOKEN); } catch {}

  // 넘기는 릴스(동영상) 발행 — manifest.reel 있을 때만. 실패해도 캐러셀엔 영향 없음
  let reelOutcome = { attempted: false };
  if (manifest.reel) {
    reelOutcome = { attempted: true };
    try {
      // 캐러셀 발행 직후 곧바로 올리면 액션 차단 위험 → 잠깐 간격
      await new Promise((r) => setTimeout(r, 20000));
      const reelUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/output/${folder}/${manifest.reel}`;
      const reelId = await publishReel(IG_USER_ID, IG_ACCESS_TOKEN, reelUrl, manifest.caption);
      reelOutcome = { attempted: true, ok: true, id: reelId };
      console.log(`✅ 릴스 발행 완료! id: ${reelId}`);
    } catch (e) {
      reelOutcome = { attempted: true, ok: false, error: e.message };
      console.log('릴스 발행 실패(건너뜀):', e.message);
    }
  }

  // 스레드 발행 (THREADS_USER_ID / THREADS_ACCESS_TOKEN 있을 때만) — 커버 1장 + 텍스트 훅
  let threadsPermalink = null;
  const TU = process.env.THREADS_USER_ID, TT = process.env.THREADS_ACCESS_TOKEN;
  if (TU && TT) {
    try {
      const coverUrl = imageUrls[0];
      const tid = await publishThreadsImage(TU, TT, coverUrl, manifest.threadsText || manifest.title);
      console.log(`✅ 스레드 발행 완료! id: ${tid}`);
      try { threadsPermalink = await getThreadsPermalink(tid, TT); } catch {}
    } catch (e) {
      console.log('스레드 발행 실패(건너뜀):', e.message);
    }
  } else {
    console.log('스레드 토큰 없음 — 스레드 발행 건너뜀');
  }

  // Slack 업로드 알림 (SLACK_WEBHOOK_URL 있을 때만)
  await notifySlack({ title: manifest.title || manifest.id, series: manifest.series, no: manifest.no, permalink, threadsPermalink });

  // 성공 시에만 다음 주제로 인덱스 이동
  const state = loadState();
  state.nextIndex = (typeof manifest.index === 'number' ? manifest.index : state.nextIndex) + 1;
  state.lastReel = reelOutcome; // 릴스 발행 결과 기록(진단용)
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log(`다음 인덱스: ${state.nextIndex}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
