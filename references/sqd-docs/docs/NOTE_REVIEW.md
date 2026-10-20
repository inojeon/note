# 개념 노트 개편·검토 기록

검토일: 2026-10-20

기존 개념 노트 59개를 공통 구성으로 정리하고, 네 개의 독립된 실험을 분리해
63개 노트로 재구성했다. 학습 지도·메인은 6개다. 기존 노트의 주소를 유지하고
새 노트는 지도, 검색, 기존 노트의 관련 카드에서 찾을 수 있게 했다.

## 구성과 분량

각 노트는 `정의와 핵심 → 예시와 실험 → 기억할 점 → 연결해서 읽기` 순서다.
선수 개념은 최대 두 개, 주요 관련 카드는 최대 세 개다. 카드에는 연결 관계와
다음 노트의 질문을 함께 표시한다. 실험 안내와 펼쳐 보는 확인 문답도 제공한다.

기본 본문은 2,200자 이하를 유지하도록 검사한다. 아래 길이는 공백을 정규화하고
제목·탐색·관련 카드·SVG·스크립트·설명창을 제외한 수치다. 접힌 상세 내용은
요약 제목만 세며, 예시의 정적인 설명과 라벨은 포함한다. 동적으로 나타나는
계산값과 그래프의 높이는 이 수치로 평가하지 않으므로 브라우저 검사도 병행한다.

| 기존 노트 | 분리한 노트 | 분리 이유 |
|---|---|---|
| 대각화 | 대각화와 좌표축 바꾸기 | P·D·P⁻¹의 역할과 좌표축 회전은 각각 한 실험으로 이해한다. |
| STO-3G와 기저 집합의 선택 | 기저 집합과 오비탈 에너지 | 함수 수·수축의 뜻과 실제 RHF 준위의 해석을 나눈다. |
| 기저와 분자로 비교하는 해밀토니안 | H₂의 두 배치와 에너지 | 행렬 크기·대칭 비교와 계수·상대 부호·에너지 계산을 나눈다. |
| 큰 분자의 해밀토니안 | 적분 수와 상태 공간의 크기 | 연산자를 정의하는 과정과 계산 규모 비교를 나눈다. |

슈뢰딩거 방정식은 고유값 문제와 잔차 실험에 집중하도록 반복 설명을 줄였다.
양자 상태의 첫 정의는 짧게 하고, 힐베르트 공간·전역 위상의 엄밀한 설명은
펼쳐 읽도록 옮겼다. 실험의 기저, 단위, 고정한 조건, 설명용 모형 여부는 유지했다.

## 발견해 수정한 내용

| 문제 | 수정 |
|---|---|
| 전자 좌표 교환과 HF 교환 항을 `교환(Commutativity)`으로 설명 | `교환(Exchange)`과 `교환 법칙(Commutativity)`의 정의·예시를 분리했다. |
| 페르미온의 `반교환` 안에 교환법칙 설명이 붙음 | `반교환(Anticommutation)`을 별도로 정의했다. |
| `생성 연산자`와 `생성 스크립트`에 벡터 공간의 `생성(Span)`이 붙음 | `생성 연산자(Creation Operator)`를 분리하고 다의적인 단어는 영어를 명시한 경우만 연결한다. |
| `행렬식`이 `행렬(Matrix)식`으로 분리됨 | 완전한 단어를 우선 매칭하고 행렬식의 정의와 예시를 추가했다. |
| `비직교`에 `직교(Orthogonality)` 설명이 붙음 | `비직교(Nonorthogonal)`를 별도로 설명한다. |
| 포함 관계의 기저 집합을 `중첩(Superposition)`으로 설명 | “포함 관계인 기저 집합”으로 고쳐 양자 중첩과 구별했다. |
| 내적에서 정의하는 길이가 모든 노름의 정의처럼 읽힘 | “이 내적에 대응하는 노름”으로 범위를 명확히 했다. |
| 상태 벡터의 정의가 특정 기저의 좌표 표현으로만 제한됨 | 추상적인 상태 벡터와 기저를 정한 뒤의 열벡터 표현을 구별했다. |
| 복합 용어의 영어가 중복되거나 짧은 단어 설명이 끼어듦 | 긴 용어를 우선하고, 이미 다른 영어가 붙은 용어를 덮어쓰지 않게 했다. |
| 변분 원리 설명의 “더 큰 집합”이 단순 개수 증가로 읽힐 수 있음 | 기존 후보 집합을 포함하는 경우라는 조건을 명시했다. |

