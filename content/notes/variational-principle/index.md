---
title: "변분 원리"
summary: "정규화한 시험 상태의 에너지가 바닥 에너지의 상한이 되는 조건을 이해합니다."
params:
  topics: ["quantum-chemistry"]
  search_terms: ["variational principle", "변분 원리", "variational-principle"]
  prerequisites:
    - id: "hamiltonian-size"
      reason: "해밀토니안의 크기의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "hartree-fock"
      reason: "전자 밀도가 방정식을 바꾸는데, 어떻게 해를 찾을까?"
    - id: "parameterized-circuit"
      reason: "회전각 하나로 양자 상태를 어떻게 바꿀까?"
    - id: "energy-expectation"
      reason: "한 번의 측정값과 평균 에너지는 어떻게 다를까?"
  legacy_source: "concept-variational-principle.html"
---

## 어떤 상태의 에너지를 낮추면 정확한 바닥상태에 가까워질까?

정확한 바닥상태를 모르더라도 그보다 낮지 않은 에너지를 계산할 수 있습니다. 같은 해밀토니안에서 허용된 시험 상태를 넣어 평균 에너지를 구하는 방법입니다.

이 원리는 [하트리–폭](../hartree-fock/), CI, VQE와 부분공간 대각화의 공통 기반입니다. 무엇을 고정하고 어떤 상태를 허용했는지 밝혀야 비교가 의미 있습니다.

{{< experiment id="variational-principle" >}}

## 레일리 몫으로 쓰기

0이 아닌 시험 상태 \(c\)에 대해:

$$
E(c)=\frac{c^\dagger Hc}{c^\dagger c}\ge E_0.
$$

에르미트 H의 정규직교 고유기저에서 \(c=\sum_i a_i v_i\)로 쓰면 E는 고유값들의 음수가 아닌 가중 평균입니다. 가장 작은 고유값보다 작을 수 없는 이유입니다.

전체 계수에 같은 수를 곱해도 분자·분모가 함께 바뀌어 에너지는 같습니다. 정규화하지 않은 \(c^\dagger Hc\)만 최소화하면 상태의 물리적 에너지와 다른 문제를 풀게 됩니다.

## 공간을 늘리면 무엇이 보장될까

시험 상태 공간이 이전 공간을 포함하면 정확하게 최적화한 최저 에너지는 올라가지 않습니다. 하지만 최적화가 중간에 멈췄거나 표본 잡음이 있거나 해밀토니안이 달라졌다면 관찰 결과가 이 보장과 다르게 보일 수 있습니다.

바닥상태가 비축퇴이고 첫 들뜬 상태와 간격 \(\Delta>0\)이면 정규화된 시험 상태에 대해:

$$
1-|\langle\psi_0|\psi\rangle|^2\le\frac{E(\psi)-E_0}{\Delta}.
$$

에너지 오차가 작아도 간격이 매우 작으면 상태 충실도까지 높다고 단정하기 어렵습니다. 축퇴 바닥상태에서는 하나의 벡터보다 바닥 부분공간에 대한 겹침을 봅니다.

## 비교할 때 같은 문제를 사용하기

기저 집합, 전자 수, 대칭 구역, 핵 위치와 에너지 상수를 맞추어야 합니다. 측정 잡음으로 추정한 에너지가 기준보다 낮게 나왔다고 변분 원리가 깨진 것은 아닙니다. 그 값은 정확한 상태 기댓값이 아니라 통계적 추정값일 수 있습니다.

## 스스로 확인하기

**정규화하지 않은 벡터를 작게 만들면 에너지가 낮아질까요?**

전체 배율만 바꾸면 물리적 상태는 같습니다. 에너지는 노름 제곱으로 나눈 레일리 몫으로 계산해야 합니다.

## 더 읽기

[MIT OpenCourseWare · Quantum Physics I](https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

