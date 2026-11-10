// 무료 스톡 사진 가져오기 (Pexels API — GitHub Actions에서 실행, 무료·실사)
// PEXELS_API_KEY 없으면 null 반환 → 호출부에서 placeholder/다른 소스 대체
//
// 연관성 로직:
//  1) 검색 결과가 너무 적으면(= Pexels에 그 주제 사진이 거의 없음) null 반환 → 호출부가 더 넓은 검색어로 재시도
//  2) 결과 사진의 설명(alt)과 검색어 단어의 겹침으로 점수를 매겨 가장 잘 맞는 사진 그룹에서만 고른다
//  3) 같은 점수 그룹 안에서 index 로 돌려가며 골라 게시물마다 사진이 달라지게 한다
const fs = require('fs');

const MIN_RESULTS = 6; // 이보다 적게 검색되면 "느슨한 매칭"으로 보고 포기

function tokens(q) {
  return String(q).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !['the', 'and', 'with', 'closeup', 'close'].includes(w));
}

// query: 검색어(영문이 결과 많음), orientation: 'portrait'|'landscape'|'square'
async function fetchStockPhoto(query, orientation, outPath, index = 0) {
  const key = process.env.PEXELS_API_KEY;
  if (!key || !query) return null;

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}` +
      `&orientation=${orientation}&per_page=15&size=large`;
    const res = await fetch(url, { headers: { Authorization: key } });
    const json = await res.json();
    if (!res.ok || !json.photos || json.photos.length === 0) {
      console.log(`스톡 사진 없음: "${query}"`);
      return null;
    }
    if (typeof json.total_results === 'number' && json.total_results < MIN_RESULTS) {
      console.log(`스톡 결과 부족(${json.total_results}장): "${query}" → 넓은 검색어로 재시도`);
      return null;
    }

    // alt(사진 설명)와 검색어 단어 겹침으로 연관성 점수
    const toks = tokens(query);
    const scored = json.photos.map((p, i) => {
      const alt = String(p.alt || '').toLowerCase();
      const s = toks.reduce((a, t) => a + (alt.includes(t) ? 1 : 0), 0);
      return { p, i, s };
    });
    const best = Math.max(...scored.map((x) => x.s));
    // 가장 잘 맞는 그룹(최대 4장) 안에서만 고른다. 겹침이 전혀 없으면 상위 3장(검색 순위가 곧 연관성)
    const pool = best > 0 ? scored.filter((x) => x.s === best).slice(0, 4) : scored.slice(0, 3);
    const photo = pool[index % pool.length].p;
    const imgUrl = photo.src.large2x || photo.src.large || photo.src.original;

    const imgRes = await fetch(imgUrl);
    if (!imgRes.ok) { console.log('스톡 이미지 다운로드 실패'); return null; }
    const buf = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync(outPath, buf);
    console.log(`스톡 사진 가져옴: "${query}" (점수 ${best}, by ${photo.photographer}) → ${outPath}`);
    return { path: outPath, credit: photo.photographer, url: photo.url };
  } catch (e) {
    console.log(`스톡 사진 오류: ${e.message}`);
    return null;
  }
}

// 여러 검색어를 순서대로 시도 (슬라이드 전용 → 주제 디테일 → 주제 커버 → 공통 대체)
async function fetchStockPhotoChain(queries, orientation, outPath, index = 0) {
  const seen = new Set();
  for (const q of queries) {
    if (!q || seen.has(q)) continue;
    seen.add(q);
    const r = await fetchStockPhoto(q, orientation, outPath, index);
    if (r) return r;
  }
  return null;
}

module.exports = { fetchStockPhoto, fetchStockPhotoChain };
