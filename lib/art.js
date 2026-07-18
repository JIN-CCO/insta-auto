// 일러스트 레지스트리 — 채움(플랫) 스타일. 주제별 커버/본문 그림.
const BLUE = '#2563EB';
const DEEP = '#1D4FC4';
const NAVY = '#12284B';
const SKY = '#DBEAFE';
const SOFT = '#EAF2FF';
const WATER = '#8FBCFF';
const RED = '#E4574C';

const SH = (id) => `<defs><filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#0A1E4D" flood-opacity="0.18"/></filter></defs>`;

// 물 채워진 생수병
function bottle(h = 380, onBlue = false) {
  const water = onBlue ? '#BFD7FF' : WATER;
  const cap = onBlue ? '#0F3BA8' : DEEP;
  const bodyPath = 'M92 66 c0 12-26 20-26 44 v220 c0 0 10 24 26 31 h56 c16-7 26-31 26-31 v-220 c0-24-26-32-26-44 z';
  return `<svg viewBox="0 0 240 400" width="${Math.round(h * 0.6)}" height="${h}">
    ${SH('b1')}
    <defs><clipPath id="bclip"><path d="${bodyPath}"/></clipPath></defs>
    <g filter="url(#b1)">
      <path d="${bodyPath}" fill="#FFFFFF"/>
      <g clip-path="url(#bclip)">
        <rect x="60" y="190" width="130" height="180" fill="${water}" opacity="0.9"/>
        <path d="M60 300 q14-18 28-2 q14 16 28 0 q14-16 28 0 q14 16 28 2 v70 h-112 z" fill="${DEEP}" opacity="0.3"/>
      </g>
      <rect x="88" y="28" width="64" height="40" rx="8" fill="${cap}"/>
      <path d="M80 100 q-6 55 0 110" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.8"/>
    </g>
  </svg>`;
}

// 페트병 바닥 꽃모양
function petal(size = 300, onBlue = false) {
  const petalFill = onBlue ? '#BFD7FF' : SKY;
  const line = onBlue ? '#0F3BA8' : BLUE;
  const petals = [];
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 - 90) * Math.PI / 180;
    const cx = 170 + Math.cos(a) * 86;
    const cy = 170 + Math.sin(a) * 86;
    petals.push(`<ellipse cx="${cx}" cy="${cy}" rx="50" ry="62" transform="rotate(${i * 72} ${cx} ${cy})" fill="${petalFill}" stroke="${line}" stroke-width="4"/>`);
  }
  return `<svg viewBox="0 0 340 340" width="${size}" height="${size}">
    ${SH('p1')}
    <g filter="url(#p1)">
      <circle cx="170" cy="170" r="150" fill="#FFFFFF" stroke="${line}" stroke-width="4"/>
      ${petals.join('')}
      <circle cx="170" cy="170" r="26" fill="${line}"/>
    </g>
  </svg>`;
}

// 충전 케이블 (단자 옆이 꺾임)
function cable(h = 360, onBlue = false) {
  const line = onBlue ? '#FFFFFF' : BLUE;
  const body = onBlue ? '#BFD7FF' : SKY;
  return `<svg viewBox="0 0 420 380" width="${Math.round(h * 420 / 380)}" height="${h}">
    ${SH('c1')}
    <g filter="url(#c1)">
      <rect x="40" y="40" width="180" height="300" rx="26" fill="#FFFFFF"/>
      <rect x="54" y="54" width="152" height="240" rx="12" fill="${body}"/>
      <circle cx="130" cy="318" r="14" fill="${body}"/>
      <rect x="118" y="336" width="24" height="34" rx="6" fill="${onBlue ? '#0F3BA8' : DEEP}"/>
      <path d="M130 370 q0 -6 0 0 q90 24 150 -20 q50 -38 90 -10" fill="none" stroke="${line}" stroke-width="12" stroke-linecap="round"/>
      <path d="M148 356 q-14 10 -22 2" fill="none" stroke="${RED}" stroke-width="6" stroke-dasharray="2 10" stroke-linecap="round"/>
    </g>
  </svg>`;
}

