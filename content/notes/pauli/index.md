---
title: "파울리 배타 원리"
summary: "동일한 스핀 오비탈을 두 전자가 함께 점유할 수 없다는 조건을 다룹니다."
params:
  topics: ["quantum-chemistry"]
  search_terms: ["pauli", "파울리 배타 원리"]
  prerequisites:
    - id: "orbital"
      reason: "오비탈과 확률 밀도의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
    - id: "electron-spin"
      reason: "전자 스핀과 측정축의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "electronic-configuration"
      reason: "같은 공간 오비탈 점유가 같은 다전자 상태를 뜻할까?"
    - id: "slater-determinant"
      reason: "전자 둘의 이름을 바꾸면 왜 부호가 바뀔까?"
    - id: "hartree-fock"
      reason: "전자 밀도가 방정식을 바꾸는데, 어떻게 해를 찾을까?"
  legacy_source: "concept-pauli.html"
---

## 같은 오비탈에 전자를 둘 넣어도 될까?

전자 두 개가 같은 공간 오비탈에 있다고 해서 언제나 금지되는 것은 아닙니다. 공간 모양이 같아도 스핀 상태가 다르면 서로 다른 스핀 오비탈입니다.

파울리 배타 원리는 **완전히 같은 한 전자 상태, 즉 같은 스핀 오비탈을 중복 점유할 수 없다**는 규칙입니다. 전자의 반대칭성에서 나옵니다.

{{< experiment id="pauli" >}}

## 공간 오비탈과 스핀 오비탈

공간 함수 \(\phi(r)\) 하나에서 \(\phi(r)\alpha(s)\), \(\phi(r)\beta(s)\)라는 두 스핀 오비탈을 만들 수 있습니다. 전자는 각각 최대 하나씩 들어갈 수 있으므로 공간 오비탈 하나에는 최대 두 전자가 들어갑니다.

두 전자 좌표 \(x=(r,s)\)를 사용하면 반대칭 상태는:

$$
\Psi(x_1,x_2)=\frac{\chi_a(x_1)\chi_b(x_2)-\chi_b(x_1)\chi_a(x_2)}{\sqrt2}.
$$

\(\chi_a=\chi_b\)이면 두 항이 같아 전체가 0입니다. 정규화할 수 있는 물리적 상태가 사라지므로 같은 스핀 오비탈의 중복 점유가 금지됩니다.

## 무엇을 설명하지는 않을까

배타 원리는 전자 반발과 같은 힘이 아닙니다. 전자 사이 쿨롱 상호작용을 없앤 모형에서도 페르미온의 반대칭 조건은 남습니다. 어떤 오비탈을 먼저 채울지, 실제 에너지가 얼마인지는 [해밀토니안](../hamiltonian/)과 상호작용을 함께 보아야 합니다.

점유를 기록한 [전자 배치](../electronic-configuration/)와 전체 반대칭 함수인 [슬레이터 행렬식](../slater-determinant/)을 차례로 연결해 보세요.

## 스스로 확인하기

**한 공간 오비탈에 전자 둘이 있어도 괜찮을까요?**

서로 반대 스핀인 서로 다른 스핀 오비탈을 점유하면 가능합니다. 금지되는 것은 동일한 스핀 오비탈의 중복 점유입니다.

## 더 읽기

[MIT OpenCourseWare · Quantum Physics I](https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

