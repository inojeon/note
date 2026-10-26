---
title: "부분공간과 투영"
summary: "허용하는 방향을 줄여 벡터와 행렬 문제를 근사하고, 투영 오차를 해석합니다."
params:
  topics: ["linear-algebra"]
  search_terms: ["subspace", "부분공간과 투영"]
  prerequisites:
    - id: "basis"
      reason: "기저와 좌표의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
    - id: "inner-product"
      reason: "내적과 길이의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "krylov"
      reason: "반복 계산의 중간 결과도 활용할 수 있을까?"
    - id: "matrix"
      reason: "벡터를 일관된 규칙으로 바꾸려면?"
    - id: "hamiltonian"
      reason: "행렬에서 에너지와 양자 상태를 어떻게 읽을까?"
  legacy_source: "concept-subspace.html"
---

## 큰 공간의 일부만으로 근사하려면?

큰 벡터 공간에서 중요한 몇 방향만 골라 계산할 수 있습니다. 원점을 포함하며 덧셈과 수 배에 닫힌 방향들의 집합을 부분공간이라고 합니다.

벡터를 부분공간으로 직교투영하면 그 안에서 가장 가까운 벡터를 얻습니다. 원래 벡터가 이미 부분공간 안에 있으면 변하지 않습니다.

{{< experiment id="subspace" >}}

## 직교투영의 식

부분공간의 정규직교 기저를 열로 모은 행렬이 \(Q\)이면:

$$
y=Q^\dagger x,\qquad \hat x=Qy=QQ^\dagger x,\qquad
Q^\dagger(x-\hat x)=0.
$$

\(y\)는 줄어든 좌표이고 \(\hat x\)는 원래 공간으로 되돌린 근사 벡터입니다. 예를 들어 평면의 \((3,4)^T\)를 x축에 투영하면 \((3,0)^T\)이고 남은 오차는 \((0,4)^T\)입니다.

정규직교가 아닌 독립 열 \(B\)를 사용한다면 투영은 \(B(B^\dagger B)^{-1}B^\dagger\)입니다. \(BB^\dagger\)라고 쓰면 일반적으로 올바르지 않습니다.

## 행렬 문제를 줄이기

$$
H_S=Q^\dagger HQ,\qquad H_Sy=Ey,\qquad \psi\approx Qy.
$$

작은 행렬의 고유값을 정확히 풀어도 큰 공간의 고유상태를 정확히 찾았다는 보장은 없습니다. 작은 공간 안에서의 잔차는 0이어도 원래 공간의 잔차 \(HQy-EQy\)는 남을 수 있습니다.

에르미트 행렬에서 작은 공간의 최저 에너지는 전체 최저 에너지보다 낮지 않습니다. 더 좋은 방향을 추가하는 것이 [변분 원리](../variational-principle/)와 [SQD 부분공간](../sqd-subspace/)의 핵심입니다.

## 스스로 확인하기

**이미 부분공간 안에 있는 벡터를 투영하면 어떻게 될까요?**

같은 벡터가 남습니다. 직교투영은 부분공간 밖으로 향하는 성분만 제거합니다.

## 더 읽기

[MIT OpenCourseWare · Linear Algebra](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

