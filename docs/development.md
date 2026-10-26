# 개발과 검증

이 저장소의 일반 실행 환경은 Hugo 표준 바이너리 하나다. 현재 버전은 `.hugo-version`에서 관리하며 `tools/hugo`가 저장소의 `.tools/hugo` 또는 동일 버전의 시스템 Hugo를 선택한다.

## 작성과 렌더링의 경계

| 영역 | 책임 |
| --- | --- |
| `content/notes/` | 학습 설명, 그림·데이터, 개념 미리보기 |
| `content/paths/` | 학습 경로 설명과 순서 있는 노트 ID |
| `content/experiments/` | 실험 설명, 화면 조각, 계산·상호작용, 데이터 |
| `site/layouts/` | HTML 틀, 링크·이미지·수식 처리, 검색 색인과 목록 생성 |
| `site/assets/` | 공통 디자인, 검색·미리보기, 실험 실행기와 공유 도구 |
| `site/static/` | 고정 버전의 라이브러리·폰트 등 그대로 공개하는 자산 |
| `site/data/migration.json` | 과거 문서·리더·섹션 주소와 새 콘텐츠의 대응 |
| `research/` | 선택적인 과학 계산 재현과 출처 기록 |
| `public/` | 버릴 수 있는 생성 결과 |

Hugo의 Markdown 렌더 훅이 내부 개념 링크를 해결하고 페이지별 참조를 수집한다. 카탈로그는 선수·관련 개념과 본문 참조에서 역방향 링크를 만든다. 미리보기는 대상 노트의 `summary`와 선택적 `preview.md`를 사용한다. 검색용 JSON은 빌드하며 브라우저에서는 검색을 열고 입력할 때 가져온다.

수식은 내장 `transform.ToMath`로 HTML과 MathML을 생성한다. KaTeX 스타일과 폰트는 로컬 자산으로 제공한다. 실험 JavaScript는 내장 `js.Build`로 모듈을 묶고 문법·정적 import를 확인하므로 일반 빌드에 npm 설치가 필요하지 않다. 실험 화면의 고정 `data-tex` 수식도 빌드할 때 렌더링한다. 조작에 따라 수식이 바뀌는 실험만 `params.dynamic_math: true`로 로컬 KaTeX 런타임을 추가한다.

## 기본 실행

```sh
sh tools/install-hugo.sh
tools/hugo server -D
```

`-D`는 초안 표시 옵션이다. 배포 결과를 만들 때는 다음을 사용한다.

```sh
tools/hugo --minify
```

`public/`의 HTML을 고쳐서는 원본에 반영되지 않는다. 빌드 결과를 바꾸려면 해당 콘텐츠나 공통 템플릿을 수정한다. 기존 `references/sqd-docs/tools/build_all.sh`는 새 사이트의 빌드 명령이 아니며 보존본에 실행하지 않는다.

## 실험 실행 구조

노트의 shortcode가 실험 설명을 본문에 렌더링하고 독립된 실험 페이지를 iframe으로 연결한다. 실험의 `view.html`은 공통 문서 틀 안에 들어가며 `main.js`의 `mount(root, context)`가 첫 화면을 초기화한다.

부모는 프레임별 실행 식별자를 관리한다. 준비 완료 신호, 높이, 테마, 활성 상태, 오류와 재시도는 공통 실행기로 처리한다. 오류가 나면 해당 프레임을 정리하고 바깥 설명과 재시도 기능을 남긴다. 메시지 출처·window·실행 식별자를 함께 검사한다. 대체 설명을 iframe 안에만 넣지 않는다.

작성 코드는 signal로 이벤트와 비동기 작업을 정리하고, 자산은 `context.assetURL`로 읽는다. 화면 밖·비활성 탭·브라우저 기록 복원에서도 활성 상태와 자원 수명이 맞아야 한다. WebGL을 쓰는 실험은 컨텍스트 손실과 미지원 기기에서 읽을 대체 표현을 제공한다.

실험 계약 전체는 [실험 작성 가이드](experiment-authoring.md), 개념 팝오버 계약은 [미리보기 가이드](concept-preview.md)에 있다.

## 선택적인 개발 검사 환경

아래 도구들은 CI와 공통 기능 개발용이다. 노트의 평소 미리보기와 HTML 생성에는 설치하지 않아도 된다.

