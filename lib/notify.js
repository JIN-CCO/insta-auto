// Slack 수신 웹훅으로 업로드 알림 전송 (Block Kit 카드 스타일)
// SLACK_WEBHOOK_URL 없으면 조용히 건너뜀

function kstNow() {
  const d = new Date(Date.now() + 9 * 3600 * 1000);
  const p = (n) => String(n).padStart(2, '0');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const ap = d.getUTCHours() < 12 ? '오전' : '오후';
  const h12 = d.getUTCHours() % 12 || 12;
  return {
    date: `${d.getUTCFullYear()}. ${d.getUTCMonth() + 1}. ${d.getUTCDate()}`,
    day: days[d.getUTCDay()],
    time: `${ap} ${h12}:${p(d.getUTCMinutes())}`,
  };
}

async function notifySlack({ title, series, no, permalink }) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return; // 웹훅 미설정 시 건너뜀

  const { date, day, time } = kstNow();
  const seriesText = series ? `${series} #${String(no).padStart(2, '0')}` : '-';

  const fields = [
    { type: 'mrkdwn', text: `*제목*\n${title}` },
    { type: 'mrkdwn', text: `*시리즈*\n${seriesText}` },
    { type: 'mrkdwn', text: `*업로드 시간*\n${date} (${day}) ${time}` },
  ];
  if (permalink) fields.push({ type: 'mrkdwn', text: `*링크*\n<${permalink}|게시물 보기>` });

  const payload = {
    username: 'MakeIT 인스타봇',
    icon_emoji: ':camera_with_flash:',
    text: `📸 새 게시물 업로드 — ${title}`, // 알림 미리보기·폴백용
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: '📸 새 게시물 업로드', emoji: true } },
      { type: 'section', fields },
    ],
    unfurl_links: false,
  };

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
