---
title: "보른 규칙"
summary: "복소 진폭의 절댓값 제곱으로 측정 확률을 구하고 확률과 진폭을 구별합니다."
params:
  topics: ["quantum-chemistry"]
  search_terms: ["born rule", "보른 규칙", "born-rule"]
  prerequisites:
    - id: "quantum-state"
      reason: "양자 상태와 표현의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
    - id: "inner-product"
      reason: "내적과 길이의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "superposition"
      reason: "확률은 같은데, 다른 측정에서 결과가 달라질 수 있을까?"
    - id: "observable"
      reason: "평균 에너지가 2라면, 한 번 측정해도 2가 나올까?"
    - id: "hamiltonian"
      reason: "행렬에서 에너지와 양자 상태를 어떻게 읽을까?"
  legacy_source: "concept-born-rule.html"
---

## 음수나 복소수인 진폭이 어떻게 확률이 될까?

진폭은 음수나 복소수일 수 있지만 확률은 0과 1 사이의 실수여야 합니다. 보른 규칙은 이 둘을 연결합니다.

정규화된 [양자 상태](../quantum-state/)를 정규직교 측정 기저로 표현했을 때, 결과의 확률은 해당 성분의 절댓값 제곱입니다.

{{< experiment id="born-rule" >}}

## 진폭에서 확률로

$$
p(j)=|\langle j|\psi\rangle|^2=|c_j|^2,
\qquad \sum_jp(j)=1.
$$

\(c_0=\sqrt{3}/2\), \(c_1=i/2\)라면 0의 확률은 3/4, 1의 확률은 1/4입니다. \(c_1\)을 \(-i/2\)로 바꿔도 이 기저의 확률은 같습니다. 하지만 다른 기저에서의 간섭은 달라질 수 있습니다.

복소수 \(a+ib\)의 절댓값 제곱은 \((a-ib)(a+ib)=a^2+b^2\)입니다. 복소수를 그대로 제곱하는 연산과 다릅니다.

## 측정 결과가 여러 상태를 묶는 경우

하나의 결과에 여러 고유상태가 대응하는 축퇴 측정에서는 그 부분공간으로의 투영 연산자 \(P_a\)를 사용합니다.

$$
p(a)=\langle\psi|P_a|\psi\rangle.
$$

측정 결과의 확률은 어떤 측정을 하느냐에 달려 있습니다. 계산 기저에서 얻은 배치 확률을 에너지 고유값의 확률로 곧바로 읽을 수는 없습니다.

## 한 번의 결과와 많은 번의 빈도

확률이 1/2이라고 두 번 측정할 때 정확히 한 번씩 나오는 것은 아닙니다. 동일한 상태를 새로 준비해 반복하면 장기적인 빈도가 확률에 가까워집니다. 표본 수가 유한하면 흔들림이 있으며 [측정 샷](../measurement-shots/)에서 이를 다룹니다.

## 스스로 확인하기

**진폭이 음수이면 확률도 음수일까요?**

아니요. 확률은 진폭의 절댓값 제곱입니다. 부호나 상대 위상은 다른 기저에서의 측정에 영향을 줄 수 있습니다.

## 더 읽기

[MIT OpenCourseWare · Quantum Physics I](https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

