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

  // text: 워크플로 빌더용(변수 이름 text) + 일반 웹훅 폴백 — 전체 정보 포함
  const linkLine = permalink ? `\n*링크:* <${permalink}|게시물 보기>` : '';
  const text =
    `📸 *새 게시물 업로드*\n` +
    `*제목:* ${title}\n` +
    `*시리즈:* ${seriesText}\n` +
    `*업로드 시간:* ${date} (${day}) ${time}` +
    linkLine;

  const payload = {
    username: 'MakeIT 인스타봇',
    icon_emoji: ':camera_with_flash:',
    text, // 워크플로 빌더 변수(text) 및 폴백
    blocks: [ // 일반 수신 웹훅이면 카드로 렌더
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
