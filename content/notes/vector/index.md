---
title: "벡터"
summary: "여러 성분을 하나의 대상으로 다루고, 평면 벡터의 방향과 길이를 연결합니다."
params:
  topics: ["linear-algebra"]
  search_terms: ["vector", "벡터"]
  prerequisites: []
  related:
    - id: "basis"
      reason: "같은 벡터를 다른 숫자로 적을 수 있을까?"
    - id: "inner-product"
      reason: "두 벡터가 얼마나 같은 방향을 향할까?"
    - id: "matrix"
      reason: "벡터를 일관된 규칙으로 바꾸려면?"
  legacy_source: "concept-vector.html"
---

## 여러 성분(Component)을 하나의 대상으로 다루려면?

오른쪽으로 3, 위로 4 이동한다는 정보를 하나로 묶으면 평면 벡터 \(v=(3,4)^T\)가 됩니다. 두 이동을 이어 붙일 때는 벡터를 더하고, 같은 이동을 두 배 할 때는 벡터에 수를 곱합니다.

여기서는 화살표로 시작하지만 벡터의 핵심은 모양이 아니라 **덧셈과 수 배를 할 수 있다는 구조**입니다. 함수와 다항식도 같은 구조를 가지면 벡터로 다룰 수 있습니다.

{{< experiment id="vector-direction" >}}

## 성분을 이용해 계산하기

\(v=(3,4)^T\), \(w=(1,-1)^T\)라면 같은 위치의 성분끼리 계산합니다.

$$
2v=\begin{pmatrix}6\\8\end{pmatrix},\qquad
v+w=\begin{pmatrix}4\\3\end{pmatrix}.
$$

세로로 적은 \(n\times1\) 형태를 열벡터라 합니다. \(T\)는 행과 열을 바꾸는 전치이므로 \((3,4)^T\)도 같은 열벡터를 뜻합니다. [행렬](../matrix/)을 곱할 때는 행·열의 구분이 필요합니다.

## 길이를 고정하고 방향을 바꾸기

표준 좌표에서 방향각이 \(\theta\)인 단위 벡터는 다음과 같습니다.

$$
v(\theta)=\begin{pmatrix}\cos\theta\\\sin\theta\end{pmatrix},\qquad
\|v\|=\sqrt{\cos^2\theta+\sin^2\theta}=1.
$$

0°에서는 \((1,0)\), 90°에서는 \((0,1)\)입니다. 성분이 달라져도 길이는 같을 수 있습니다. 길이를 정의하는 규칙은 [내적](../inner-product/)에서 자세히 다룹니다.

## 숫자를 해석할 때 필요한 조건

벡터의 좌표는 선택한 [기저](../basis/)에 의존합니다. 성분의 순서와 기저를 모르면 숫자만으로 방향이나 물리적 의미를 알 수 없습니다. 일반 벡터의 성분 제곱을 확률로 읽지는 않습니다. 양자 상태에서는 정규화와 정규직교 측정 기저라는 조건을 만족할 때 확률 해석을 합니다.

## 스스로 확인하기

**벡터의 성분 제곱을 항상 확률로 읽어도 될까요?**

아니요. 일반 벡터의 성분은 좌표입니다. 정규화된 양자 상태를 정규직교 측정 기저로 표현했을 때에만 절댓값 제곱을 그 측정의 확률로 읽습니다.

## 더 읽기

[MIT OpenCourseWare · Linear Algebra](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

