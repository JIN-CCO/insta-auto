// 인스타그램 캐러셀 발행 (Instagram API with Instagram Login, graph.instagram.com)
const BASE = 'https://graph.instagram.com/v21.0';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(pathname, params) {
  const url = `${BASE}/${pathname}`;
  const body = new URLSearchParams(params);
  const res = await fetch(url, { method: 'POST', body });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`API 오류 (${pathname}): ${JSON.stringify(json.error || json)}`);
  }
  return json;
}

async function getStatus(containerId, token) {
  const url = `${BASE}/${containerId}?fields=status_code&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  const json = await res.json();
  return json.status_code; // IN_PROGRESS | FINISHED | ERROR | PUBLISHED
}

async function waitFinished(containerId, token, tries = 30) {
  for (let i = 0; i < tries; i++) {
    const status = await getStatus(containerId, token);
    if (status === 'FINISHED') return;
    if (status === 'ERROR') throw new Error(`컨테이너 처리 실패: ${containerId}`);
    await sleep(4000);
  }
  throw new Error(`컨테이너가 시간 내 준비되지 않음: ${containerId}`);
}

// igId: 인스타 계정 ID, token: 액세스 토큰, imageUrls: 공개 URL 배열, caption: 문구
async function publishCarousel(igId, token, imageUrls, caption) {
  // 1) 각 이미지를 캐러셀 자식 컨테이너로 생성
  const childIds = [];
  for (const imageUrl of imageUrls) {
    const child = await api(`${igId}/media`, {
      image_url: imageUrl,
      is_carousel_item: 'true',
      access_token: token,
    });
    childIds.push(child.id);
  }

  // 2) 캐러셀 부모 컨테이너 생성
  const parent = await api(`${igId}/media`, {
    media_type: 'CAROUSEL',
    children: childIds.join(','),
    caption,
    access_token: token,
  });

  // 3) 처리 완료 대기 후 발행
  await waitFinished(parent.id, token);
  const published = await api(`${igId}/media_publish`, {
    creation_id: parent.id,
    access_token: token,
  });
  return published.id;
}

// 릴스(동영상) 발행 — videoUrl: 공개 mp4 URL
async function publishReel(igId, token, videoUrl, caption) {
  const container = await api(`${igId}/media`, {
    media_type: 'REELS',
    video_url: videoUrl,
    caption,
    access_token: token,
  });
  // 릴스는 서버 인코딩에 시간이 더 걸림 → 넉넉히 대기 (최대 ~5분)
  await waitFinished(container.id, token, 60);
  const published = await api(`${igId}/media_publish`, {
    creation_id: container.id,
    access_token: token,
  });
  return published.id;
}

// 장기 토큰 갱신 (24시간 이상 지난 토큰을 60일 더 연장)
async function refreshToken(token) {
  const url = `${BASE.replace('/v21.0', '')}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(`토큰 갱신 실패: ${JSON.stringify(json.error)}`);
  return json; // { access_token, token_type, expires_in }
}

// 발행된 게시물의 인스타 링크(permalink) 조회
async function getPermalink(mediaId, token) {
  const url = `${BASE}/${mediaId}?fields=permalink&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  const json = await res.json();
  return json.permalink || null;
}

module.exports = { publishCarousel, publishReel, refreshToken, getPermalink };