자동 연결 오류는 HTML 한 곳만 고치지 않고 용어 데이터와 생성 규칙에서 수정했다.
이 항목들을 다시 잘못 연결하면 `check_note_structure.py`가 실패한다.

## 과학적 설명의 검토 범위

기존 59개 노트와 분리한 네 노트의 정의, 예시, 적용 조건을 검토했다. 특히 다음
구별을 유지했다.

- 벡터와 좌표, 상태 변경과 기저 변경, 전역 위상과 상대 위상.
- 진폭과 확률, 확률 밀도와 영역 확률, 한 번의 측정값과 기댓값.
- 상태 준비 게이트와 해밀토니안, 오비탈 에너지와 다전자 총 에너지.
- 스핀 오비탈 수·전자 수·행렬식 수·큐빗 수, 고정 Mₛ와 고정 총스핀 S.
- 대칭 행렬과 분자의 반전 대칭, 대칭 블록 선택과 일반적인 기저 절단.
- 해밀토니안의 적분 계수를 정의하는 일과 바닥상태를 푸는 일.
- VQE의 에너지 추정과 SQD의 배치 표본, 측정 빈도와 최종 고유벡터 계수.
- 같은 해밀토니안·포함 관계의 공간에서 성립하는 변분 상계와 임의의 다른 계산 비교.

본문의 검토와 수치 검증은 구별한다. 수치 검증은 저장된 분자 계산 자료,
별도로 구현한 선형대수·확률 계산, 실제 브라우저 결과를 비교한다. 이번 개편에서
PySCF의 모든 분자 계산을 새로 실행하거나 모든 설명을 원전과 문장별로 대조한
것은 아니다. 새 계산이나 논문 사례를 추가할 때에는 해당 계산 조건과 근거 자료의
검토가 추가로 필요하다.

## 검증

다음 검사를 수행했다. 브라우저 검사는 자체 내장 HTML을 360px 다크 / 1280px 라이트
화면에서 사용하며, 외부 라이브러리나 데이터 요청 없이 동작하는지 확인한다.

| 범위 | 검사 |
|---|---|
| 63개 노트의 공통 구성·분량·지도 등록·용어 오연결 | `python tools/check_note_structure.py` |
| 전 노트의 펼친 수식·터치 확인 문답·카드·분리한 노트 이동 | `node tools/check_note_remodel.cjs` |
| 스크립트 오류·중복 ID·빈 그림 | `node tools/check_html.js` 및 `--narrow` |
| 양자 상태·위상·확률·관측량·잔차 | `node tools/check_quantum_concepts.cjs` |
| 전자 구조 16개 주제의 독립 수치 계산 | `node tools/check_followup_concepts.cjs` |
| VQE·회로·측정·텐서곱·얽힘·평균 에너지 | `node tools/check_vqe_concepts.cjs`, `node tools/check_bridge_concepts.cjs` |
| 검색·키보드·터치·선택 버튼 | `node tools/check_search.cjs`, `node tools/check_choices.cjs` |
| H₂ 분자와 밀도, WebGL 대체 화면 | `node tools/check_bo_molecule.cjs`, `python tools/check_bo_h2_data.py` |
| 블로흐 구의 3D 투영·카메라·측정 평면 | `node tools/check_bloch_3d.cjs`, `node tools/check_measurement_bloch.cjs` |
| 각도별 Hc 및 두 방식의 평균 에너지 | `node tools/check_energy_walkthrough.cjs` |
| 기저별 함수 수·오비탈 준위·축척 | `node tools/check_sto3g.cjs`, `node tools/check_basis_orbitals.cjs` |
| SQD의 모든 게이트 단계·표본·부분공간 고유쌍 | `node tools/check_sqd_concepts.cjs` |
| H₂의 네 거리·위상·핵 반발·변분 에너지 | `node tools/check_h2_hamiltonian.cjs`, `python tools/check_vqe_h2_data.py` |
| H₂·HeH⁺의 2/4배치 행렬과 에너지 | `node tools/check_hamiltonian_comparison.cjs` |
| 큰 정수 배치 수·적분 수·저장량 | `node tools/check_large_hamiltonian.cjs` |

실험 삽입 도구도 다시 실행해 이동한 노트의 데이터 경계가 유지되는지 확인했다.
개편 → 용어 보강 → 리더 빌드를 재실행해 모든 소스와 리더의 내용이 바뀌지 않는
멱등성도 확인했다. SQD 회로는 모바일에서 누적 게이트를 한 줄 가로 스크롤로 유지한다.

