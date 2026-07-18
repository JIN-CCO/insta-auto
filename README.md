# 인스타 자동 발행 (makeit_pedia)

매일 정해진 시간에 "제조공정 알쓸신잡" 캐러셀을 자동으로 만들어 인스타그램에 올립니다.
GitHub Actions에서 무료로 돌아가고, 서버를 따로 켜둘 필요가 없습니다.

## 어떻게 돌아가나요

1. 정해진 시간(하루 3번)에 GitHub Actions가 실행됩니다.
2. `content.js`의 다음 주제로 캐러셀 이미지 6장을 만듭니다.
3. 그 이미지를 레포에 올려 공개 주소(raw URL)를 만듭니다.
4. 인스타그램 API로 캐러셀 게시물을 발행합니다.
5. 다음 주제로 순서를 한 칸 옮깁니다(`state.json`).

---

## 처음 세팅 (한 번만)

### 1. GitHub 레포 만들기
- github.com 로그인 → 우측 상단 `+` → **New repository**
- 이름 예: `insta-auto` → **Private**(비공개)로 만들어도 됩니다
  - ⚠️ 단, 이미지가 raw URL로 공개돼야 인스타가 가져갈 수 있어요. Private 레포는 raw URL이 막히니, **Public(공개)로 만드는 걸 권장**합니다. (이미지·코드만 있고 토큰은 안 들어가니 공개해도 안전합니다. 토큰은 아래 Secrets에 따로 저장돼요.)

### 2. 이 폴더의 파일들을 레포에 올리기
컴퓨터에 이 폴더를 풀고, 터미널에서:
```bash
cd insta_auto
git init
git add .
git commit -m "첫 커밋"
git branch -M main
git remote add origin https://github.com/<본인아이디>/insta-auto.git
git push -u origin main
```
(git이 없으면 GitHub 웹페이지에서 "Add file → Upload files"로 드래그해 올려도 됩니다.)

### 3. 비밀값(Secrets) 등록
레포 → **Settings → Secrets and variables → Actions → New repository secret** 에서 3개를 등록:

| 이름 | 값 |
|------|-----|
| `IG_USER_ID` | `17841446234152682` |
| `IG_ACCESS_TOKEN` | (개발자 앱에서 받은 그 토큰) |
| `IG_HANDLE` | `makeit_pedia` |

### 4. Actions 권한 확인
- 레포 → **Settings → Actions → General** → 아래 "Workflow permissions"에서
  **Read and write permissions** 선택 후 저장. (커밋을 다시 밀어야 하므로 필요)

### 5. 테스트 발행 (수동)
- 레포 → **Actions** 탭 → 왼쪽 "매일 인스타 자동 발행" → **Run workflow** 버튼
- 초록 체크가 뜨고 인스타에 게시물이 올라오면 성공입니다.
- 실패하면 로그를 열어 어느 단계에서 멈췄는지 확인하세요.

### 6. 자동 스케줄
- `.github/workflows/daily.yml`에 이미 하루 3번(한국시간 08:00 / 13:00 / 19:00) 예약돼 있습니다.
- 시간을 바꾸려면 `cron` 값을 수정하세요. (UTC 기준 = 한국시간 − 9시간)

---

## 주제 추가하기
`content.js` 배열에 같은 형식으로 계속 추가하면 됩니다. 남은 주제가 2개 이하가 되면
렌더 로그에 경고가 뜹니다. 다 쓰면 처음부터 다시 반복 발행됩니다.

## 토큰 갱신 (중요)
액세스 토큰은 **60일 후 만료**됩니다. `lib/publish.js`의 `refreshToken()`으로 연장할 수 있어요.
간단하게는 55일마다 한 번 새 토큰을 발급/갱신해 `IG_ACCESS_TOKEN` Secret을 업데이트하면 됩니다.
(원하면 이 갱신까지 자동화하는 워크플로를 추가로 만들어 드릴게요.)

## 디자인 수정
`lib/render.js`에서 색·폰트·레이아웃을 바꿀 수 있어요. 각 주제의 포인트 색은
`content.js`의 `ink` 값으로 조절합니다.