// 휴대폰 거치대
function holder(h = 360, onBlue = false) {
  const base = onBlue ? '#BFD7FF' : SKY;
  const dark = onBlue ? '#0F3BA8' : DEEP;
  return `<svg viewBox="0 0 340 380" width="${Math.round(h * 340 / 380)}" height="${h}">
    ${SH('h1')}
    <g filter="url(#h1)">
      <rect x="96" y="30" width="150" height="250" rx="20" fill="#FFFFFF" transform="rotate(8 170 155)"/>
      <rect x="110" y="46" width="122" height="200" rx="10" fill="${base}" transform="rotate(8 170 155)"/>
      <path d="M120 268 l-30 70 h40 l24 -56 z" fill="${dark}"/>
      <rect x="60" y="336" width="220" height="22" rx="11" fill="${dark}"/>
      <path d="M226 262 l16 44" stroke="${dark}" stroke-width="14" stroke-linecap="round"/>
    </g>
  </svg>`;
}

// 캔 (오목 바닥)
function can(h = 380, onBlue = false) {
  const body = onBlue ? '#BFD7FF' : SKY;
  const dark = onBlue ? '#0F3BA8' : DEEP;
  return `<svg viewBox="0 0 260 400" width="${Math.round(h * 260 / 400)}" height="${h}">
    ${SH('cn')}
    <g filter="url(#cn)">
      <path d="M60 60 q70 -24 140 0 v280 q-70 24 -140 0 z" fill="#FFFFFF"/>
      <path d="M60 60 q70 -24 140 0 q-70 22 -140 0 z" fill="${dark}"/>
      <rect x="60" y="120" width="140" height="150" fill="${body}"/>
      <path d="M60 340 q70 22 140 0 q-24 -34 -70 -34 q-46 0 -70 34 z" fill="${dark}" opacity="0.85"/>
      <path d="M78 100 q-6 90 0 200" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.8"/>
    </g>
  </svg>`;
}

// 우산
function umbrella(h = 360, onBlue = false) {
  const canopy = onBlue ? '#BFD7FF' : SKY;
  const line = onBlue ? '#0F3BA8' : DEEP;
  return `<svg viewBox="0 0 380 380" width="${h}" height="${h}">
    ${SH('u1')}
    <g filter="url(#u1)">
      <path d="M30 180 q160 -180 320 0 q-40 -26 -80 0 q-40 -26 -80 0 q-40 -26 -80 0 q-40 -26 -80 0 z" fill="${canopy}" stroke="${line}" stroke-width="4"/>
      <line x1="190" y1="60" x2="190" y2="330" stroke="${line}" stroke-width="12" stroke-linecap="round"/>
      <path d="M190 330 q0 26 -26 26 q-20 0 -22 -18" fill="none" stroke="${line}" stroke-width="10" stroke-linecap="round"/>
      <path d="M110 176 l-14 40" stroke="${RED}" stroke-width="6" stroke-dasharray="2 10" stroke-linecap="round"/>
    </g>
  </svg>`;
}

// 멀티탭
function multitap(h = 300, onBlue = false) {
  const body = onBlue ? '#BFD7FF' : SKY;
  const dark = onBlue ? '#0F3BA8' : DEEP;
  const hole = (x) => `<circle cx="${x}" cy="150" r="26" fill="#FFFFFF"/><circle cx="${x - 9}" cy="150" r="5" fill="${dark}"/><circle cx="${x + 9}" cy="150" r="5" fill="${dark}"/>`;
  return `<svg viewBox="0 0 520 300" width="${Math.round(h * 520 / 300)}" height="${h}">
    ${SH('m1')}
    <g filter="url(#m1)">
      <rect x="30" y="90" width="410" height="120" rx="28" fill="${body}"/>
      ${hole(100)}${hole(190)}${hole(280)}
      <rect x="330" y="96" width="96" height="108" rx="20" fill="${dark}"/>
      <rect x="352" y="120" width="52" height="60" rx="10" fill="#FFFFFF" opacity="0.9"/>
      <path d="M440 150 h50" stroke="${dark}" stroke-width="12" stroke-linecap="round"/>
    </g>
  </svg>`;
}

