---
title: "기저를 바꾸어 보는 대각화"
summary: "같은 선형변환을 회전한 좌표로 나타내며 행렬 원소와 실제 변환을 구분합니다."
params:
  topics: ["linear-algebra"]
  search_terms: ["diagonalization coordinates", "기저를 바꾸어 보는 대각화", "diagonalization-coordinates"]
  prerequisites:
    - id: "diagonalization"
      reason: "대각화의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "diagonalization"
      reason: "기준을 바꾸면 행렬 계산이 단순해질까?"
    - id: "basis"
      reason: "같은 벡터를 다른 숫자로 적을 수 있을까?"
    - id: "hamiltonian"
      reason: "행렬에서 에너지와 양자 상태를 어떻게 읽을까?"
  legacy_source: "concept-diagonalization-coordinates.html"
---

## 같은 행렬을 다른 기저로 보면 무엇이 달라질까?

좌표축을 돌리면 같은 화살표의 숫자가 달라집니다. 변환을 나타내는 행렬의 숫자도 함께 달라집니다. 이때 벡터와 변환을 모두 일관되게 표현해야 합니다.

이 실험에서는 실제 변환 \(A\)는 고정하고 관찰하는 [기저](../basis/)를 돌립니다. 고유기저와 일치할 때 비대각 원소가 사라지는지 확인합니다.

{{< experiment id="diagonalization-coordinates" >}}

## 입력과 출력 좌표를 함께 바꾸기

새 기저를 열로 모은 직교행렬이 \(Q\)라면, \(v=Qc\)입니다. 원래 공간의 출력 \(Av\)를 다시 새 좌표로 읽으면:

$$
[Av]_Q=Q^TAv=Q^TAQc,\qquad B=Q^TAQ.
$$

\(B\)가 새 기저에서 본 같은 변환입니다. 입력만 회전시키는 \(AQ\)와 양쪽 좌표를 함께 바꾸는 \(Q^TAQ\)는 목적이 다릅니다.

## 비대각 원소가 의미하는 것

\(B_{12}\)는 새 둘째 기저 방향으로 넣었을 때 새 첫째 방향으로 나오는 양입니다. 고유기저에서는 각 방향이 다른 방향과 섞이지 않아 \(B_{12}=B_{21}=0\)이 됩니다.

\(A=\begin{pmatrix}2&1\\1&2\end{pmatrix}\)에 45° 회전 기저를 사용하면 대각 원소는 3과 1이 됩니다. 기저의 순서를 바꾸면 대각 원소 순서도 바뀌지만 두 고유값은 같습니다.

## 바뀌는 것과 유지되는 것

행렬 원소와 좌표는 달라져도 고유값, 대각합, 행렬식은 유사변환에서 유지됩니다. 원래 공간에서 입력과 출력이 무엇인지도 같습니다. 정규직교가 아닌 기저 \(B\)에서는 전치 대신 역행렬을 써서 \(B^{-1}AB\)로 변환해야 합니다. 전치를 역행렬처럼 쓰는 것은 직교행렬일 때만 가능합니다.

## 스스로 확인하기

**좌표축을 돌리면 변환 A가 다른 물리적 작용이 될까요?**

이 실험은 같은 변환을 다른 기저로 표현합니다. B = QᵀAQ의 숫자가 달라도 원래 공간에서의 입력과 출력은 같습니다.

## 더 읽기

[MIT OpenCourseWare · Linear Algebra](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

