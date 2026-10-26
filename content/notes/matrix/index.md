---
title: "행렬과 선형변환"
summary: "행렬의 열을 기저 벡터의 변환 결과로 읽고, 행렬 곱의 의미를 이해합니다."
params:
  topics: ["linear-algebra"]
  search_terms: ["matrix", "행렬과 선형변환"]
  prerequisites:
    - id: "vector"
      reason: "벡터의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
    - id: "basis"
      reason: "기저와 좌표의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "symmetric"
      reason: "행과 열을 바꿔도 같은 행렬은 왜 특별할까?"
    - id: "eigen"
      reason: "변환해도 같은 직선 위에 남는 벡터가 있을까?"
    - id: "subspace"
      reason: "큰 공간의 일부만으로 근사하려면?"
  legacy_source: "concept-matrix.html"
---

## 벡터를 일관된 규칙으로 바꾸려면?

벡터의 가로 성분을 두 배 하고 세로 성분을 그대로 두는 규칙을 생각해 봅시다. 입력의 덧셈과 수 배를 보존하는 이런 변환을 선형변환이라 합니다.

입력과 출력의 [기저](../basis/)를 정하면 선형변환을 행렬로 적을 수 있습니다. 행렬의 **각 열은 입력 기저 벡터 하나를 변환한 결과**입니다.

{{< experiment id="matrix" >}}

## 열을 조합하면 출력이 되는 이유

$$
A=\begin{pmatrix}2&1\\0&1\end{pmatrix},\qquad
A\begin{pmatrix}x\\y\end{pmatrix}
=x\begin{pmatrix}2\\0\end{pmatrix}+y\begin{pmatrix}1\\1\end{pmatrix}.
$$

첫 열은 \(e_1\)을, 둘째 열은 \(e_2\)를 보낸 결과입니다. 입력이 \((3,4)^T\)라면 출력은 \((10,4)^T\)입니다. 모든 벡터에서 같은 규칙을 쓰므로 \(A(u+v)=Au+Av\), \(A(cv)=cAv\)가 성립합니다.

## 곱셈 순서는 실행 순서와 연결된다

\(ABv\)에서는 \(B\)를 먼저 적용하고 \(A\)를 나중에 적용합니다. 가로로 늘린 뒤 회전하는 것과 회전한 뒤 가로로 늘리는 것은 대체로 다르므로 \(AB\)와 \(BA\)도 보통 다릅니다.

\(m\times n\) 행렬은 \(n\)개 성분의 열벡터를 받아 \(m\)개 성분으로 보냅니다. 정사각 행렬만 변환을 나타내는 것은 아닙니다.

## 변환을 되돌릴 수 있는지 확인하기

정사각 행렬에서 서로 다른 입력이 같은 출력으로 겹치면 정보가 사라져 역변환이 없습니다. 예를 들어 \(\operatorname{diag}(1,0)\)은 세로 성분을 지우는 투영입니다. [고유벡터](../eigen/)는 이런 변환 속에서도 방향이 유지되는 입력을 찾는 방법입니다.

## 스스로 확인하기

**행렬의 첫째 열은 무엇을 뜻할까요?**

입력의 첫째 기저 벡터를 변환한 결과를 출력 기저의 좌표로 적은 것입니다.

## 더 읽기

[MIT OpenCourseWare · Linear Algebra](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

