// OpenAI 이미지 생성 (GitHub Actions에서 실행 — 인터넷 필요)
// OPENAI_API_KEY 없으면 null 반환 → 호출부에서 placeholder로 대체
const fs = require('fs');

// 피드 전체 톤을 통일하는 고정 스타일
const STYLE =
  ', realistic editorial photography, soft natural light, shallow depth of field, ' +
  'clean minimal neutral background, high detail, photorealistic, no text, no watermark';

// prompt: 장면 설명(한글/영문 가능), size: '1024x1536'(세로)|'1024x1024'|'1536x1024'
async function generateImage(prompt, size, outPath, tries = 2) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null; // 키 없으면 placeholder 사용

  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: prompt + STYLE,
          size,
          quality: 'medium',
          n: 1,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        console.log(`이미지 생성 실패(시도 ${attempt}): ${json.error ? json.error.message : res.status}`);
        continue;
      }
      const b64 = json.data && json.data[0] && json.data[0].b64_json;
      if (!b64) { console.log('이미지 응답에 데이터 없음'); continue; }
      fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
      console.log(`이미지 생성 완료 → ${outPath}`);
      return outPath;
    } catch (e) {
      console.log(`이미지 생성 오류(시도 ${attempt}): ${e.message}`);
    }
  }
  return null;
}

module.exports = { generateImage };
