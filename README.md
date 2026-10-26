# 학습 노트

개념을 기초부터 이해하기 위한 개인 학습 공간입니다. Markdown으로 설명을 쓰고, 그림과 조작 가능한 실험을 연결합니다. 작성 원본과 화면을 만드는 공통 코드를 분리해 두었습니다.

## 처음 실행하기

macOS 또는 Linux에서 이 저장소의 최상위 폴더를 터미널로 열고 실행하세요.

```sh
sh tools/install-hugo.sh
tools/hugo server -D
```

터미널에 표시되는 주소를 브라우저에서 엽니다. 파일을 저장하면 미리보기가 갱신됩니다. 종료할 때는 터미널에서 `Ctrl+C`를 누릅니다.

설치 스크립트는 `.hugo-version`에 고정한 **Hugo 표준 바이너리 하나만** `.tools/`에 내려받고 체크섬을 확인합니다. 시스템에 패키지를 설치하거나 Python·Node 환경을 만들지 않습니다. 처음 내려받을 때는 인터넷 연결이 필요합니다.

같은 버전의 Hugo가 이미 시스템에 설치되어 있다면 다음 명령도 사용할 수 있습니다.

```sh
hugo server -D
```

Windows에서는 [Hugo 0.168.0 공식 릴리스](https://github.com/gohugoio/hugo/releases/tag/v0.168.0)의 표준 실행 파일을 사용하고 `hugo server -D`를 실행합니다. 저장소 설치 스크립트는 macOS와 Linux용입니다.

## 무엇을 수정하면 되나요

| 바꾸려는 것 | 원본 위치 |
| --- | --- |
| 개념 설명, 그림, 짧은 개념 미리보기 | `content/notes/<개념-id>/` |
| 읽는 순서와 학습 경로 설명 | `content/paths/<경로-id>/` |
| 실험 설명, 화면, 계산, 데이터 | `content/experiments/<실험-id>/` |
| 전체 디자인, 검색, 툴팁, 실험 실행 방식 | `site/` |
| 과학 계산 재현과 새 계산 결과 | `research/` |
| 작성·개발 방법 | `docs/` |

노트는 `index.md`에 작성합니다. 일반 개념 링크는 본문의 미리보기 카드와 연결되며, 실험은 다음 한 줄로 삽입합니다.

```markdown
벡터는 선택한 [기저](../basis/)로 표현합니다.

{{< experiment id="vector-direction" >}}
```

새 노트를 시작할 때는 [노트 작성 가이드](docs/note-authoring.md)의 최소 예시를 복사하세요. 실제 파일을 바탕으로 시작하려면 `content/notes/vector/index.md`가 간단한 출발점입니다.

- [노트 작성 가이드](docs/note-authoring.md): 메타데이터, 수식, 그림, 연결, 학습 경로
- [개념 미리보기 가이드](docs/concept-preview.md): 링크와 `preview.md`
- [실험 작성 가이드](docs/experiment-authoring.md): HTML·JavaScript와 실행 계약
- [개발 안내](docs/development.md): 렌더링 구조, 선택적 자동 검사, 배포
- [개편 검증 기록](docs/implementation-report.md): 구현 범위와 실제 검사 결과
- [수동 공개 안내](docs/deployment.md): GitHub Pages 배포와 이전 버전 복원

## HTML 만들기

```sh
tools/hugo --minify
```

완성된 사이트가 `public/`에 생성됩니다. `public/`를 직접 수정하거나 커밋하지 않습니다. 문서를 수정할 때는 원본을 고친 뒤 다시 생성합니다. 배포 경로는 `hugo.toml`의 `baseURL`을 따릅니다.

읽기와 작성은 HTTP 주소를 통해 사용합니다. 생성한 HTML을 `file://`로 더블클릭하는 방식은 모듈과 데이터 로딩 때문에 지원하지 않습니다.

## 설치하지 않아도 되는 것

일반 노트 작성과 HTML 생성에는 Node/npm, 과학 Python, Go, Sass가 필요하지 않습니다. 수식 처리와 JavaScript 빌드는 Hugo 안에서 수행합니다. 이미지·폰트·실험 라이브러리는 저장소의 로컬 자산을 사용합니다.

브라우저 자동 검사는 별도의 CI 개발 환경에서 실행합니다. 기존 과학 계산을 다시 실행하고 싶을 때만 [연구 환경 안내](research/README.md)를 따릅니다.

`references/sqd-docs/`는 기존 자료의 보존본입니다. 새 사이트의 작성·빌드 입력으로 사용하거나 그 안의 HTML을 계속 고치지 않습니다. 이전 주소의 연결과 이관 기록은 `site/data/migration.json`으로 관리합니다.
