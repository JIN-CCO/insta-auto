// Slack 수신 웹훅으로 업로드 알림 전송 (SLACK_WEBHOOK_URL 없으면 조용히 건너뜀)

// UTC 시각을 한국시간(KST) 문자열로
function kstNow() {
  const d = new Date(Date.now() + 9 * 3600 * 1000);
  const p = (n) => String(n).padStart(2, '0');
  const date = `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
  const time = `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return { date, time, day: days[d.getUTCDay()] };
}

async function notifySlack({ title, series, no, mediaId, permalink }) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return; // 웹훅 미설정 시 건너뜀

  const { date, time, day } = kstNow();
  const lines = [
    `📸 *인스타 새 게시물 업로드됨*`,
    `• 제목: ${title}`,
    series ? `• 시리즈: ${series} #${String(no).padStart(2, '0')}` : null,
    `• 날짜: ${date} (${day})`,
    `• 시간: ${time} (KST)`,
    permalink ? `• 링크: ${permalink}` : null,
  ].filter(Boolean);

  const payload = { text: lines.join('\n'), unfurl_links: false };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.log(`Slack 알림 실패: HTTP ${res.status}`);
    else console.log('Slack 알림 전송 완료');
  } catch (e) {
    console.log('Slack 알림 오류:', e.message);
  }
}

module.exports = { notifySlack };
