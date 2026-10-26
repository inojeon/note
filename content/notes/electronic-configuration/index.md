---
title: "전자 배치"
summary: "오비탈 점유를 기록하는 배치와 스핀까지 정한 다전자 상태를 구별합니다."
params:
  topics: ["quantum-chemistry"]
  search_terms: ["electronic configuration", "전자 배치", "electronic-configuration"]
  prerequisites:
    - id: "orbital"
      reason: "오비탈과 확률 밀도의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
    - id: "electron-spin"
      reason: "전자 스핀과 측정축의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "slater-determinant"
      reason: "전자 둘의 이름을 바꾸면 왜 부호가 바뀔까?"
    - id: "pauli"
      reason: "같은 오비탈에 전자를 둘 넣어도 될까?"
    - id: "configuration-interaction"
      reason: "행렬식을 더하면 상태와 에너지는 어떻게 달라질까?"
  legacy_source: "concept-electronic-configuration.html"
---

## 같은 공간 오비탈 점유가 같은 다전자 상태를 뜻할까?

전자 배치는 어떤 오비탈에 전자가 몇 개 들어가는지 적는 방식입니다. 하지만 공간 오비탈 점유만 적으면 스핀 정보와 양자적인 중첩 정보가 빠질 수 있습니다.

예를 들어 공간 오비탈 a와 b에 전자 하나씩 있다는 말만으로 다전자 상태가 하나로 정해지지는 않습니다.

{{< experiment id="electronic-configuration" >}}

## 같은 공간 점유에 여러 스핀 상태

두 공간 오비탈 \(a,b\)에는 \(a\alpha,a\beta,b\alpha,b\beta\)라는 네 스핀 오비탈이 있습니다. 공간 점유가 \(a^1b^1\)일 때도 \(a\alpha b\alpha\), \(a\alpha b\beta\), \(a\beta b\alpha\), \(a\beta b\beta\)처럼 스핀 점유가 다릅니다.

총스핀의 고유상태를 만들려면 일부 행렬식들을 선형결합해야 할 수 있습니다. 따라서 공간 배치 하나, 슬레이터 행렬식 하나, 스핀 적응 상태 하나는 항상 같은 뜻이 아닙니다.

## 비트열로 점유 기록하기

스핀 오비탈마다 0 또는 1을 기록하면 점유 비트열이 됩니다. 예를 들어 순서를 \((a\alpha,b\alpha,a\beta,b\beta)\)로 정하면 그 순서에 맞춰 전자의 위치를 기록할 수 있습니다. **문자열을 어느 방향으로 출력하는지까지 정해야** 다른 프로그램의 결과와 비교할 수 있습니다.

전자 수는 1의 개수이고, \(\alpha\)·\(\beta\) 개수를 따로 세면 스핀 투영을 알 수 있습니다. 이 비트열은 [점유 비트열](../occupation-bitstrings/)과 SQD의 측정 표본으로 이어집니다.

## 배치 사이의 중첩

실제 다전자 상태는 여러 [슬레이터 행렬식](../slater-determinant/)의 중첩일 수 있습니다. 한 번의 점유 측정에서 배치 하나를 얻었다고 원래 상태가 항상 그 배치 하나였다는 뜻은 아닙니다. 상대 진폭까지 다루는 방법이 [구성 상호작용](../configuration-interaction/)입니다.

## 스스로 확인하기

**공간 오비탈 점유가 같으면 다전자 상태도 하나로 정해질까요?**

아니요. 스핀 점유와 상태들의 조합을 더 알아야 합니다. 공간 배치 하나가 행렬식 하나를 뜻하지는 않습니다.

## 더 읽기

[PySCF · CI와 FCI](https://pyscf.org/user/ci.html)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

