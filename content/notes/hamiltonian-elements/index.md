---
title: "해밀토니안 행렬원소"
summary: "전자 적분을 다전자 배치 사이의 에너지와 결합으로 조립합니다."
params:
  topics: ["quantum-chemistry"]
  search_terms: ["hamiltonian elements", "해밀토니안 행렬원소", "hamiltonian-elements"]
  prerequisites:
    - id: "electron-integrals"
      reason: "전자 적분의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "h2-hamiltonian"
      reason: "같은 분자에서 기저를 늘리면?다른 분자인데 행렬 크기가 같다면?"
    - id: "electron-integrals"
      reason: "오비탈로부터 에너지 계산에 필요한 숫자를 어떻게 만들까?"
    - id: "large-hamiltonian"
      reason: "거대한 행렬을 전부 만들지 않고도에너지 문제를 정의할 수 있을까요?"
  legacy_source: "concept-hamiltonian-elements.html"
---

## 오비탈 적분은 어떻게 전자 배치 사이의 행렬이 될까?

전자 적분은 오비탈 사이의 숫자입니다. 우리가 최종적으로 풀 행렬은 여러 전자가 함께 점유한 배치 사이의 숫자입니다. 이 두 단계는 연결되지만 행과 열의 의미가 다릅니다.

정규직교 [슬레이터 행렬식](../slater-determinant/)을 기저로 고르면 \(H_{IJ}=\langle\Phi_I|H|\Phi_J\rangle\)를 계산해 다전자 행렬을 만듭니다.

{{< experiment id="hamiltonian-elements" >}}

## 대각과 비대각 원소

대각 원소 \(H_{II}\)는 배치 I만 준비했을 때의 에너지 기댓값입니다. 점유한 오비탈들의 1전자 항, 전자 사이 쿨롱·교환 항이 함께 들어갑니다. 비대각 원소는 서로 다른 배치들의 혼합이 에너지에 주는 기여를 정합니다.

정규직교 스핀 오비탈과 1·2전자 연산자만 있는 해밀토니안에서는 슬레이터–콘던 규칙에 따라 두 번을 초과하는 오비탈 치환으로 다른 행렬식 사이의 직접 행렬원소는 0입니다. 한 번 또는 두 번 치환인 경우도 대칭이나 적분값 때문에 0일 수 있습니다.

## 작은 예로 구별하기

$$
H=\begin{pmatrix}E_A&V\\V&E_B\end{pmatrix},\qquad
E(c)=|c_A|^2E_A+|c_B|^2E_B+2\operatorname{Re}(c_A^*c_BV).
$$

V는 배치 A가 B로 바뀔 확률이 아닙니다. 두 배치 진폭을 결합할 때 에너지 식에 들어가는 행렬원소입니다. 측정 빈도만으로 V를 정하지도 않습니다.

## 0이라는 값의 의미

\(H_{IJ}=0\)이면 해당 두 배치의 직접 결합이 없다는 뜻입니다. 다른 배치를 거치는 간접 효과까지 모두 없다는 뜻은 아닙니다. 또한 표시 자리수에서 0.0000으로 보인 값은 정확한 대칭 영과 다를 수 있습니다.

[H₂와 HeH⁺ 행렬](../h2-hamiltonian/)에서는 대칭에 따른 블록 분리와 단순한 행렬 대칭을 비교합니다.

## 적분에서 행렬원소로 가는 규칙

정규직교 스핀 오비탈의 물리학자 순서 적분을 \(v_{pqrs}=\langle pq|r_{12}^{-1}|rs\rangle\)로 정의하고, 반대칭화 적분을 \(\langle pq\Vert rs\rangle=v_{pqrs}-v_{pqsr}\)로 씁니다. 이 정의에서는 2전자 연산자가 다음과 같습니다.

$$
H_2=\frac14\sum_{pqrs}\langle pq\Vert rs\rangle
 a_p^\dagger a_q^\dagger a_s a_r.
$$

대각 원소는 점유 오비탈에 대한 \(\sum_i h_{ii}+\tfrac12\sum_{ij}\langle ij\Vert ij\rangle\)입니다. 단일 치환 \(i\to a\)에는 \(h_{ai}+\sum_{j\in C}\langle aj\Vert ij\rangle\), 이중 치환 \(i,j\to a,b\)에는 \(\langle ab\Vert ij\rangle\)가 기여합니다. C는 공통 점유 집합이며 비대각 원소에는 행렬식의 오비탈 순서에 따른 부호를 함께 곱합니다.

실험은 정규직교 스핀 오비탈 여섯 개에 같은 스핀 전자 세 개를 놓은 설명용 1·2체 모형입니다. 실제 쿨롱 적분을 재현한 분자 계산은 아닙니다. 세 번 이상 치환의 직접 결합이 0이라는 규칙은 동일한 정규직교 오비탈 집합과 최대 2체 연산자라는 조건에서 성립합니다. 서로 다른 비직교 오비탈이나 명시적인 3체 항에는 그대로 적용할 수 없습니다. 실험은 핵 반발 상수를 생략합니다.

## 스스로 확인하기

**직접 행렬원소가 0이면 두 배치가 전혀 섞일 수 없을까요?**

직접 연결이 없다는 뜻입니다. 다른 배치를 거치는 간접 혼합은 가능할 수 있습니다.

## 더 읽기

[PySCF · CI와 FCI](https://pyscf.org/user/ci.html)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