- 구조·빌드 계약 검사: Python 3.12 표준 라이브러리
- 브라우저 검사: Node.js와 `tests/package.json`에 고정한 Playwright
- 과학 계산 재현: [별도 연구 환경](../research/README.md)

브라우저 검사를 처음 실행할 때만 저장소 루트에서 준비한다.

```sh
npm ci --prefix tests --no-audit --no-fund
cd tests
npx --no-install playwright install chromium webkit
cd ..
```

Linux CI에서는 Playwright의 `--with-deps` 옵션으로 브라우저 시스템 의존성도 준비한다. 설치 결과는 `tests/node_modules/`에 격리한다. 실험마다 npm 프로젝트를 만들지 않는다.

기본 루트 주소 검사:

```sh
tools/hugo --minify --baseURL http://localhost/
python3 tests/check_structure.py --site public --base-path /
node tests/browser.mjs
```

실제 GitHub Pages 하위 경로 검사:

```sh
tools/hugo --minify --baseURL https://inojeon.github.io/note/
python3 tests/check_structure.py --site public --base-path /note/
BASE_PATH=/note/ node tests/browser.mjs
BASE_PATH=/note/ BROWSER=webkit node tests/browser.mjs
```

브라우저 검사 자체가 임시 로컬 서버를 띄우므로 별도의 Hugo 서버를 켜지 않는다. 결과와 실패 화면은 `test-results/`에 저장된다. 다른 생성 폴더를 검사하려면 `SITE_DIR`를 지정한다. 이미 준비된 개발 런타임은 `PLAYWRIGHT_MODULE`과 `CHROMIUM_PATH`로 명시할 수 있다.

빌드 계약 검사는 필수 정보·잘못된 링크·수식·JavaScript 같은 잘못된 원본이 실제로 빌드를 실패시키는지 확인한다.

```sh
python3 tests/build_contract.py
```

`tests/experiment-semantics.mjs`는 브라우저 검사에서 사용하는 계산 의미 검사다. 벡터의 길이 유지, 에너지 합, 샷 수와 통계 오차처럼 모델의 예상 결과를 검증한다. 별도 사이트 빌드 단계로 실행하지 않는다.

## 변경에 맞는 검사

문장 수정은 정확성·출처를 검토하고 빌드 및 해당 페이지 표시를 확인한다. 링크·메타데이터·구조를 바꾸면 구조 검사도 한다. 새 실험이나 계산 변경은 대표값·경계값·불변식·초기화를 검사한다. 공통 화면·실행기 변경은 오류 복구, 중복 삽입, 뒤로가기, 시스템·명시적 테마, 키보드와 모바일 검사를 포함한다.

320px 폭과 200% 확대에서 본문·카드·조작부가 잘리지 않아야 한다. 생성 HTML 안에서 수식이 이미 렌더링되고 JavaScript가 꺼져도 본문·링크·대체 설명이 남아야 한다. 루트와 `/note/`에서 자산 경로를 검증하고 외부 CDN 요청이 없는지 확인한다.

검사는 정의·수치·학습 설명을 사람이 검토하는 일을 대신하지 않는다. 과학 패키지를 다시 실행하지 않았다면 기존 데이터의 출처와 체크섬을 확인한 것인지 실제 재계산한 것인지 구분해 보고한다.

## 이관 기록과 공개

이전 문서 원본은 `references/sqd-docs/`에 보존하고 새 빌드에서는 제외한다. `site/data/migration.json`으로 옛 HTML·해시 리더·주요 섹션 주소를 새 주소로 연결한다. `content/_content.gotmpl`은 이 대응표에서 호환 페이지를 생성한다. 새 노트를 평소 추가하는 일에 기존 이관 목록을 중복 등록할 필요는 없다.

과거 74개 학습 원문과 계산 데이터 15개의 보존·대응을 구조 검사에서 확인한다. 새 콘텐츠와 과거 주소를 합치거나 나눌 때는 이 연결을 함께 갱신한다. 원문 추적용 메타데이터와 이관 설명을 학습 화면에 노출하지 않는다.

GitHub Actions는 push·PR에서 검증하며 `workflow_dispatch` 수동 실행에서만 공개한다. 검사한 생성 결과를 배포 아티팩트로 사용한다. 공개 후 문제가 생기면 직전 정상 커밋으로 복구한 브랜치·태그를 대상으로 같은 수동 워크플로를 실행해 이전 콘텐츠와 렌더러를 다시 배포한다. 배포 설정을 바꾸는 것과 실제 공개 실행은 별도 작업이다.
