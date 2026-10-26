---
title: "내적과 길이"
summary: "두 벡터의 겹침을 수로 나타내고 길이·직교·정규화를 정의합니다."
params:
  topics: ["linear-algebra"]
  search_terms: ["inner product", "내적과 길이", "inner-product"]
  prerequisites:
    - id: "vector"
      reason: "벡터의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "matrix"
      reason: "벡터를 일관된 규칙으로 바꾸려면?"
    - id: "symmetric"
      reason: "행과 열을 바꿔도 같은 행렬은 왜 특별할까?"
    - id: "subspace"
      reason: "큰 공간의 일부만으로 근사하려면?"
  legacy_source: "concept-inner-product.html"
---

## 두 벡터가 얼마나 같은 방향을 향할까?

두 화살표가 비슷한 방향인지 비교하려면 성분을 따로 보는 대신 하나의 수로 모을 수 있습니다. 표준 실수 내적은 같은 위치의 성분끼리 곱한 뒤 더합니다.

내적은 [벡터](../vector/)에 길이와 각도를 더해 주는 규칙입니다. 좌표의 단순한 곱셈은 표준 정규직교 기저를 사용했을 때의 표현입니다.

{{< experiment id="inner-product" >}}

## 계산과 기하학을 연결하기

$$
\langle u,v\rangle=u^Tv=\sum_i u_iv_i
=\|u\|\|v\|\cos\theta,\qquad
\|v\|=\sqrt{\langle v,v\rangle}.
$$

\(u=(1,0)^T\), \(v=(3,4)^T\)에서는 내적이 3이고 \(\|v\|=5\)입니다. 따라서 두 벡터 사이 각도의 코사인은 \(3/5\)입니다. 각도를 구하는 식은 두 벡터가 모두 0이 아닐 때 사용합니다. \(v\)와 \((-4,3)^T\)의 내적은 0이므로 서로 직교합니다.

0이 아닌 벡터를 자신의 길이로 나누면 단위 벡터를 얻습니다. 영벡터는 길이가 0이므로 이 방식으로 정규화할 수 없습니다.

## 복소수에서는 켤레를 사용하기

양자 상태의 성분은 복소수일 수 있습니다. 이 노트에서는 첫 번째 입력에 복소켤레를 취하는 관례를 사용합니다.

$$
\langle u,v\rangle=u^\dagger v=\sum_i u_i^*v_i.
$$

\(v=(1,i)^T\)라면 \(v^\dagger v=1+(-i)i=2\)입니다. 켤레 없이 제곱하면 0이 되지만 그것은 길이의 제곱이 아닙니다. \(\dagger\)는 전치와 복소켤레를 함께 하는 연산입니다.

## 좌표만으로 길이를 계산할 수 없는 경우

비직교 기저 함수의 겹침을 \(S_{ij}=\langle b_i,b_j\rangle\)라 하면, 계수 \(c\)로 표현한 벡터의 길이 제곱은 \(c^\dagger Sc\)입니다. \(c^\dagger c\)가 되는 것은 \(S=I\)일 때입니다. 이 구별은 [오비탈 기저](../basis-set/)와 양자 상태 정규화에서 중요합니다.

## 스스로 확인하기

**복소수 벡터에서도 성분을 그대로 곱하면 될까요?**

복소 표준 내적에서는 첫 벡터의 성분을 복소켤레로 바꾼 뒤 곱해 더합니다. 자기 내적은 실수이며 음수가 아닙니다.

## 더 읽기

[MIT OpenCourseWare · Linear Algebra](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

