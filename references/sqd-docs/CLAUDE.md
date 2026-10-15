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