// 자전거 (삼각 프레임)
function bicycle(h = 320, onBlue = false) {
  const line = onBlue ? '#FFFFFF' : BLUE;
  const fill = onBlue ? '#BFD7FF' : SKY;
  return `<svg viewBox="0 0 520 340" width="${Math.round(h * 520 / 340)}" height="${h}">
    ${SH('bi')}
    <g filter="url(#bi)">
      <circle cx="110" cy="240" r="78" fill="none" stroke="${line}" stroke-width="10"/>
      <circle cx="410" cy="240" r="78" fill="none" stroke="${line}" stroke-width="10"/>
      <path d="M110 240 L230 120 L340 240 z" fill="${fill}" stroke="${line}" stroke-width="10" stroke-linejoin="round"/>
      <path d="M230 120 L410 240" stroke="${line}" stroke-width="10" stroke-linecap="round"/>
      <path d="M230 120 l-20 -40 h40" stroke="${line}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="340" cy="240" r="12" fill="${line}"/>
    </g>
  </svg>`;
}

// 캐리어 바퀴
function wheelcase(h = 360, onBlue = false) {
  const body = onBlue ? '#BFD7FF' : SKY;
  const dark = onBlue ? '#0F3BA8' : DEEP;
  return `<svg viewBox="0 0 320 400" width="${Math.round(h * 320 / 400)}" height="${h}">
    ${SH('w1')}
    <g filter="url(#w1)">
      <rect x="60" y="60" width="200" height="270" rx="26" fill="#FFFFFF"/>
      <rect x="78" y="80" width="164" height="230" rx="16" fill="${body}"/>
      <line x1="120" y1="80" x2="120" y2="310" stroke="#FFFFFF" stroke-width="8"/>
      <line x1="200" y1="80" x2="200" y2="310" stroke="#FFFFFF" stroke-width="8"/>
      <rect x="120" y="24" width="80" height="16" rx="8" fill="${dark}"/>
      <line x1="136" y1="40" x2="136" y2="60" stroke="${dark}" stroke-width="10"/>
      <line x1="184" y1="40" x2="184" y2="60" stroke="${dark}" stroke-width="10"/>
      <circle cx="96" cy="352" r="24" fill="${dark}"/><circle cx="96" cy="352" r="9" fill="#FFFFFF" opacity="0.85"/>
      <circle cx="224" cy="352" r="24" fill="${dark}"/><circle cx="224" cy="352" r="9" fill="#FFFFFF" opacity="0.85"/>
    </g>
  </svg>`;
}

// 텀블러
function tumbler(h = 380, onBlue = false) {
  const body = onBlue ? '#BFD7FF' : SKY;
  const dark = onBlue ? '#0F3BA8' : DEEP;
  return `<svg viewBox="0 0 240 400" width="${Math.round(h * 0.6)}" height="${h}">
    ${SH('t1')}
    <g filter="url(#t1)">
      <path d="M70 70 h100 l-10 290 q-40 14 -80 0 z" fill="#FFFFFF"/>
      <path d="M78 140 h84 l-7 200 q-35 12 -70 0 z" fill="${body}"/>
      <rect x="62" y="34" width="116" height="44" rx="14" fill="${dark}"/>
      <rect x="150" y="44" width="20" height="24" rx="8" fill="#FFFFFF" opacity="0.6"/>
      <path d="M86 120 q-4 110 2 220" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" fill="none" opacity="0.8"/>
    </g>
  </svg>`;
}

