# 검사와 수동 공개

일반 노트 작성에는 Hugo와 브라우저만 필요합니다. Python·Node·Playwright·브라우저 검사 도구는 GitHub Actions의 검증 환경에서 설치합니다. 과학 계산용 Python 패키지는 배포 과정에서도 설치하지 않습니다.

## 실행 조건

`.github/workflows/concept-pages.yml`의 **Concept notes** 워크플로를 사용합니다.

- `main`에 push하거나 PR을 열고 갱신하면 검사만 수행합니다.
- GitHub의 **Actions → Concept notes → Run workflow**를 직접 실행하면 검사 성공 후 공개합니다.
- 사이트 주소는 `https://inojeon.github.io/note/`입니다. 저장소의 **Settings → Pages → Build and deployment → Source**는 **GitHub Actions**로 설정합니다.
- 공개할 브랜치를 `Run workflow`에서 선택합니다. 실행 화면의 커밋 SHA가 의도한 원본인지 확인할 수 있습니다.

배포에는 검증이 끝난 `public/`를 사용합니다. 이 폴더를 커밋하거나 배포 직전에 다시 생성하지 않습니다. push·PR 실행에는 Pages 배포 권한이 없고, 수동 실행의 별도 배포 작업만 Pages 쓰기 권한을 받습니다.

## CI에서 확인하는 것

실행 환경은 Ubuntu 24.04, Python 3.12, Node 22입니다. Hugo 버전의 기준은 `.hugo-version`이며 `tools/install-hugo.sh`가 해당 버전의 표준 바이너리를 내려받아 릴리스 체크섬을 검증합니다. 현재 버전은 0.168.0입니다. Playwright는 `tests/package-lock.json`에 고정한 1.62.1을 `npm ci --prefix tests`로 설치합니다.

1. 작성 원본과 보존 자료의 체크섬을 기록합니다.
2. `http://localhost/` 기준 결과를 `.cache/site-root/`에, `/note/` 배포 기준 결과를 `public/`에 생성합니다.
3. 빌드 전후 체크섬을 비교해 원본이 바뀌지 않았는지 확인합니다.
4. 별도 임시 복사본에서 잘못된 링크·수식·실험·메타데이터·JavaScript가 빌드를 실패시키는지 검사합니다.
5. 두 경로에서 전체 로컬 링크·자산·앵커, 콘텐츠·실험 계약, 기존 주소와 계산 자료의 이관 범위를 확인합니다.
6. Chromium은 두 경로의 모든 실험을 조작합니다. WebKit은 두 경로의 공통 화면과 대표 2D·3D 실험을 검사합니다. 검색·개념 미리보기·테마·모바일 폭·실패와 재시도·구형 주소 연결도 검사합니다.
7. 검사 후 원본 체크섬과 Git 작업 트리가 그대로인지 확인합니다.
8. 모든 검사에 성공한 수동 실행만 `public/`를 `github-pages` 아티팩트로 업로드하고 공개합니다.

Hugo·Playwright 버전을 변경할 때는 버전 파일과 잠금 파일을 함께 검토하고 두 배포 경로를 다시 검사합니다. WebKit의 범위와 브라우저 조작 시나리오는 `tests/browser.mjs`에 정의되어 있습니다. 실험 수가 늘면 Chromium은 생성된 manifest의 새 실험도 자동으로 순회합니다.

## 실패한 검사 확인

각 실행의 **Artifacts → validation-실행번호-시도번호**에서 빌드·구조·브라우저 로그, JSON 보고서, 실패 화면과 대표 화면 스크린샷을 확인합니다. 검사 결과는 실패한 실행에서도 업로드하며 30일 보관합니다. 검증이 끝난 Pages 아티팩트도 30일 보관합니다. 아티팩트 보관 종료가 이미 공개된 사이트를 삭제하지는 않습니다.

오류를 고친 원본을 push하고 검사가 통과하면 다시 수동 실행합니다. 검사 실패나 빌드 실패 시 새 Pages 아티팩트를 배포하지 않으므로 기존 공개 버전이 유지됩니다. 실제 공개 결과는 워크플로의 `deploy` 작업과 저장소의 `github-pages` 배포 기록에서 확인합니다.

## 이전 공개 버전으로 되돌리기

이전 성공 배포의 **원본 커밋**을 별도 브랜치로 지정하고 동일한 수동 워크플로로 다시 검사·배포합니다. 아티팩트가 30일을 지나 삭제되어도 원본 커밋과 고정된 버전으로 다시 생성할 수 있습니다.

1. GitHub의 이전 성공한 **Concept notes** 실행을 열어 배포에 사용한 커밋 SHA를 복사합니다. 이 개편 워크플로가 포함된 성공 커밋을 선택합니다.
2. 저장소에서 아래 값을 실제 SHA와 새로운 브랜치 이름으로 바꾸고 실행합니다. 현재 로컬 체크아웃은 바꾸지 않습니다.

```sh
rollback_commit='여기에_이전_성공_커밋_SHA'
rollback_branch='codex/rollback-pages-20261026'
git fetch origin
git show --no-patch "$rollback_commit"
git push origin "$rollback_commit:refs/heads/$rollback_branch"
```

3. **Actions → Concept notes → Run workflow**에서 방금 만든 브랜치를 선택합니다.
4. 같은 빌드·구조·브라우저 검사가 성공하면 그 커밋의 `public/`가 공개됩니다. 실행 결과에 표시된 배포 링크를 열어 확인합니다.

이미 존재하는 되돌림 브랜치를 강제로 덮어쓰지 않고 새 이름을 사용합니다. 이 절차는 `main`의 내용을 변경하지 않습니다. 문제가 해결된 최신 `main`을 다시 공개하려면 그 브랜치로 수동 워크플로를 실행합니다. 되돌림 대상도 검사에서 실패하면 배포를 진행하지 않고 실패 원인을 확인합니다.
