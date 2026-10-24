# SQD 문서 모음

Sample-based Quantum Diagonalization(SQD)을 비전공자가 이해하도록 만든 인터랙티브 HTML 문서 12편과, 문서의 모든 숫자를 다시 만드는 스크립트.

```
docs/        허브 index.html(전체 목록), 본문 모음 index-main.html과 본문 문서 11편, 개념 노트와 단일 파일 리더, links.json
             assets/note-catalog.json: 개념 노트의 지도·순서·핵심 질문 목록
scripts/     문서별 데이터 생성 스크립트 (PySCF, ffsim, qiskit-addon-sqd)
data/        스크립트 출력 JSON
tools/       build_all.sh(모든 페이지 생성), check_all.sh(모든 검사), check_html.js(브라우저 없는 점검), relink.py(링크 변환)
shared/      공통 스타일 토큰 base.css
references/  근거 노트북 (IBM)
CLAUDE.md    Claude Code가 자동으로 읽는 작업 지침
```

## 1. 로컬에서 바로 보기
```bash
python3 -m http.server -d docs 8000
# 브라우저에서 http://localhost:8000 → 허브(전체 목록). 본문 모음은 /index-main.html
```

## 2. 개발 환경 (데이터 재생성까지)
Python 3.12, Node 22 이상을 권장합니다. PySCF는 Windows 네이티브를 지원하지 않으므로 Windows에서는 WSL을 쓰세요.
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python scripts/run_all.py            # data/*.json 재생성 (약 2분)
node tools/check_html.js             # 모든 페이지 점검
tools/check_all.sh --no-browser      # 유닛 테스트, 노트 구조, 허브 최신성, 데이터, 가짜 DOM
```

## 3. Claude Code 설치와 실행
공식 설치 방법(출처: github.com/anthropics/claude-code README):
```bash
# macOS / Linux / WSL
curl -fsSL https://claude.ai/install.sh | bash
# 또는 Homebrew
brew install --cask claude-code
# Windows PowerShell
irm https://claude.ai/install.ps1 | iex
```
그다음 이 폴더에서 `claude`를 실행하고 로그인 안내를 따릅니다. 저장소 루트의 CLAUDE.md를 읽고 문서 규칙(숫자는 스크립트로, 반응형, id 유일 등)을 따라 작업합니다. 첫 요청 예:
> CLAUDE.md의 "알려진 불일치"를 해결해 줘. 00-quickstart.html을 data/00_quickstart.json에 맞추고 check_html.js로 확인해.

자세한 설정·인증·요금은 공식 문서를 보세요: https://code.claude.com/docs/en/overview , https://code.claude.com/docs/en/setup

## 4. 클라우드 환경
**A. GitHub Codespaces (권장, 설정 포함)**
1. 이 폴더를 GitHub 저장소로 올립니다: `git init && git add . && git commit -m "init" && git remote add origin <URL> && git push -u origin main`
2. GitHub에서 Code → Codespaces → Create codespace.
3. `.devcontainer/devcontainer.json`이 Python 3.12 + Node 22 + requirements + Claude Code 설치를 자동으로 합니다.
4. 터미널에서 `claude` 실행. 미리보기는 `python -m http.server -d docs 8000` 후 포트 8000 열기.

**B. 아무 클라우드 리눅스 VM (EC2, GCE 등)**
2절과 3절 명령을 그대로 실행합니다. 미리보기는 SSH 포트 포워딩(`ssh -L 8000:localhost:8000 …`)으로.

**C. 데스크톱·모바일 앱에서 원격으로**
Claude Code는 데스크톱 앱과 모바일 앱에서도 쓸 수 있습니다. 저장소를 GitHub에 올려 두면 이 방식들로도 같은 저장소를 열 수 있으니, 현재 지원 방식은 공식 문서에서 확인하세요.

## 5. 공개 (선택)
GitHub 저장소 Settings → Pages → Deploy from a branch → `main` / `/docs`. 문서들이 상대 링크로 연결되어 있어 그대로 동작합니다. references/의 IBM 노트북은 공개 전에 포함 여부를 판단하세요.
