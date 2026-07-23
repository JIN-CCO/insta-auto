// 2단계: 렌더한(그리고 push된) 이미지를 인스타에 발행.
// 계정 보호를 위해 한 번 실행에 "하나"만 발행한다: 캐러셀 단계 → 릴스 단계 → 다음 주제.
const fs = require('fs');
const path = require('path');
const { publishCarousel, publishReel, getPermalink } = require('./lib/publish');
const { publishThreadsImage, getThreadsPermalink } = require('./lib/threads');
const { notifySlack } = require('./lib/notify');

const IG_USER_ID = process.env.IG_USER_ID;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY;
const BRANCH = process.env.GITHUB_REF_NAME || 'main';
const STATE_FILE = path.join(__dirname, 'state.json');

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return { nextIndex: 0 }; }
}
function saveState(patch) {
  const s = { ...loadState(), ...patch };
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2) + '\n');
  return s;
}
// 캐러셀은 "응답은 에러지만 실제로는 게시됨"이 잦다(요청 제한). media_publish까지 도달한 에러면 게시된 것으로 간주.
function likelyPublished(msg) {
  return /media_publish/.test(msg) && /(action is blocked|Application request limit|"code":\s*4|access blocked)/i.test(msg);
}

(async () => {
  const st = loadState();
  if (st.paused) { console.log('⏸️  일시정지(paused) — 발행 건너뜀'); return; }
  if (!IG_USER_ID || !IG_ACCESS_TOKEN) throw new Error('IG_USER_ID / IG_ACCESS_TOKEN 없음');
  if (!REPO) throw new Error('GITHUB_REPOSITORY 없음');

  const folder = fs.readFileSync(path.join(__dirname, '.current_post'), 'utf8').trim();
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'output', folder, 'manifest.json'), 'utf8'));
  const imageUrls = manifest.files.map((f) => `https://raw.githubusercontent.com/${REPO}/${BRANCH}/output/${folder}/${f}`);
  const stage = st.stage || 'carousel';

  // ── 1) 캐러셀 단계 ───────────────────────────────
  if (stage === 'carousel') {
    console.log(`[캐러셀] 발행 시작: ${manifest.id} (이미지 ${imageUrls.length}장)`);
    let ok = false;
    try {
      const mediaId = await publishCarousel(IG_USER_ID, IG_ACCESS_TOKEN, imageUrls, manifest.caption);
      console.log(`✅ 캐러셀 발행 완료! ${mediaId}`);
      ok = true;
      let permalink = null;
      try { permalink = await getPermalink(mediaId, IG_ACCESS_TOKEN); } catch {}
      await notifySlack({ title: manifest.title || manifest.id, series: manifest.series, no: manifest.no, permalink });
    } catch (e) {
      if (likelyPublished(e.message || '')) {
        console.log('⚠️ 캐러셀 응답은 에러지만 게시된 것으로 판단 → 릴스 단계로 진행:', e.message);
        ok = true;
      } else {
        console.error('캐러셀 발행 실패(다음 예약에 재시도):', e.message);
        throw e; // 상태 유지 → 다음 실행에서 같은 주제 재시도
      }
    }
    if (ok) { saveState({ stage: 'reel' }); console.log('다음 단계: 릴스'); }
    return;
  }

  // ── 2) 릴스 단계 ─────────────────────────────────
  console.log(`[릴스] 발행 시작: ${manifest.id}`);
  let reelOutcome = { attempted: false };
  if (manifest.reel) {
    reelOutcome = { attempted: true };
    try {
      const reelUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/output/${folder}/${manifest.reel}`;
      const reelId = await publishReel(IG_USER_ID, IG_ACCESS_TOKEN, reelUrl, manifest.caption);
      reelOutcome = { attempted: true, ok: true, id: reelId };
      console.log(`✅ 릴스 발행 완료! ${reelId}`);
    } catch (e) {
      reelOutcome = { attempted: true, ok: false, error: e.message };
      console.error('릴스 발행 실패:', e.message);
      // 릴스가 요청 제한이면 이번 주제는 다음 실행에서 한 번 더 시도(최대 2회), 이후엔 넘어감
      const tries = (st.reelTries || 0) + 1;
      if (/(action is blocked|Application request limit|"code":\s*4|access blocked)/i.test(e.message) && tries < 2) {
        saveState({ reelTries: tries, lastReel: reelOutcome });
        console.log(`릴스 재시도 예정 (${tries}/2) — 다음 실행에서 다시 시도`);
        return; // stage='reel' 유지
      }
    }
  }
  // 릴스 성공 or 최종 실패 → 다음 주제로
  const nextIndex = (typeof manifest.index === 'number' ? manifest.index : st.nextIndex) + 1;
  saveState({ stage: 'carousel', nextIndex, reelTries: 0, lastReel: reelOutcome });
  console.log(`다음 주제 인덱스: ${nextIndex}`);
})().catch((e) => { console.error(e); process.exit(1); });
