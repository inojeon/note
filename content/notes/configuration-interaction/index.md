---
title: "구성 상호작용과 FCI"
summary: "고정된 오비탈의 여러 행렬식을 중첩해 다전자 에너지와 상태를 구합니다."
params:
  topics: ["quantum-chemistry"]
  search_terms: ["configuration interaction", "구성 상호작용과 FCI", "configuration-interaction", "CI", "FCI", "CISD"]
  prerequisites:
    - id: "slater-determinant"
      reason: "슬레이터 행렬식의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
    - id: "hamiltonian-elements"
      reason: "해밀토니안 행렬원소의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "active-space"
      reason: "어떤 전자와 오비탈을 자세히 계산할까?"
    - id: "variational-principle"
      reason: "어떤 상태의 에너지를 낮추면 정확한 바닥상태에 가까워질까?"
    - id: "electron-correlation"
      reason: "하나의 행렬식으로 놓치는 에너지는 어디에서 올까?"
  legacy_source: "concept-configuration-interaction.html"
---

## 행렬식을 더하면 상태와 에너지는 어떻게 달라질까?

HF가 한 행렬식의 오비탈을 최적화한다면 CI는 여러 행렬식을 기저로 놓고 그 진폭을 최적화합니다. 배치 사이 결합을 포함한 작은 고유값 문제로 생각할 수 있습니다.

CI 계수는 한 전자 오비탈의 전개 계수와 다릅니다. 하나는 다전자 상태를, 다른 하나는 한 전자 함수의 모양을 표현합니다.

{{< experiment id="configuration-interaction" >}}

## 행렬식의 중첩과 에너지

$$
|\Psi\rangle=\sum_I c_I|\Phi_I\rangle,\qquad
\sum_I|c_I|^2=1,\qquad Hc=Ec.
$$

기저 행렬식이 정규직교라고 가정합니다. 에너지에는 \(c_I^*H_{IJ}c_J\) 교차항이 있으므로 배치별 확률과 대각 에너지의 평균만으로 계산할 수 없습니다.

설명용 모형 \(H=\begin{pmatrix}-1&-0.2\\-0.2&-0.4\end{pmatrix}u\), \(c=(\cos\theta,\sin\theta)^T\)에서는:

$$
E/u=-\cos^2\theta-0.4\sin^2\theta-0.4\cos\theta\sin\theta.
$$

\(\theta\)와 \(-\theta\)는 배치 확률이 같지만 마지막 항의 부호가 다릅니다. 최저값은 \((-0.7-\sqrt{0.13})u\)로 기준 배치의 −1u보다 낮습니다.

## 전체 CI와 절단 CI

FCI는 선택한 유한 오비탈 공간과 전자 수에서 모든 행렬식을 포함합니다. 적절한 대칭 구역으로 제한해 풀 수도 있습니다. 그 공간의 해밀토니안에 대해서는 정확하지만 실제 분자의 모든 근사가 없어진 것은 아닙니다.

일부 들뜸만 남긴 절단 CI는 비용을 줄입니다. 포함 공간을 늘리고 정확히 최적화하면 최저 에너지는 올라가지 않습니다. 그러나 CISD 같은 절단은 일반적으로 크기 일관성을 보장하지 않아 멀리 떨어진 두 계를 함께 계산한 값이 각각의 합과 달라질 수 있습니다.

기본 CI는 오비탈을 고정합니다. 오비탈과 CI 계수를 함께 최적화하는 방법은 [CASSCF](../active-space/)로 이어집니다.

## 스스로 확인하기

**CI 에너지는 각 배치 에너지를 확률로 평균한 값일까요?**

비대각 결합에 따른 교차항도 필요합니다. 배치별 확률만으로는 상대 위상에 따른 기여를 알 수 없습니다.

## 더 읽기

[PySCF · CI와 FCI](https://pyscf.org/user/ci.html)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