// 원리 도식: 평평 vs 굴곡 (생수병·캔 공용)
function flatVsCurved(labelA = '평평한 바닥', descA = '가운데가 눌려 변형', labelB = '굴곡진 바닥', descB = '굴곡이 힘을 나눠 받음') {
  const PAPER = '#F4F7FB';
  const GRAY = '#5B6B85';
  const arrowF = (x, y) => `<rect x="${x - 5}" y="${y}" width="10" height="30" rx="5" fill="${NAVY}"/>
    <path d="M${x - 15} ${y + 26} L${x} ${y + 46} L${x + 15} ${y + 26} z" fill="${NAVY}"/>`;
  return `<svg viewBox="0 0 880 340" width="820" height="317">
    <defs><filter id="cs" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0A1E4D" flood-opacity="0.10"/></filter></defs>
    <g filter="url(#cs)"><rect x="28" y="16" width="390" height="300" rx="24" fill="#FFFFFF"/></g>
    <rect x="58" y="46" width="170" height="44" rx="22" fill="${PAPER}"/>
    <text x="143" y="76" text-anchor="middle" font-size="26" font-weight="700" fill="${GRAY}" font-family="'Noto Sans CJK KR'">${labelA}</text>
    ${arrowF(158, 112)}${arrowF(223, 112)}${arrowF(288, 112)}
    <rect x="95" y="208" width="256" height="14" rx="7" fill="${BLUE}"/>
    <path d="M180 216 q43 46 86 0" fill="none" stroke="${RED}" stroke-width="7" stroke-dasharray="1 14" stroke-linecap="round"/>
    <rect x="78" y="252" width="290" height="44" rx="22" fill="#FDEBE8"/>
    <text x="223" y="282" text-anchor="middle" font-size="25" font-weight="700" fill="${RED}" font-family="'Noto Sans CJK KR'">${descA}</text>
    <g filter="url(#cs)"><rect x="462" y="16" width="390" height="300" rx="24" fill="#FFFFFF"/></g>
    <rect x="492" y="46" width="170" height="44" rx="22" fill="${PAPER}"/>
    <text x="577" y="76" text-anchor="middle" font-size="26" font-weight="700" fill="${GRAY}" font-family="'Noto Sans CJK KR'">${labelB}</text>
    ${arrowF(592, 112)}${arrowF(657, 112)}${arrowF(722, 112)}
    <path d="M528 215 q14-36 29-2 q14 34 29 0 q14-34 29 0 q14 34 29 0 q14-34 29 0 q14 34 29 0 q14-36 29-2"
      fill="none" stroke="${BLUE}" stroke-width="13" stroke-linecap="round"/>
    <rect x="512" y="252" width="290" height="44" rx="22" fill="${SKY}"/>
    <text x="657" y="282" text-anchor="middle" font-size="25" font-weight="700" fill="${DEEP}" font-family="'Noto Sans CJK KR'">${descB}</text>
  </svg>`;
}

const registry = { bottle, petal, cable, holder, can, umbrella, multitap, bicycle, wheelcase, tumbler };

// key 예: 'bottle', 'bottle+petal' (두 개 나란히), 'flatVsCurved:...'
function getArt(key, opts = {}) {
  if (!key) return '';
  if (key.startsWith('flatVsCurved')) {
    const parts = key.split(':')[1];
    return parts ? flatVsCurved(...parts.split('|')) : flatVsCurved();
  }
  const names = key.split('+');
  const pieces = names.map((n, i) => {
    const fn = registry[n.trim()];
    if (!fn) return '';
    const h = opts.h || (names.length > 1 ? (i === 0 ? 360 : 280) : 380);
    return fn(h, !!opts.onBlue);
  }).filter(Boolean);
  if (pieces.length === 1) return pieces[0];
  return `<div style="display:flex;align-items:${opts.onBlue ? 'flex-end' : 'center'};gap:${opts.onBlue ? 44 : 70}px;">${pieces.join('')}</div>`;
}

module.exports = { getArt };
