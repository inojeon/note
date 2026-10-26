---
title: "고유값과 고유벡터"
summary: "변환 후에도 같은 직선 위에 남는 방향과 그 방향의 배율을 찾습니다."
params:
  topics: ["linear-algebra"]
  search_terms: ["eigen", "고유값과 고유벡터"]
  prerequisites:
    - id: "matrix"
      reason: "행렬과 선형변환의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "diagonalization"
      reason: "기준을 바꾸면 행렬 계산이 단순해질까?"
    - id: "power"
      reason: "행렬을 계속 곱하면 어떤 성분(Component)이 남을까?"
    - id: "symmetric"
      reason: "행과 열을 바꿔도 같은 행렬은 왜 특별할까?"
  legacy_source: "concept-eigen.html"
---

## 변환해도 같은 직선 위에 남는 벡터가 있을까?

대부분의 벡터는 행렬을 곱하면 방향과 길이가 함께 바뀝니다. 그런데 어떤 방향은 길이만 변하고 같은 직선 위에 남습니다. 그런 0이 아닌 벡터를 고유벡터라고 합니다.

[행렬](../matrix/)의 고유벡터를 찾으면 복잡한 변환을 서로 독립적인 배율의 조합으로 이해할 수 있습니다.

{{< experiment id="eigen" >}}

## 정의와 작은 예

$$
Av=\lambda v,\qquad v\ne0.
$$

\(\lambda\)는 고유값입니다. 음수이면 방향이 반대로 뒤집히고, 0이면 해당 고유벡터가 영벡터로 보내집니다. 영벡터 자체는 모든 배율에 식을 만족하므로 고유벡터에서 제외합니다.

$$
A=\begin{pmatrix}2&1\\1&2\end{pmatrix},\qquad
A\begin{pmatrix}1\\1\end{pmatrix}=3\begin{pmatrix}1\\1\end{pmatrix},\qquad
A\begin{pmatrix}1\\-1\end{pmatrix}=\begin{pmatrix}1\\-1\end{pmatrix}.
$$

같은 고유벡터를 2배 해도 같은 고유값을 가지므로 고유벡터의 크기는 유일하지 않습니다. 비교할 때 보통 길이를 1로 맞춥니다.

## 고유값은 어떻게 구할까

\((A-\lambda I)v=0\)에 0이 아닌 해가 있으려면 \(A-\lambda I\)가 가역이면 안 됩니다. 작은 행렬에서는 \(\det(A-\lambda I)=0\)을 풀 수 있습니다. 큰 행렬에서는 다항식을 직접 푸는 것보다 수치 고유값 알고리즘을 사용합니다.

모든 실수 행렬이 실수 고유벡터만으로 기저를 만들 수 있는 것은 아닙니다. 평면의 90° 회전은 실수 평면에서 고정되는 직선이 없습니다. [대칭 행렬](../symmetric/)은 정규직교 고유기저를 가질 수 있다는 특별한 보장이 있습니다.

[해밀토니안](../hamiltonian/)의 고유값은 허용되는 에너지이고 고유벡터는 그 에너지의 상태입니다.

## 스스로 확인하기

**영벡터도 고유벡터일까요?**

아니요. 고유벡터는 0이 아닌 벡터로 정의합니다. 고유값 0에 대응하는 고유벡터는 있을 수 있습니다.

## 더 읽기

[MIT OpenCourseWare · Linear Algebra](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

