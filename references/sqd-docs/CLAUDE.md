# SQD 문서 프로젝트: Claude Code 작업 지침

비전공자(이과 1학년~)가 Sample-based Quantum Diagonalization(qiskit-addon-sqd)을 이해하도록 만든 한국어 HTML 문서 모음이다. claude.ai에서 시작해 이 저장소로 옮겨 왔다.

## 문서 지도 (읽는 순서)
| 파일 | 역할 |
|---|---|
| docs/index.html | 문서 모음 (카드, 순서표, 관통 숫자표) |
| docs/background-atoms.html | 배경: 주기율표·원자 (1~18번 인터랙티브) |
| docs/intro.html | 입문: H₂로 SQD 열 단계, 코드 없음, 3D 궤도 |
| docs/prep-math.html | 준비: 장난감 행렬 [[2,1],[1,2]], 기댓값·분산, 퀴즈 |
| docs/math.html | 수학: A부 그림으로 대각화(타원체 3D), B부 샘플링 식 |
| docs/00-quickstart.html | 공식 Quickstart 셀 단위 해설 (N₂ STO-3G, 난수 비트열) |
| docs/01-pyscf.html → 06-sqd-guide.html | 데이터 흐름 순: PySCF → JW → UCJ → 회로 → 샘플링 → SQD 본체 |

순서: 배경 → 입문 → 준비 → 수학, 그리고 0 → 1 → … → 6. 각 문서 위·아래 `.docnav`에 이전/다음 링크가 있다. 문서를 추가하면 index.html 카드, 양옆 문서의 docnav, docs/links.json을 함께 고친다.

