---
title: "슈뢰딩거 방정식"
summary: "시간 변화의 법칙과 정상 상태의 고유값 문제를 연결하고 잔차를 해석합니다."
params:
  topics: ["quantum-chemistry"]
  search_terms: ["schrodinger", "슈뢰딩거 방정식"]
  prerequisites:
    - id: "eigen"
      reason: "고유값과 고유벡터의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
    - id: "quantum-state"
      reason: "양자 상태와 표현의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "born-oppenheimer"
      reason: "왜 핵의 위치를 고정하고 전자 문제부터 풀까?"
    - id: "hamiltonian"
      reason: "행렬에서 에너지와 양자 상태를 어떻게 읽을까?"
    - id: "diagonalization"
      reason: "기준을 바꾸면 행렬 계산이 단순해질까?"
  legacy_source: "concept-schrodinger.html"
---

## 고유값과 고유벡터를 구하면, 왜 원자의 에너지와 상태를 알 수 있을까?

양자 상태가 시간에 따라 변하는 규칙은 슈뢰딩거 방정식입니다. 시간에 의존하지 않는 해밀토니안에서는 에너지가 확정된 상태를 고유값 문제로 찾을 수 있습니다.

따라서 분자 에너지를 구한다는 일은 적절한 근사와 기저 안에서 [해밀토니안](../hamiltonian/)의 고유값과 고유벡터를 구하는 문제로 이어집니다.

{{< experiment id="schrodinger" >}}

## 시간 방정식에서 고유값 문제로

$$
i\hbar\frac{\partial}{\partial t}|\psi(t)\rangle=H|\psi(t)\rangle.
$$

\(H|n\rangle=E_n|n\rangle\)이면 \(|\psi_n(t)\rangle=e^{-iE_nt/\hbar}|n\rangle\)가 해입니다. 시간에 따른 전체 위상만 바뀌므로 이 상태의 시간에 독립적인 관측량 확률은 유지됩니다. 여러 에너지 상태의 중첩에서는 상대 위상이 변해 관측 확률이 달라질 수 있습니다.

유한 기저로 전개하면 \(Hc=Ec\)가 됩니다. 비직교 기저에서는 겹침 행렬을 포함한 \(Hc=ESc\)가 됩니다.

## 계산 결과가 해인지 확인하기

후보 벡터 \(c\)의 에너지를 레일리 몫으로 구하고 잔차를 계산합니다.

$$
E(c)=\frac{c^\dagger Hc}{c^\dagger c},\qquad r=Hc-E(c)c.
$$

잔차가 0이면 이 유한 행렬의 고유상태입니다. 그러나 들뜬 상태도 잔차가 0입니다. **바닥상태라는 말에는 가장 낮은 고유값이라는 조건이 더 필요합니다.**

## 정확성의 범위

유한 기저 안에서 방정식을 정확히 풀어도 기저 바깥의 함수는 표현하지 못합니다. 분자의 핵을 고정했는지, 상대론을 무시했는지, 활성 공간을 줄였는지도 결과의 범위를 정합니다. 다음 [보른–오펜하이머 근사](../born-oppenheimer/)에서는 핵과 전자의 문제를 나누는 이유를 봅니다.

## 스스로 확인하기

**잔차가 0이면 반드시 바닥상태일까요?**

아니요. 들뜬 고유상태도 Hc = Ec를 만족합니다. 바닥상태는 가능한 에너지 중 가장 낮은 고유값에 속합니다.

## 더 읽기

[MIT OpenCourseWare · Quantum Physics I](https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

