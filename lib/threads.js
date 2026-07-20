// Threads(스레드) 발행 — 단일 이미지 + 텍스트 훅
// graph.threads.net, 2단계(컨테이너 생성 → 발행). THREADS_USER_ID / THREADS_ACCESS_TOKEN 필요.
const HOST = 'https://graph.threads.net/v1.0';

async function post(pathUrl, params) {
  const res = await fetch(HOST + pathUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error('Threads API 오류: ' + JSON.stringify(data.error || data));
  return data;
}

// 단일 이미지 게시물 발행 → media id 반환
async function publishThreadsImage(userId, token, imageUrl, text) {
  // 1. 컨테이너 생성 (이미지 + 텍스트)
  const container = await post(`/${userId}/threads`, {
    media_type: 'IMAGE',
    image_url: imageUrl,
    text: text || '',
    access_token: token,
  });
  // 2. 이미지 처리 대기 (권장)
  await new Promise((r) => setTimeout(r, 4000));
  // 3. 발행
  const published = await post(`/${userId}/threads_publish`, {
    creation_id: container.id,
    access_token: token,
  });
  return published.id;
}

async function getThreadsPermalink(mediaId, token) {
  const url = new URL(`${HOST}/${mediaId}`);
  url.searchParams.set('fields', 'permalink');
  url.searchParams.set('access_token', token);
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  return data.permalink || null;
}

module.exports = { publishThreadsImage, getThreadsPermalink };
