---
title: "중첩과 상대 위상"
summary: "같은 측정 확률을 가진 상태라도 상대 위상 때문에 다른 기저에서 구별될 수 있음을 봅니다."
params:
  topics: ["quantum-chemistry"]
  search_terms: ["superposition", "중첩과 상대 위상"]
  prerequisites:
    - id: "quantum-state"
      reason: "양자 상태와 표현의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
    - id: "born-rule"
      reason: "보른 규칙의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "observable"
      reason: "평균 에너지가 2라면, 한 번 측정해도 2가 나올까?"
    - id: "basis"
      reason: "같은 벡터를 다른 숫자로 적을 수 있을까?"
    - id: "schrodinger"
      reason: "고유값과 고유벡터를 구하면, 왜 원자의 에너지와 상태를 알 수 있을까?"
  legacy_source: "concept-superposition.html"
---

## 확률은 같은데, 다른 측정에서 결과가 달라질 수 있을까?

0과 1이 각각 절반의 확률로 나온다는 사실만으로 양자 상태가 모두 정해지지는 않습니다. 두 진폭 사이의 상대 위상이 남아 있기 때문입니다.

중첩은 선택한 [기저](../basis/)의 여러 상태를 진폭으로 더한 표현입니다. 확률을 섞은 고전적인 무작위 선택과는 간섭에서 차이가 납니다.

{{< experiment id="superposition" >}}

## 같은 0·1 확률, 다른 상태

$$
|\psi_\phi\rangle=\frac{|0\rangle+e^{i\phi}|1\rangle}{\sqrt2}.
$$

모든 \(\phi\)에서 0·1 확률은 각각 1/2입니다. 그러나 \(|+\rangle=(|0\rangle+|1\rangle)/\sqrt2\)로 측정하면:

$$
p(+)=|\langle+|\psi_\phi\rangle|^2
=\frac{1+\cos\phi}{2}.
$$

\(\phi=0\)이면 +가 반드시 나오고, \(\phi=\pi\)이면 +가 나오지 않습니다. 진폭을 먼저 더한 뒤 절댓값을 제곱하기 때문에 교차항이 생깁니다.

## 전체 위상과 상대 위상

상태 전체에 같은 위상을 곱하면 모든 측정 확률이 같습니다. 두 성분의 비율을 바꾸는 상대 위상은 다른 예측을 만들 수 있습니다. 한 기저의 확률 막대만으로 상태 전체를 표현할 수 없는 이유입니다.

## 중첩은 확률 혼합과 다르다

0과 1을 각각 절반의 확률로 준비한 혼합은 +·− 측정에서도 절반씩 나옵니다. 반면 \(|+\rangle\)은 + 측정에서 확정적입니다. 따라서 '측정하기 전부터 둘 중 하나인데 모르는 상태'라는 설명만으로는 중첩의 간섭을 설명할 수 없습니다.

분자의 [구성 상호작용](../configuration-interaction/)에서도 배치 확률뿐 아니라 상대 부호가 에너지에 들어갑니다.

## 스스로 확인하기

**계산 기저 확률이 같으면 같은 양자 상태일까요?**

아니요. 상대 위상이 다를 수 있습니다. 다른 기저의 측정에서 그 차이가 드러납니다.

## 더 읽기

[MIT OpenCourseWare · Quantum Physics I](https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