## 절대 규칙
1. **숫자는 계산해서 넣는다.** 문서의 모든 수치는 scripts/의 스크립트가 data/*.json으로 만든 값이다. 숫자를 바꾸려면 스크립트 → `python scripts/run_all.py` → JSON 확인 → HTML 순서로. 설명용 가상값을 쓰면 캡션에 "설명용"이라고 밝힌다.
2. **독자 수준을 지킨다.** 입문·배경·준비는 수식 없이(접이식 `<details>`에만 허용), 쉬운 말 뒤에 정확한 용어를 대응표로 붙인다. 비유는 단위가 맞아야 한다(예: "비용"과 "크기"를 섞지 않기).
3. **반응형.** 모든 SVG 그림은 JS로 그리고, `narrow()`(max-width 600px)일 때 360폭 세로 레이아웃으로 다시 그린다(`mq.addEventListener('change', drawAll)`). 고정 SVG를 직접 쓰지 않는다. 페이지 폭은 `min-width:0`과 `overflow-x:hidden`으로 보호되어 있다.
4. **그림은 서로 격리.** `drawAll`은 함수마다 try/catch, 3D(three.js)는 drawAll 뒤에 별도 try/catch. WebGL이 없어도 나머지가 동작해야 한다.
5. **id는 문서 안에서 유일.** 절 제목 id와 입력 id가 겹쳐 슬라이더가 NaN이 된 적이 있다. 그림 SVG id는 `-fig`로 끝낸다(검사 도구가 빈 그림을 찾을 때 쓴다).
6. **스타일.** shared/base.css의 토큰(--ink, --accent, --alpha(↑/α 주황), --beta(↓/β 청록), --n(파랑))만 쓴다. 다크 모드는 토큰으로 자동. 글꼴 IBM Plex Sans KR / Mono. three.js는 `https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js` 고정.
7. **비트열 규약** [β 왼쪽 | α 오른쪽], 각 절반은 궤도 번호 큰 쪽이 왼쪽. 문서 전체에서 일관.

## 작업 후 확인
```bash
node tools/check_html.js            # 스크립트 오류, 중복 id, 빈 그림
node tools/check_html.js --narrow   # 폰 레이아웃 경로
python -m http.server -d docs 8000  # 브라우저 확인 (데스크톱 + 개발자도구 모바일 뷰)
```

## 데이터 재생성
`python scripts/run_all.py` (약 2분). 각도 최적화까지: `python scripts/run_all.py --optimize` (수 분 추가). run_all은 OMP_NUM_THREADS=1로 고정한다.
| 스크립트 | 문서 |
|---|---|
| intro_h2.py | intro.html (H₂ 4×4, 결합 늘리기, 궤도 곡선, orb3d.json) |
| p00_quickstart.py | 00-quickstart.html |
| p01_pyscf_n2.py … p06_sqd_guide.py | 01 … 06 |
| math_n2_krylov.py | math.html (3136×3136, 랑초스, 부분공간) |

## 알려진 불일치 (처음 할 일)
- **00-quickstart.html**: 본문 표는 "8회 반복, 7회째 오차 0"으로 적혀 있으나, OMP_NUM_THREADS=1 재현은 7회 반복·최종 오차 0.1 mHa(data/00_quickstart.json). SQD 반복은 PySCF 대각화의 스레드 수에 따라 결과가 달라진다. 재현 값으로 표·그림(`var IT=`)·본문을 맞추거나, "실행마다 달라진다"는 문장을 넣을 것. 옵션 비교표(symmetrize_spin 등)도 같은 이유로 재확인.
- 06-sqd-guide.html 최종 오차 1.45 mHa vs 재현 1.44 mHa (반올림 차이, 허용).
- math.html의 부분공간 오차(SUBERR)는 결정적 정렬로 다시 계산한 값으로 이미 맞춤.

## claude.ai로 다시 게시할 때
docs/links.json에 원래 게시 주소가 있다. `python tools/relink.py --to-published`로 링크를 게시 주소로 바꾼 뒤 파일을 올리고, 끝나면 `--to-relative`로 되돌린다. claude.ai에서 받은 파일은 `python tools/relink.py --import 받은파일.html math.html`.

## references/
IBM 공식 노트북 두 개(Quickstart, SQD 튜토리얼). 00-quickstart.html의 근거. 저작권은 IBM에 있으니 공개 저장소에 올릴지 확인할 것.

## 개념 노트의 용어 표기
논문에서 용어를 찾기 쉽도록 핵심 개념은 한국어(English) 형식으로 병기한다. 예: 기저(Basis), 고유벡터(Eigenvector). 페이지 제목과 본문에서 처음 소개할 때 표기하고, 반복되는 문장에서는 한국어만 사용해 가독성을 유지한다.

행렬·벡터 개념 노트에서는 벡터 좌표를 세로 열벡터(Column Vector)로 표시한다. 특정 기저에서의 좌표라는 점을 밝히고, 일반 벡터의 성분 제곱을 곧바로 확률로 설명하지 않는다. 수식은 KaTeX로 렌더링한다. 단일 파일 미리보기에서도 동작하도록 생성 리더에는 라이브러리·CSS·WOFF2 글꼴을 내장하며 CDN에 의존하지 않는다.

각 개념 노트는 짧고 정확한 정의 → 쉬운 해설 → 예시·실험 → 적용 조건과 주의점 → 연관 개념 순서로 작성한다. 정의는 표준 수학 용어와 필요한 조건을 포함하고, 예시나 비유를 정의 자체로 제시하지 않는다. 특정 교과서의 직접 인용이 아니라면 인용으로 표시하지 않는다.

## 용어 설명창
개념 노트의 어려운 용어는 각 페이지의 첫 등장에 점선 밑줄 설명창을 제공한다. 마우스 오버·키보드 초점·터치로 열고 Esc·바깥 클릭·다시 터치로 닫는다. 정의와 예시, 가능한 경우 관련 개념 링크를 포함한다. 용어 데이터는 docs/assets/concept-glossary.json, 동작은 docs/assets/concept-glossary.js에서 관리한다. 변경 후 `python3 tools/enrich_concepts.py` → `python3 tools/build_concepts.py` 순서로 소스 페이지와 단일 파일 리더를 갱신한다. 설명창의 자동 생성 마크업을 직접 고치기보다 데이터와 생성 도구를 수정한다.

모든 용어 설명창에는 정의 외에 간단한 구체적 예시를 제공한다. concept-glossary.json의 worked_example과 worked_parts에서 관리하며, 벡터는 열벡터·행렬은 행과 열이 보이는 형태로 표시한다. 일반 성질을 반복하는 문장만으로 예시를 대체하지 않는다.

## 양자화학 개념 지도
`docs/concept-quantum-chemistry.html`은 지도 소스다. 첫 학습 묶음은 `quantum-state` → `born-rule` → `superposition` → `observable` → 기존 `hamiltonian` → `schrodinger` 순서다. 후속 16개 노트는 `born-oppenheimer`부터 `potential-energy`까지 핵·전자 분리, 다전자 상태, 적분과 행렬원소, 근사 계산과 화학적 해석의 네 묶음으로 연결한다. 지도에서는 기존 노트와 같은 제목·핵심 질문 카드로 표시하고, 네 주제 묶음을 유지한다. 새 주제를 추가할 때 실제 페이지가 준비된 링크만 제공한다.

`python3 tools/build_concepts.py`는 동일한 전체 개념 노트를 포함하는 독립 HTML 두 개를 생성한다. `docs/concepts.html`은 수학 지도로, `docs/quantum-chemistry.html`은 양자화학 지도로 시작한다. 둘 다 CSS·스크립트·관련 개념을 포함하므로 단일 파일 미리보기에서 링크가 동작한다. 공유할 때는 소스 페이지 대신 이 생성 파일을 사용한다. 지도 선택 버튼이 동적으로 만드는 링크도 단일 파일에서는 해시 경로를 사용해야 한다.

양자화학 예시는 기저·정규화·측정 관측량과 단위를 밝힌다. 정규직교 기저의 확률 진폭과 오비탈 전개 계수를 구별하며, 에너지 기댓값과 한 번의 측정 결과를 구별한다. 기댓값의 반복 측정은 동일한 상태를 매번 새로 준비하는 상황으로 설명한다. 전역 위상·상대 위상·기저 표현 변경은 서로 다른 조작임을 표시한다. 정상상태도 파동함수의 전역 위상은 시간에 따라 변한다.

양자화학 실험이나 리더 탐색을 변경하면 `node tools/check_quantum_concepts.cjs`로 브라우저 검증한다. Playwright와 Chromium이 필요하며, 기존 설치를 사용할 때는 `PLAYWRIGHT_MODULE`에 모듈 경로, `CHROMIUM_PATH`에 실행 파일 경로를 지정할 수 있다. 이 검사는 상태·확률·위상·기댓값·잔차 수치, 단일 파일의 내부 링크, 뒤로 가기·새로고침, 설명창, 모바일 터치를 확인한다.

양자 상태의 브라–켓, 기저 전개, 정규화, 분수·첨자는 KaTeX 0.19.0으로 HTML 수식과 접근성용 MathML을 함께 표시한다. 새 수식은 `<span class="math-tex" data-tex="LaTeX 수식">읽을 수 있는 대체 텍스트</span>`로 작성한다. `tools/concept_math.py`의 명시적 카탈로그는 본문·설명창의 기존 표현을 같은 마크업으로 변환하며, 임의의 한국어 문장을 TeX로 해석하지 않는다. `assets/concept-math.js`는 이 마크업과 `.math-array`의 원본 셀을 렌더링하고 실험의 DOM 갱신도 반영한다. 원본 셀은 계산·검증용으로 보존한다. KaTeX 배포본과 MIT 라이선스는 `assets/vendor/katex/`에서 버전을 고정한다. `build_concepts.py`가 라이브러리·스타일·글꼴·라이선스를 리더에 내장하므로 빌드에 npm 설치가 필요 없다. 변경 후 브라우저 검사로 외부 요청 없이 글꼴과 수식이 표시되는지, 모바일 수식 폭과 슬라이더 수치가 맞는지 확인한다. 같은 상태와 기저별 좌표를 구별하고, 반올림한 계수로 표시하는 상태 전개에는 근사 기호를 사용한다.

후속 전자 구조 노트의 실험을 변경하면 `node tools/check_followup_concepts.cjs`도 실행한다. `tools/followup_checks/a.cjs`부터 `d.cjs`까지는 각 묶음의 독립 수치 검증이며, 공통 하네스가 360px 다크/1280px 라이트에서 지도·수식·관련 링크·터치 설명창을 함께 확인한다. 설명용 이산 모형·Hubbard 모형·Morse 모형을 실제 분자의 계산 결과나 일반적인 근사법의 보장으로 읽게 만들지 않는다.

보른–오펜하이머 페이지의 H₂ 실험은 `scripts/bo_h2.py`가 계산한 `data/bo_h2.json`의 FCI/STO-3G 에너지와 같은 상태의 전자 밀도를 사용한다. 계산 환경·단위·검증은 `scripts/bo_h2_README.md`에 기록한다. 화면은 `tools/bo-molecule-lab.html`, 동작은 `docs/assets/bo-molecule.js`에서 수정하고, `python3 tools/build_bo_molecule.py` → `python3 tools/enrich_concepts.py` → `python3 tools/build_concepts.py` 순서로 생성한다. 일반 HTML 빌드에는 PySCF가 필요 없다. 3Dmol.js 2.5.5와 라이선스를 `docs/assets/vendor/3dmol/`에서 리더에 내장하며, 외부 분자 데이터·CDN·워커를 요청하지 않는다. WebGL을 사용할 수 없으면 같은 밀도의 2D 단면을 표시한다. 변경 시 `python3 tools/check_bo_h2_data.py`와 `node tools/check_bo_molecule.cjs`로 수치, 실제 3D, 대체 화면, 모바일 조작을 확인한다. 기존 두 상태 모형은 `#bo-advanced-model`의 접힌 심화 설명에 유지한다.

## VQE 학습 지도
`docs/concept-vqe.html`은 평균 에너지 → 기존 변분 원리 → 안사츠 → 회로 → 파울리 분해 → 샷 오차 → 최적화 → 전체 반복 → 전자·큐빗 매핑 → H₂ 계산을 카드로 연결한다. 공통 설명용 모형은 H = [[0.8, −0.5], [−0.5, 1.2]] = I − 0.5X − 0.2Z이며 에너지는 임의 단위다. 회로는 Ry(θ)|0⟩이고 계수는 cos(θ/2), sin(θ/2)다. UI 각도는 도, 삼각함수·미분·최적화는 라디안으로 통일한다. 기존 변분 원리 실험의 벡터 각도와 회로 각도가 두 배 차이임을 설명한다. 정확한 기댓값 시뮬레이션, 유한 샷 표본, 실제 하드웨어 잡음은 구분한다.

H₂ 예제는 `scripts/vqe_h2.py`로 생성한 `data/vqe_h2.json`을 사용하며 조건과 재현 방법은 `scripts/vqe_h2_README.md`에 있다. 4개 스핀 오비탈의 전체 점유 공간, 전자 수·스핀 고정 부분공간, 반전 대칭의 두 배치 블록을 구분한다. 하나의 논리 큐빗으로 줄인 것은 이 분자·기저·대칭의 특수한 경우다. `python3 tools/build_vqe_hydrogen.py`를 enrich/build 전에 실행한다. 일반 HTML 빌드는 PySCF 없이 저장된 JSON을 내장한다. `python3 tools/check_vqe_h2_data.py`와 `node tools/check_vqe_concepts.cjs`로 계산·단계 진행·표본 재구성·지도·수식·용어창을 검증한다. 기존 브라우저 검사와 같은 PLAYWRIGHT_MODULE/CHROMIUM_PATH를 사용하며 VQE_SCREENSHOT_DIR로 검사 화면을 저장할 수 있다.
