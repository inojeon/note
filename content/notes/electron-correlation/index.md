---
title: "전자 상관"
summary: "같은 문제에서 단일 행렬식으로 놓치는 효과와 상관 에너지의 기준을 이해합니다."
params:
  topics: ["quantum-chemistry"]
  search_terms: ["electron correlation", "전자 상관", "electron-correlation"]
  prerequisites:
    - id: "hartree-fock"
      reason: "하트리–폭와 자기일관장의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
    - id: "slater-determinant"
      reason: "슬레이터 행렬식의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "configuration-interaction"
      reason: "행렬식을 더하면 상태와 에너지는 어떻게 달라질까?"
    - id: "variational-principle"
      reason: "어떤 상태의 에너지를 낮추면 정확한 바닥상태에 가까워질까?"
    - id: "active-space"
      reason: "어떤 전자와 오비탈을 자세히 계산할까?"
  legacy_source: "concept-electron-correlation.html"
---

## 하나의 행렬식으로 놓치는 에너지는 어디에서 올까?

HF에도 전자 반발과 반대칭성에 따른 교환 효과가 있습니다. 전자 상관은 그 위에 남는, 하나의 최적화된 행렬식만으로 표현하기 어려운 전자들의 공동 거동을 말합니다.

상관 에너지를 비교할 때는 같은 핵 위치, 해밀토니안, 한 전자 기저와 HF의 제약을 맞추어야 합니다.

{{< experiment id="electron-correlation" >}}

## 상관 에너지의 정의

$$
E_{\mathrm{corr}}=E_{\mathrm{exact}}-E_{\mathrm{HF}}\le0.
$$

여기서 정확한 값은 선택한 문제 안에서의 값입니다. 유한 기저의 [FCI](../configuration-interaction/)는 그 기저 안에서는 정확하지만 완전 기저 극한까지의 오차는 남습니다. 실험값과 HF의 차이에는 핵 운동·상대론·기저 오차 등이 섞일 수 있습니다.

## 두 자리 모형으로 비교하기

설명용 반채움 Hubbard 두 자리 모형에서 이동 세기 t, 같은 자리 반발 U를 사용합니다. 두 전자를 같은 결합성 오비탈에 넣는 제한 HF 기준에서는:

$$
E_{\mathrm{RHF}}=\frac U2-2t,\qquad
E_0=\frac{U-\sqrt{U^2+16t^2}}2.
$$

U=0이면 둘 다 −2t입니다. U가 커지면 같은 자리 중복 점유를 피하는 배치 조합이 중요해져 RHF와 차이가 커집니다. 이 비교는 RHF 제약 기준이며, 큰 U에서 대칭을 깨는 UHF가 더 낮은 값을 줄 수 있습니다.

## 동적·정적 상관을 구분해서 읽기

전자들이 순간적으로 가까워지는 상황을 세밀하게 조절하는 효과를 동적 상관, 여러 배치가 비슷하게 중요해 단일 기준 상태가 부족한 상황을 정적 상관이라고 부릅니다. 두 효과를 모든 계에서 유일한 숫자로 분리하는 보편적 방법이 있는 것은 아닙니다.

[활성 공간](../active-space/)은 중요한 여러 배치를 함께 다루는 데 유용하지만 그 밖의 상관을 자동으로 모두 포함하지는 않습니다.

## 스스로 확인하기

**HF가 전자 반발을 전부 무시하나요?**

아니요. HF에도 반발과 교환이 포함됩니다. 단일 행렬식으로 표현하지 못하는 상관이 추가로 남습니다.

## 더 읽기

[PySCF · CI와 FCI](https://pyscf.org/user/ci.html)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

