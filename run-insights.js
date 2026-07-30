// 인스타 인사이트 리포트 생성 — insights/report.md + insights/data.json
const fs = require('fs');
const path = require('path');
const { listMedia, getInsights } = require('./lib/insights');

const IG_USER_ID = process.env.IG_USER_ID;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const OUT_DIR = path.join(__dirname, 'insights');

const n = (v) => (typeof v === 'number' ? v.toLocaleString('en-US') : (v ?? '-'));
function avg(arr, key) {
  const nums = arr.map((r) => r.insights?.[key]).filter((x) => typeof x === 'number');
  if (!nums.length) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}
function firstLine(caption) {
  if (!caption) return '(캡션 없음)';
  const t = caption.split('\n')[0].trim();
  return t.length > 26 ? t.slice(0, 26) + '…' : t;
}
function kstDate(ts) {
  try {
    const d = new Date(new Date(ts).getTime() + 9 * 3600 * 1000);
    const p = (x) => String(x).padStart(2, '0');
    return `${p(d.getUTCMonth() + 1)}/${p(d.getUTCDate())}`;
  } catch { return '-'; }
}

(async () => {
  if (!IG_USER_ID || !IG_ACCESS_TOKEN) throw new Error('IG_USER_ID / IG_ACCESS_TOKEN 없음');
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const media = await listMedia(IG_USER_ID, IG_ACCESS_TOKEN, 40);
  const rows = [];
  for (const m of media) {
    const isReel = m.media_product_type === 'REELS';
    const insights = await getInsights(m.id, IG_ACCESS_TOKEN, isReel);
    rows.push({
      id: m.id,
      type: isReel ? 'REEL' : (m.media_type === 'CAROUSEL_ALBUM' ? 'CAROUSEL' : 'IMAGE'),
      isReel,
      title: firstLine(m.caption),
      date: kstDate(m.timestamp),
      timestamp: m.timestamp,
      permalink: m.permalink,
      likes: m.like_count,
      comments: m.comments_count,
      insights,
    });
  }

  const reels = rows.filter((r) => r.isReel);
  const cars = rows.filter((r) => r.type === 'CAROUSEL');
  const permErr = rows.length && rows.every((r) => r.insights?._error);

  // ── 리포트 작성 ──
  let md = `# 📊 인스타 인사이트 리포트\n\n`;
  md += `수집 게시물 ${rows.length}개 (캐러셀 ${cars.length} · 릴스 ${reels.length})\n\n`;

  if (permErr) {
    md += `> ⚠️ 인사이트 지표를 가져오지 못했어요(토큰 권한 부족 가능). 좋아요·댓글 수만 표시됩니다.\n> 오류: ${rows[0].insights._error}\n\n`;
  }

  const summarize = (label, group) => {
    if (!group.length) return '';
    let s = `**${label}** (${group.length}개 평균) — `;
    s += `도달 ${n(avg(group, 'reach'))} · 조회 ${n(avg(group, 'views'))} · `;
    s += `좋아요 ${n(Math.round(group.map((r) => r.likes).filter((x) => typeof x === 'number').reduce((a, b) => a + b, 0) / group.length))} · `;
    s += `댓글 ${n(Math.round(group.map((r) => r.comments).filter((x) => typeof x === 'number').reduce((a, b) => a + b, 0) / group.length))} · `;
    s += `저장 ${n(avg(group, 'saved'))} · 공유 ${n(avg(group, 'shares'))}`;
    if (label.includes('릴스')) s += ` · 평균시청 ${n(avg(group, 'ig_reels_avg_watch_time'))}ms`;
    return s + '\n\n';
  };

  md += `## 요약\n\n`;
  md += summarize('📱 릴스', reels);
  md += summarize('🖼 캐러셀', cars);

  md += `## 게시물별\n\n`;
  md += `| 날짜 | 유형 | 제목 | 도달 | 조회 | 좋아요 | 댓글 | 저장 | 공유 |\n`;
  md += `|---|---|---|---|---|---|---|---|---|\n`;
  for (const r of rows) {
    const i = r.insights || {};
    md += `| ${r.date} | ${r.type} | ${r.title} | ${n(i.reach)} | ${n(i.views)} | ${n(r.likes)} | ${n(r.comments)} | ${n(i.saved)} | ${n(i.shares)} |\n`;
  }
  md += `\n_생성 시각(KST): ${kstDate(new Date().toISOString())} · raw 데이터는 insights/data.json_\n`;

  fs.writeFileSync(path.join(OUT_DIR, 'report.md'), md);
  fs.writeFileSync(path.join(OUT_DIR, 'data.json'), JSON.stringify(rows, null, 2));
  console.log(`인사이트 리포트 생성 완료: ${rows.length}개 (릴스 ${reels.length} · 캐러셀 ${cars.length})`);
  if (permErr) console.log('⚠️ 인사이트 권한 부족 가능 — report.md 참고');
})().catch((e) => { console.error(e); process.exit(1); });
