# 모바일에서 개념 노트 열기

`/workspace/...`는 클라우드 작업공간의 파일 경로이며, 모바일에서 접근 가능한 웹 주소가 아니다. iOS의 Files 앱이나 파일 미리보기는 HTML의 JavaScript 실행도 보장하지 않는다. 인터랙티브 기능을 쓰려면 정적 웹 호스팅의 HTTPS 주소를 Safari 등의 브라우저에서 연다.

## 게시할 파일 준비

저장소의 `references/sqd-docs`에서 실행한다.

```bash
python3 tools/enrich_concepts.py
python3 tools/build_concepts.py
python3 tools/package_concept_site.py --output /tmp/note-concept-site
```

출력 폴더에는 다음 네 파일만 들어간다.

- `index.html`: 양자화학 지도로 시작하는 전체 개념 리더
- `quantum-chemistry.html`: 같은 리더의 명시적인 파일 주소
- `concepts.html`: 수학 지도로 시작하는 전체 개념 리더
- `.nojekyll`: GitHub Pages의 추가 처리를 생략하는 표식

각 리더는 CSS·JavaScript·연관 개념을 포함한다. 논문 원문, 참고 노트북, 계산 데이터, 저장소 설정은 게시 폴더에 포함되지 않는다. 동일한 출력 폴더를 다시 만들 때는 새 경로 또는 빈 폴더를 지정한다.

## GitHub Pages로 게시

이 방법은 개념 노트를 웹에 공개한다. 실제 게시를 승인한 뒤 다음 순서로 진행한다.

### 이미 준비된 `gh-pages` 브랜치 사용

현재 개념 리더는 `gh-pages` 브랜치에도 게시용 파일 네 개만 담아 올려 두었다. GitHub API에 접근할 수 없는 환경에서는 저장소의 **Settings → Pages**에서 다음 항목을 선택한다.

- **Source:** Deploy from a branch
- **Branch:** gh-pages
- **Folder:** / (root)
- **Save**를 누르고 Pages 화면의 배포 결과를 확인한다.

이 방식은 `gh-pages` 브랜치의 파일을 게시한다. 원본을 수정하거나 `main`을 갱신하는 것만으로 이 브랜치가 갱신되지는 않는다. 이후 자동 빌드로 전환하려면 아래 GitHub Actions 방식을 사용한다.

### GitHub Actions로 원본에서 빌드

1. 개념 페이지·자산·생성 도구와 `.github/workflows/concept-pages.yml`을 저장소에 반영한다.
2. 저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정한다. 계정·저장소 요금제에 따라 Pages 사용 가능 여부가 다를 수 있다.
3. **Actions → Publish concept notes → Run workflow**에서 반영된 브랜치를 선택한다.
4. 배포가 성공하면 `github-pages` 환경에 표시된 실제 URL을 사용한다. 호스트 주소를 추측해서 완료된 링크로 안내하지 않는다.
5. 휴대전화 Safari에서 URL을 열고 지도 → 개념 페이지 이동, 슬라이더, 터치 설명창을 확인한다.

워크플로는 수동 실행만 허용한다. 커밋이나 PR을 올리는 것만으로 사이트가 게시되지는 않는다. 기존 Pages 사이트가 있다면 이 워크플로가 같은 사이트를 교체할 수 있으므로 기존 설정을 먼저 확인한다.

GitHub API 조회나 Pages 설정 변경이 현재 환경에서 차단되어 있으면 GitHub 웹 화면에서 설정한다. 읽기 요청의 `Forbidden` 응답만으로 토큰이 없다고 판단하지 않는다. 이 작업공간에서의 브라우저 검사는 실제 iOS 앱 실행이나 공개 배포 검증을 대신하지 않는다.
