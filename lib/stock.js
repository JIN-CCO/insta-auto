// 무료 스톡 사진 가져오기 (Pexels API — GitHub Actions에서 실행, 무료·실사)
// PEXELS_API_KEY 없으면 null 반환 → 호출부에서 placeholder/다른 소스 대체
const fs = require('fs');

// query: 검색어(영문이 결과 많음), orientation: 'portrait'|'landscape'|'square'
async function fetchStockPhoto(query, orientation, outPath, index = 0) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return null;

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}` +
      `&orientation=${orientation}&per_page=15&size=large`;
    const res = await fetch(url, { headers: { Authorization: key } });
    const json = await res.json();
    if (!res.ok || !json.photos || json.photos.length === 0) {
      console.log(`스톡 사진 없음: "${query}"`);
      return null;
    }
    // index로 결과를 돌려가며 골라, 게시물마다 다른 사진이 나오게
    const photo = json.photos[index % json.photos.length];
    const imgUrl = photo.src.large2x || photo.src.large || photo.src.original;

    const imgRes = await fetch(imgUrl);
    if (!imgRes.ok) { console.log('스톡 이미지 다운로드 실패'); return null; }
    const buf = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync(outPath, buf);
    console.log(`스톡 사진 가져옴: "${query}" (by ${photo.photographer}) → ${outPath}`);
    return { path: outPath, credit: photo.photographer, url: photo.url };
  } catch (e) {
    console.log(`스톡 사진 오류: ${e.message}`);
    return null;
  }
}

module.exports = { fetchStockPhoto };
