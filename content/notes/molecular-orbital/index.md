---
title: "분자 오비탈"
summary: "원자 중심 함수를 결합해 분자 전체의 한 전자 함수를 만들고 부호 관례를 이해합니다."
params:
  topics: ["quantum-chemistry"]
  search_terms: ["molecular orbital", "분자 오비탈", "molecular-orbital", "MO", "분자 궤도"]
  prerequisites:
    - id: "orbital"
      reason: "오비탈과 확률 밀도의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
    - id: "basis-set"
      reason: "기저 집합의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "electron-integrals"
      reason: "오비탈로부터 에너지 계산에 필요한 숫자를 어떻게 만들까?"
    - id: "superposition"
      reason: "확률은 같은데, 다른 측정에서 결과가 달라질 수 있을까?"
    - id: "electronic-configuration"
      reason: "같은 공간 오비탈 점유가 같은 다전자 상태를 뜻할까?"
  legacy_source: "concept-molecular-orbital.html"
---

## 원자 중심 함수 둘을 더하고 빼면 무엇이 달라질까?

분자 오비탈은 한 원자에만 속하는 경로가 아니라 분자 전체에 걸쳐 정의한 한 전자 함수입니다. 원자 중심 [기저 함수](../basis-set/)를 더하고 빼는 방식으로 모양을 만들어 볼 수 있습니다.

두 함수가 겹치는 영역에서는 진폭의 간섭이 일어나므로, 같은 함수의 합과 차는 서로 다른 밀도와 마디를 만듭니다.

{{< experiment id="molecular-orbital" >}}

## 두 원자 함수의 합과 차

정규화된 실수 함수 \(\chi_A,\chi_B\)의 겹침을 \(S=\langle\chi_A|\chi_B\rangle\)라고 하면:

$$
\phi_+=\frac{\chi_A+\chi_B}{\sqrt{2(1+S)}},\qquad
\phi_-=\frac{\chi_A-\chi_B}{\sqrt{2(1-S)}}.
$$

\(|S|<1\)에서 두 함수가 독립적이라고 가정합니다. 같은 위상으로 정한 수소 1s 함수의 합은 핵 사이 밀도를 키우고, 차는 핵 사이 마디를 만듭니다. H₂에서 이를 결합성 g와 반결합성 u 오비탈로 연결할 수 있습니다.

## 계수의 부호만으로 판단하면 안 되는 이유

기저 함수 \(\chi_B\)의 부호를 바꾸면서 대응 계수도 함께 바꾸면 같은 오비탈을 나타냅니다. 따라서 '플러스 계수는 결합성'이라는 규칙은 기저의 위상 관례 없이 사용할 수 없습니다. 실제 함수의 핵 사이 밀도, 마디, 에너지 효과를 함께 보아야 합니다.

## 오비탈과 전자 상태의 층위

오비탈 계수 \(C_{\mu p}\)는 한 전자 함수의 모양을 정합니다. 여러 전자가 어떤 오비탈을 점유했는지와 그 배치들을 어떻게 중첩했는지는 다른 정보입니다. [전자 적분](../electron-integrals/)은 오비탈 함수에서 에너지 계산의 재료를 만들고, [CI](../configuration-interaction/)는 다전자 배치의 계수를 구합니다.

## 스스로 확인하기

**계수의 부호만 보면 결합성인지 판단할 수 있을까요?**

기저 함수의 부호 관례도 함께 봐야 합니다. 기저와 계수의 부호를 함께 바꾸면 같은 오비탈을 나타냅니다.

## 더 읽기

[PySCF · 분자·기저·적분 설정](https://pyscf.org/user/gto.html)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

