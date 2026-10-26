---
title: "전자 스핀과 측정축"
summary: "스핀의 고유한 크기와 특정 축을 따라 측정하는 두 결과를 구별합니다."
params:
  topics: ["quantum-chemistry"]
  search_terms: ["electron spin", "전자 스핀과 측정축", "electron-spin"]
  prerequisites:
    - id: "quantum-state"
      reason: "양자 상태와 표현의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
    - id: "observable"
      reason: "관측량과 기댓값의 표현과 기본 계산을 먼저 익히면 이 설명을 따라가기 쉽습니다."
  related:
    - id: "pauli"
      reason: "같은 오비탈에 전자를 둘 넣어도 될까?"
    - id: "born-rule"
      reason: "음수나 복소수인 진폭이 어떻게 확률이 될까?"
    - id: "orbital"
      reason: "오비탈은 전자가 도는 길일까?"
  legacy_source: "concept-electron-spin.html"
---

## 측정축을 돌리면 스핀의 크기도 바뀔까?

전자 스핀은 작은 공이 실제로 회전하는 모양으로 완전히 설명되는 성질이 아닙니다. 전자는 스핀 양자수 \(s=1/2\)를 가지며 한 축의 스핀 성분을 측정하면 두 값 중 하나가 나옵니다.

준비한 상태는 그대로 두고 측정축을 돌리면 결과의 확률이 달라집니다. 스핀 자체의 고유한 크기를 바꾸는 조작은 아닙니다.

{{< experiment id="electron-spin" >}}

## 같은 상태를 다른 축에서 측정하기

z축 위쪽 상태를 준비하고 z축과 \(\theta\)만큼 기울어진 축으로 측정하면:

$$
p(+)=\cos^2\frac\theta2,\qquad
p(-)=\sin^2\frac\theta2,\qquad
\langle S_n\rangle=\frac\hbar2\cos\theta.
$$

0°에서는 \(+\hbar/2\)가 확정적이고, 90°에서는 두 결과가 반반이며 평균은 0입니다. 180°에서는 \(-\hbar/2\)가 확정적입니다. 평균이 0이어도 단일 측정에서 0이 나오는 것은 아닙니다.

## 스핀 크기와 축 성분

총 스핀 제곱은 \(S^2=s(s+1)\hbar^2=3\hbar^2/4\)입니다. 한 축의 성분은 \(\pm\hbar/2\)입니다. 이 둘은 서로 다른 관측량입니다.

오비탈의 공간 함수에 스핀 함수 \(\alpha\), \(\beta\)를 붙이면 서로 다른 스핀 오비탈을 만듭니다. 한 공간 오비탈에 두 전자를 넣을 수 있다는 설명은 반대 스핀의 서로 다른 스핀 오비탈을 사용한다는 뜻이며 [파울리 원리](../pauli/)와 연결됩니다.

## 스스로 확인하기

**평균 스핀이 0이면 한 번의 결과도 0일까요?**

이 전자 스핀 성분 측정은 +ℏ/2 또는 −ℏ/2를 줍니다. 두 값의 확률이 같으면 평균이 0입니다.

## 더 읽기

[MIT OpenCourseWare · Quantum Physics I](https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/)에서 관련 정의와 계산 배경을 이어서 확인할 수 있습니다.

