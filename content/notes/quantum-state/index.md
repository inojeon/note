---
title: "양자 상태와 표현"
summary: "양자 상태를 정규화한 복소 벡터로 표현하고, 상태 변화와 기저 변경을 구별합니다."
params:
  topics: ["quantum-chemistry"]
  search_terms: ["quantum state", "양자 상태와 표현", "quantum-state"]
  prerequisites:
    - id: "vector"
      reason: "벡터의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
    - id: "basis"
      reason: "기저와 좌표의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "born-rule"
      reason: "음수나 복소수인 진폭이 어떻게 확률이 될까?"
    - id: "orbital"
      reason: "오비탈은 전자가 도는 길일까?"
    - id: "computational-basis"
      reason: "왜 0 상태는 영벡터가 아니라 첫째 좌표가 1인 벡터일까?"
  legacy_source: "concept-quantum-state.html"
---

## 좌표가 달라져도 같은 양자 상태일 수 있을까?

양자 상태는 가능한 측정 결과의 확률을 계산하는 데 필요한 정보를 담습니다. 순수 상태는 복소 벡터 \(|\psi\rangle\)로 나타내며, 그 성분은 선택한 [기저](../basis/)에 대한 진폭입니다.

같은 상태를 다른 기저로 적으면 숫자가 달라집니다. 이것은 장치를 작동해 상태 자체를 바꾸는 것과 구별해야 합니다.

{{< experiment id="quantum-state" >}}

## 상태 벡터의 조건

정규직교 기저 \(\{|j\rangle\}\)에서는:

$$
|\psi\rangle=\sum_j c_j|j\rangle,\qquad
\langle\psi|\psi\rangle=\sum_j|c_j|^2=1.
$$

복소 진폭 \(c_j\)에는 크기와 위상이 있습니다. \(|c_j|^2\)는 그 기저로 측정할 확률이며 [보른 규칙](../born-rule/)으로 정해집니다. 상태를 세로 열로, 그 켤레전치를 \(\langle\psi|\)로 쓰는 것이 브라·켓 표기입니다.

## 같은 상태, 다른 좌표

\(|+\rangle=(|0\rangle+|1\rangle)/\sqrt2\)는 0·1 기저에서는 두 성분이 있지만 +·− 기저에서는 \((1,0)^T\)입니다. 중첩인지 아닌지는 표현하는 기저와 관계가 있습니다. 기저 변경에서는 상태와 측정 연산자를 함께 변환하면 모든 예측이 같습니다.

전체에 같은 위상을 곱한 \(e^{i\phi}|\psi\rangle\)는 같은 물리적 순수 상태입니다. 반면 일부 성분의 상대 위상을 바꾸면 다른 측정 결과를 만들 수 있습니다. [중첩](../superposition/)에서 이를 확인합니다.

## 여기서 다루지 않는 상태

현실의 잡음이나 상태에 대한 불확실성은 하나의 순수 상태 벡터만으로 충분하지 않을 수 있습니다. 그때는 밀도행렬을 사용합니다. 이 노트의 실험은 순수 상태를 다루며, 양자 상태를 전자의 실제 이동 궤적으로 그리는 모형이 아닙니다.

## 스스로 확인하기

**같은 상태의 좌표가 달라지는 이유는 무엇일까요?**

좌표는 기저에 대한 표현이기 때문입니다. 상태를 바꾸는 게이트와 같은 상태의 표현만 바꾸는 기저 변경을 구별해야 합니다.

## 더 읽기

[MIT OpenCourseWare · Quantum Physics I](https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

