---
title: "하트리–폭와 자기일관장"
summary: "한 슬레이터 행렬식의 오비탈을 최적화하며 밀도와 Fock 행렬을 일관되게 맞춥니다."
params:
  topics: ["quantum-chemistry"]
  search_terms: ["hartree fock", "하트리–폭와 자기일관장", "hartree-fock", "HF", "SCF", "RHF", "UHF", "Hartree–Fock"]
  prerequisites:
    - id: "variational-principle"
      reason: "변분 원리의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "electron-correlation"
      reason: "하나의 행렬식으로 놓치는 에너지는 어디에서 올까?"
    - id: "slater-determinant"
      reason: "전자 둘의 이름을 바꾸면 왜 부호가 바뀔까?"
    - id: "electron-integrals"
      reason: "오비탈로부터 에너지 계산에 필요한 숫자를 어떻게 만들까?"
  legacy_source: "concept-hartree-fock.html"
---

## 전자 밀도가 방정식을 바꾸는데, 어떻게 해를 찾을까?

전자 한 개의 오비탈을 구하려면 다른 전자들의 영향을 알아야 합니다. 그런데 그 영향은 우리가 아직 구하지 못한 오비탈과 밀도에 달려 있습니다.

하트리–폭(HF)은 다전자 상태를 한 [슬레이터 행렬식](../slater-determinant/)으로 제한하고 그 안에서 오비탈을 최적화합니다. 밀도에서 만든 평균장과 그 평균장의 해가 서로 맞도록 반복하는 절차가 SCF입니다.

{{< experiment id="hartree-fock" >}}

## 밀도와 Fock 행렬의 반복

1. 초기 밀도 또는 오비탈을 정합니다.
2. 전자 적분과 현재 밀도로 Fock 행렬 F를 만듭니다.
3. 비직교 원자 기저에서 \(FC=SC\varepsilon\)를 풉니다.
4. 새 오비탈을 점유해 새 밀도를 만들고 에너지·밀도 변화를 확인합니다.

F 자체가 밀도에 의존하므로 한 번의 고유값 풀이로 끝나지 않습니다. 단순 반복이 흔들리면 밀도 혼합이나 DIIS 같은 수렴 가속을 사용합니다.

## 닫힌껍질 RHF의 에너지

정규직교 공간 오비탈의 점유 지표 i,j에 대해:

$$
E_{\mathrm{RHF}}=2\sum_i h_{ii}+\sum_{ij}\left[2(ii|jj)-(ij|ji)\right]+E_{\mathrm{nn}}.
$$

쿨롱과 교환 항이 이미 포함되어 있으므로 HF가 전자 반발을 전부 무시한다고 말하면 틀립니다. Fock 고유값의 단순 합도 이 총 에너지와 다릅니다.

## 수렴했다는 말의 범위

SCF 수렴은 자기일관 해를 찾았다는 뜻입니다. 초기값에 따라 다른 정상점에 도달할 수 있고 전역적으로 가장 낮은 HF 해인지 별도 확인이 필요할 수 있습니다. RHF는 반대 스핀 전자가 같은 공간 오비탈을 사용하도록 제한하고, UHF는 이 제약을 풀지만 스핀 오염을 확인해야 합니다.

수렴을 아주 엄격하게 해도 유한 기저 오차와 단일 행렬식이 놓치는 [전자 상관](../electron-correlation/)은 남습니다. 결합이 끊어지는 구간에서는 여러 배치가 함께 중요해질 수 있습니다.

## 스스로 확인하기

**SCF가 수렴하면 정확한 분자 에너지를 찾은 걸까요?**

자기일관 해를 찾았다는 뜻입니다. 전역 최저 HF 해인지도 별도 문제이며 기저 오차와 HF가 놓치는 전자 상관도 남습니다.

## 더 읽기

[PySCF · 자기일관장 계산](https://pyscf.org/user/scf.html)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

