---
title: "관측량과 기댓값"
summary: "한 번 측정 가능한 고유값과 반복 측정의 평균인 기댓값을 구별합니다."
params:
  topics: ["quantum-chemistry"]
  search_terms: ["observable", "관측량과 기댓값"]
  prerequisites:
    - id: "quantum-state"
      reason: "양자 상태와 표현의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
    - id: "born-rule"
      reason: "보른 규칙의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "hamiltonian"
      reason: "행렬에서 에너지와 양자 상태를 어떻게 읽을까?"
    - id: "eigen"
      reason: "변환해도 같은 직선 위에 남는 벡터가 있을까?"
    - id: "superposition"
      reason: "확률은 같은데, 다른 측정에서 결과가 달라질 수 있을까?"
  legacy_source: "concept-observable.html"
---

## 평균 에너지가 2라면, 한 번 측정해도 2가 나올까?

에너지의 평균이 2라고 해서 한 번 측정했을 때 반드시 2가 나오는 것은 아닙니다. 가능한 결과가 1과 3이고 두 결과가 절반씩 나와도 평균은 2입니다.

유한차원 양자 모형에서 관측량은 [에르미트 행렬](../symmetric/)로 나타냅니다. 고유값이 가능한 이상적 측정 결과이며 상태가 그 결과들의 확률을 결정합니다.

{{< experiment id="observable" >}}

## 고유기저로 측정 읽기

$$
A|a_j\rangle=a_j|a_j\rangle,\qquad
|\psi\rangle=\sum_j c_j|a_j\rangle.
$$

비축퇴 결과 \(a_j\)의 확률은 \(|c_j|^2\)이며 기댓값은:

$$
\langle A\rangle=\langle\psi|A|\psi\rangle
=\sum_j |c_j|^2a_j.
$$

\(A=\operatorname{diag}(1,3)\), \(|\psi\rangle=(1,1)^T/\sqrt2\)이면 기댓값은 2이지만 단일 측정 결과는 1 또는 3입니다. 반복 실험에서는 매번 같은 상태를 새로 준비한다는 조건이 필요합니다.

## 흔들림도 상태의 정보

분산은 \(\langle A^2\rangle-\langle A\rangle^2\)입니다. 위 예에서는 1입니다. 고유상태에서는 그 관측량의 분산이 0이지만 다른 관측량까지 확정적이라는 뜻은 아닙니다.

어떤 행렬의 대각 원소는 현재 기저 상태들의 기댓값입니다. 기저가 관측량의 고유기저일 때만 대각 원소를 측정 고유값으로 바로 읽을 수 있습니다. [해밀토니안](../hamiltonian/)도 같은 규칙을 따릅니다.

## 스스로 확인하기

**에너지가 1과 3만 가능하면 한 번 측정해 평균인 2도 얻을까요?**

아니요. 이 이상적 측정의 한 번 결과는 1 또는 3입니다. 2는 같은 상태를 새로 준비해 반복한 결과의 이론적 평균입니다.

## 더 읽기

[MIT OpenCourseWare · Quantum Physics I](https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

