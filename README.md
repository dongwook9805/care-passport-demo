# 웹 프로토타입 (1단계, 서버 없음)

외국인 환자용 의료 여권 데모입니다. 구성과 원칙은 `../프로토타입구성.md`를 따릅니다. **가상 데이터만 씁니다.**

## 들어 있는 화면
| 주소 | 화면 |
|---|---|
| `#/start` | 언어 선택(中·EN·RU·한), 가상 환자 고르기 |
| `#/` | 여권 홈: 병원 확인 기록(초록)과 본인 입력(보라) 구분, FDI 치아 차트 |
| `#/detail/0` | 치료 상세: 쉬운 말 설명, 주의할 점, 다음 진료 |
| `#/edit` | 알레르기·복용약·지병 고르기 + 직접 입력("번역 미검수" 표시) |
| `#/share` | 공유 범위 선택 → QR, 링크 복사, 의사 화면 미리보기 |
| `#/v/<데이터>` | 해외 의사 화면(영어 기본, 한국어 원문 전환). QR이 여는 주소 |
| `#/card` | 응급 카드(두 언어), 잠금화면용 PNG 저장 |

## 데이터가 어디에 있나
- 환자가 고친 정보는 **그 폰의 브라우저(localStorage)에만** 저장됩니다.
- 공유할 때는 기록을 압축해 **링크 `#` 뒤에 넣습니다.** `#` 뒤는 서버로 전송되지 않아서, 웹 서버(GitHub Pages)에도 기록이 남지 않습니다.
- 외부 요청은 0개입니다. CDN, 웹폰트, 분석 도구를 쓰지 않고, QR 라이브러리(`js/vendor/qrcode.js`, Kazuhiko Arase, MIT)도 파일로 들어 있습니다.
- 한계: 링크를 가진 사람은 누구나 열 수 있고, 24시간 만료는 화면에 표시만 할 뿐 강제하지 못합니다. 취소도 안 됩니다. 이 부분은 2단계에서 서버로 해결합니다.

## 로컬에서 실행
```sh
python3 -m http.server 8000 -d prototype/web
# 이 컴퓨터에서: http://localhost:8000
```
같은 와이파이의 폰으로 보려면 `--bind 0.0.0.0`을 붙이고 `http://<컴퓨터 IP>:8000`으로 엽니다. 이때는 https가 아니라서 오프라인 기능(서비스 워커)이 꺼집니다. 오프라인 기능은 배포 주소에서 확인하세요.

## 테스트
```sh
node --test prototype/web/tests/share.test.mjs
```
공유 링크 왕복(환자 2명 × 공유 범위 3개), 손상된 링크 거부, 의사 화면의 글자 이스케이프와 만료 처리를 확인합니다. `package.json`은 node가 ES 모듈로 읽게 하는 용도입니다.

## 고칠 때
- **이름 바꾸기**: `js/i18n.js` 맨 위의 `APP_NAME`과 `manifest.webmanifest`의 이름 두 곳
- **용어 추가**: `js/i18n.js`의 `TERMS`에 4개 언어를 모두 넣기. 중국어·러시아어는 원어민 검수 필요
- **파일을 바꾸면** `sw.js`의 `VERSION`을 올리기 (예: `kcl-v2`). 그래야 폰에 남은 예전 캐시가 지워집니다
- 링크 형식(`js/share.js`)을 바꾸면 예전 QR이 안 열릴 수 있으니 `v` 값을 올리고 이전 형식도 읽게 하기

## 배포 (GitHub Pages)
이 저장소에는 비공개 자료가 있어서 **이 폴더만** 별도 공개 저장소에 올립니다.
```sh
gh repo create dongwook9805/care-passport-demo --public
git remote add demo https://github.com/dongwook9805/care-passport-demo.git
git subtree push --prefix prototype/web demo main
gh api -X POST repos/dongwook9805/care-passport-demo/pages -f 'source[branch]=main' -f 'source[path]=/'
```
주소: `https://dongwook9805.github.io/care-passport-demo/`. 다음 배포부터는 `git subtree push` 한 줄만 다시 실행합니다.