## 이후 개선의 우선순위

1. **목표별 짧은 학습 경로**: “VQE 에너지 측정 이해”, “SQD의 양자 계산 이해”처럼
   현재 지도 안에서 필요한 노트만 고른 3–5개짜리 경로를 더한다.
2. **읽은 노트와 다시 볼 노트 표시**: 기기 안에 저장하는 선택형 학습 기록을 둔다.
3. **출처와 검토 이력의 세분화**: 중요한 주장과 실제 분자 수치에 근거·조건·검토일을
   연결하고, 새 연구를 추가할 때 재검토할 지점을 명시한다.

자동 검사로 확인 가능한 구조와 수치, 사람이 읽어 검토해야 하는 설명을 계속 나누어
관리한다. 새로운 내용을 기존 노트에 계속 덧붙이기 전에 별도의 질문인지 먼저 판단한다.

## 노트별 기본 본문 길이

`check_note_structure.py`의 개편 후 결과다. 모든 행은 공통 구성·기본 분량 검사를
통과한 노트이며, 숫자는 독서 시간이나 과학적 정확도 점수가 아니다.

| 노트 | 기본 본문 | 상세 펼침 포함 |
|---|---:|---:|
| [벡터(Vector)](concept-vector.html) | 1,098자 | 1,214자 |
| [기저(Basis)와 좌표(Coordinates)](concept-basis.html) | 619자 | 711자 |
| [내적(Inner Product)과 길이](concept-inner-product.html) | 784자 | 900자 |
| [행렬(Matrix)과 선형변환(Linear Transformation)](concept-matrix.html) | 927자 | 1,019자 |
| [대칭 행렬(Symmetric Matrix)](concept-symmetric.html) | 627자 | 745자 |
| [고유벡터(Eigenvector)와 고유값(Eigenvalue)](concept-eigen.html) | 557자 | 629자 |
| [대각화(Diagonalization)](concept-diagonalization.html) | 1,106자 | 1,206자 |
| [대각화와 좌표축 바꾸기](concept-diagonalization-coordinates.html) | 850자 | 1,081자 |
| [멱법(Power Method)과 반복](concept-power.html) | 1,496자 | 2,233자 |
| [부분공간(Subspace)과 투영](concept-subspace.html) | 1,123자 | 1,433자 |
| [크릴로프 공간(Krylov Subspace)과 랑초스(Lanczos Algorithm)](concept-krylov.html) | 1,399자 | 1,648자 |
| [해밀토니안(Hamiltonian)과 에너지](concept-hamiltonian.html) | 1,770자 | 2,669자 |
| [양자 상태(Quantum State)와 파동함수(Wavefunction)](concept-quantum-state.html) | 1,076자 | 2,639자 |
| [확률 진폭(Probability Amplitude)과 보른 규칙(Born Rule)](concept-born-rule.html) | 961자 | 1,799자 |
| [중첩(Superposition)과 상대 위상(Relative Phase)](concept-superposition.html) | 1,422자 | 2,237자 |
| [관측량(Observable)과 기댓값(Expectation Value)](concept-observable.html) | 1,174자 | 1,983자 |
| [슈뢰딩거 방정식(Schrödinger Equation)](concept-schrodinger.html) | 1,891자 | 3,393자 |
| [보른–오펜하이머 근사(Born–Oppenheimer Approximation)](concept-born-oppenheimer.html) | 1,263자 | 2,991자 |
| [오비탈(Orbital)](concept-orbital.html) | 1,002자 | 1,584자 |
| [전자 스핀(Electron Spin)](concept-electron-spin.html) | 893자 | 1,525자 |
| [파울리 배타 원리(Pauli Exclusion Principle)](concept-pauli.html) | 1,092자 | 1,749자 |
| [슬레이터 행렬식(Slater Determinant)](concept-slater-determinant.html) | 1,130자 | 1,796자 |
| [전자 배치(Electronic Configuration)](concept-electronic-configuration.html) | 1,024자 | 1,735자 |
| [분자 오비탈(Molecular Orbital)](concept-molecular-orbital.html) | 1,253자 | 2,145자 |
| [기저 집합(Basis Set)](concept-basis-set.html) | 1,104자 | 2,029자 |
| [STO-3G와 기저 집합의 선택](concept-sto-3g.html) | 1,458자 | 3,092자 |
| [기저 집합과 오비탈 에너지(Orbital Energy)](concept-basis-orbital-energies.html) | 837자 | 1,543자 |
| [전자 적분(Electron Integrals)](concept-electron-integrals.html) | 1,217자 | 2,170자 |
| [해밀토니안 행렬원소(Hamiltonian Matrix Elements)](concept-hamiltonian-elements.html) | 1,183자 | 2,630자 |
| [변분 원리(Variational Principle)](concept-variational-principle.html) | 1,185자 | 2,047자 |
| [하트리–폭(Hartree–Fock)와 SCF](concept-hartree-fock.html) | 1,319자 | 3,001자 |
| [전자 상관(Electron Correlation)](concept-electron-correlation.html) | 1,207자 | 1,799자 |
| [구성 상호작용(Configuration Interaction)](concept-configuration-interaction.html) | 1,205자 | 1,978자 |
| [활성 공간(Active Space)](concept-active-space.html) | 1,034자 | 1,893자 |
| [퍼텐셜 에너지 곡선(Potential Energy Curve)](concept-potential-energy.html) | 1,012자 | 1,764자 |
| [두 상태 계(Two-Level System)](concept-two-level-system.html) | 648자 | 993자 |
| [큐빗(Qubit)](concept-qubit.html) | 544자 | 956자 |
| [계산 기저(Computational Basis)와 상태 벡터](concept-computational-basis.html) | 568자 | 986자 |
| [양자 게이트(Quantum Gate)](concept-quantum-gate.html) | 964자 | 1,358자 |
| [회전 게이트(Rotation Gate)와 블로흐 구](concept-rotation-gate.html) | 1,279자 | 1,895자 |
| [측정 기저(Measurement Basis)](concept-measurement-basis.html) | 1,055자 | 1,814자 |
| [계산 기저 측정과 에너지 측정(Energy Measurement)](concept-energy-measurement.html) | 1,204자 | 3,464자 |
| [텐서곱(Tensor Product)과 여러 큐빗](concept-tensor-product.html) | 908자 | 1,379자 |
| [얽힘(Entanglement)](concept-entanglement.html) | 971자 | 1,680자 |
| [전자 상태를 큐빗으로 옮기기(Fermion-to-Qubit Mapping)](concept-fermion-qubit.html) | 1,896자 | 2,379자 |
| [평균 에너지와 기댓값(Expectation Value)](concept-energy-expectation.html) | 1,612자 | 2,368자 |
| [안사츠(Ansatz)](concept-ansatz.html) | 985자 | 1,374자 |
| [매개변수화 양자회로(Parameterized Quantum Circuit)](concept-parameterized-circuit.html) | 905자 | 1,493자 |
| [파울리 분해(Pauli Decomposition)](concept-pauli-decomposition.html) | 1,137자 | 1,942자 |
| [반복 측정(Shots)과 표본 오차(Sampling Error)](concept-measurement-shots.html) | 897자 | 1,456자 |
| [고전 최적화(Classical Optimization)](concept-classical-optimization.html) | 812자 | 1,655자 |
| [VQE 전체 알고리즘](concept-vqe-algorithm.html) | 1,028자 | 1,872자 |
| [VQE로 수소 분자 계산하기](concept-vqe-hydrogen.html) | 1,372자 | 2,384자 |
| [점유수 표현(Occupation-number Representation)과 비트열](concept-occupation-bitstrings.html) | 1,301자 | 1,505자 |
| [하트리–폭 기준 상태(Hartree–Fock Reference State) 준비](concept-hf-preparation.html) | 1,225자 | 1,408자 |
| [전자 들뜸(Excitation)과 중첩 상태 준비](concept-excitation-state.html) | 1,212자 | 1,709자 |
| [상태 준비 회로(State Preparation Circuit) 읽기](concept-sqd-state-circuit.html) | 1,480자 | 2,083자 |
| [측정 표본(Sample)과 전자 배치](concept-sqd-sampling.html) | 1,060자 | 1,300자 |
| [표본에서 부분공간 대각화(Subspace Diagonalization)로](concept-sqd-subspace.html) | 1,462자 | 1,837자 |
| [기저와 분자로 비교하는 해밀토니안(Hamiltonian)](concept-h2-hamiltonian.html) | 1,510자 | 3,332자 |
| [H₂의 두 배치와 에너지](concept-h2-state-energy.html) | 1,861자 | 2,729자 |
| [큰 분자의 해밀토니안: 적분에서 VQE·SQD까지](concept-large-hamiltonian.html) | 1,472자 | 2,639자 |
| [적분 수와 상태 공간의 크기](concept-hamiltonian-size.html) | 779자 | 1,099자 |
