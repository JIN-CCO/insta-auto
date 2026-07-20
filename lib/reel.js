// 넘기는 릴스 생성 — 슬라이드 PNG들을 9:16(1080x1920) mp4로. 좌우 슬라이드 전환.
// ffmpeg-static의 번들 바이너리 사용 → GitHub Actions에서 별도 설치 불필요.
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

// slidePaths: 슬라이드 png 경로 배열(순서대로), outPath: 결과 mp4
// dur: 장당 노출(초), trans: 전환 길이(초)
function buildReel(slidePaths, outPath, { dur = 2.6, trans = 0.6 } = {}) {
  return new Promise((resolve, reject) => {
    const n = slidePaths.length;
    if (n === 0) return reject(new Error('릴스: 슬라이드가 없습니다.'));
    const step = dur - trans;

    const inputs = [];
    let pre = '';
    slidePaths.forEach((p, i) => {
      inputs.push('-loop', '1', '-framerate', '30', '-t', String(dur), '-i', p);
      // 배경: 꽉 채워 블러+살짝 어둡게 / 전경: 원본 비율 유지해 중앙 배치
      pre +=
        `[${i}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=24,eq=brightness=-0.08[bg${i}];` +
        `[${i}:v]scale=1080:1350:force_original_aspect_ratio=decrease[fg${i}];` +
        `[bg${i}][fg${i}]overlay=(W-w)/2:(H-h)/2,fps=30,format=yuv420p,setsar=1[fr${i}];`;
    });

    let filter;
    if (n === 1) {
      filter = pre + '[fr0]copy[vout]';
    } else {
      let chain = '';
      let cur = '[fr0]';
      for (let k = 1; k < n; k++) {
        const off = (step * k).toFixed(3);
        const out = k === n - 1 ? '[vout]' : `[v${k}]`;
        chain += `${cur}[fr${k}]xfade=transition=slideleft:duration=${trans}:offset=${off}${out};`;
        cur = `[v${k}]`;
      }
      filter = pre + chain.replace(/;$/, '');
    }

    const args = [
      ...inputs,
      '-filter_complex', filter,
      '-map', '[vout]',
      '-c:v', 'libx264',
      '-profile:v', 'high',
      '-pix_fmt', 'yuv420p',
      '-r', '30',
      '-movflags', '+faststart',
      '-y', outPath,
    ];

    const ff = spawn(ffmpegPath, args);
    let err = '';
    ff.stderr.on('data', (d) => { err += d.toString(); });
    ff.on('error', reject);
    ff.on('close', (code) => (code === 0 ? resolve(outPath) : reject(new Error('ffmpeg 실패: ' + err.slice(-800)))));
  });
}

module.exports = { buildReel };
