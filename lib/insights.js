// 인스타 인사이트 수집 — 최근 미디어 목록 + 게시물별 지표
const BASE = 'https://graph.instagram.com/v21.0';

async function getJSON(url) {
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || JSON.stringify(json.error));
  return json;
}

// 최근 미디어 목록
async function listMedia(igId, token, limit = 40) {
  const fields = 'id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count';
  const url = `${BASE}/${igId}/media?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(token)}`;
  const data = await getJSON(url);
  return data.data || [];
}

// 게시물별 인사이트 — 지표 세트를 풍부→최소 순으로 시도(권한/타입에 따라 폴백)
async function getInsights(mediaId, token, isReel) {
  const sets = isReel
    ? [
        ['reach', 'saved', 'shares', 'total_interactions', 'views', 'ig_reels_avg_watch_time'],
        ['reach', 'saved', 'shares', 'views'],
        ['reach', 'saved', 'shares'],
        ['reach'],
      ]
    : [
        ['reach', 'saved', 'shares', 'total_interactions', 'views'],
        ['reach', 'saved', 'shares'],
        ['reach'],
      ];
  let lastErr = null;
  for (const metrics of sets) {
    try {
      const data = await getJSON(`${BASE}/${mediaId}/insights?metric=${metrics.join(',')}&access_token=${encodeURIComponent(token)}`);
      const out = {};
      for (const m of data.data || []) out[m.name] = m.values?.[0]?.value;
      return out;
    } catch (e) {
      lastErr = e.message;
    }
  }
  return { _error: lastErr };
}

module.exports = { listMedia, getInsights };
