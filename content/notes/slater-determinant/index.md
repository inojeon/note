---
title: "슬레이터 행렬식"
summary: "전자 교환에 따른 반대칭성을 행렬식으로 만들고 다전자 기저 상태를 구성합니다."
params:
  topics: ["quantum-chemistry"]
  search_terms: ["slater determinant", "슬레이터 행렬식", "slater-determinant"]
  prerequisites:
    - id: "electronic-configuration"
      reason: "전자 배치의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
    - id: "pauli"
      reason: "파울리 배타 원리의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "basis-set"
      reason: "기저 함수가 부족하면 어떤 오차가 남을까?"
    - id: "matrix"
      reason: "벡터를 일관된 규칙으로 바꾸려면?"
    - id: "hartree-fock"
      reason: "전자 밀도가 방정식을 바꾸는데, 어떻게 해를 찾을까?"
  legacy_source: "concept-slater-determinant.html"
---

## 전자 둘의 이름을 바꾸면 왜 부호가 바뀔까?

동일한 전자는 서로 이름표로 구별할 수 없습니다. 두 전자의 전체 좌표를 교환하면 파동함수는 부호를 바꾸어야 합니다. 확률은 절댓값 제곱이므로 이 교환에 대해 같습니다.

슬레이터 행렬식은 한 전자 [스핀 오비탈](../pauli/)들을 이용해 이 반대칭성을 자동으로 만족하는 다전자 함수를 만드는 방법입니다.

{{< experiment id="slater-determinant" >}}

## 두 전자에서 시작하기

정규직교 스핀 오비탈 \(\chi_a,\chi_b\)를 사용하면:

$$
\Phi(x_1,x_2)=\frac1{\sqrt2}
\begin{vmatrix}
\chi_a(x_1)&\chi_b(x_1)\\
\chi_a(x_2)&\chi_b(x_2)
\end{vmatrix}.
$$

두 전자의 좌표를 맞바꾸면 두 행이 바뀌어 행렬식의 부호가 뒤집힙니다. 같은 스핀 오비탈을 두 번 넣으면 같은 열이 생겨 행렬식은 0이 됩니다. 이것이 [파울리 원리](../pauli/)와 연결되는 부분입니다.

## N전자와 정규화

$$
\Phi(x_1,\ldots,x_N)=\frac1{\sqrt{N!}}\det[\chi_j(x_i)].
$$

앞의 정규화 계수는 사용한 오비탈들이 정규직교라는 조건에서 성립합니다. 비직교 함수라면 겹침 행렬에 따라 정규화가 달라집니다. 오비탈 열의 순서를 바꾸어도 전체 부호가 바뀌므로 계산 전체에서 순서 관례를 유지해야 합니다.

## 한 행렬식으로 충분할까

행렬식 하나는 전자 반대칭성을 포함하지만 모든 전자 상관을 표현하지는 못합니다. [하트리–폭](../hartree-fock/)은 단일 행렬식의 오비탈을 최적화하고, [CI](../configuration-interaction/)는 여러 행렬식의 계수를 함께 조절합니다. 오비탈 하나의 함수와 N전자 행렬식의 함수가 서로 다른 공간의 대상이라는 점을 기억하세요.

## 스스로 확인하기

**두 전자의 좌표를 교환하면 확률도 달라질까요?**

전체 파동함수의 부호는 바뀌지만 절댓값 제곱은 같으므로 같은 좌표 교환에 대한 확률은 같습니다.

## 더 읽기

[MIT OpenCourseWare · Quantum Physics I](https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

