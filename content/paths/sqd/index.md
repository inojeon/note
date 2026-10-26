---
{
  "weight": 50,
  "title": "표본으로 부분공간 만들기",
  "summary": "전자 배치를 회로로 준비하고 표본에서 고른 작은 공간의 에너지를 다시 풉니다.",
  "params": {
    "steps": [
      "occupation-bitstrings",
      "fermion-qubit",
      "hf-preparation",
      "excitation-state",
      "sqd-state-circuit",
      "sqd-sampling",
      "sqd-subspace"
    ]
  }
}
---

## 이 경로에서 연결할 내용

점유 비트열과 전자 연산을 큐빗으로 옮기는 규약부터 시작합니다. HF 준비와 여기 회로를 따라 상태를 만들고 반복 측정으로 배치를 찾습니다. 마지막에는 측정 빈도와 대각화가 구한 상태 계수가 왜 다른 값인지 비교합니다.

## 먼저 읽을 내용

[큰 배치 공간과 에너지 곡선](../large-spaces-and-energy-curves/)에서 사용한 계산과 용어를 이어 씁니다. 노트 오른쪽의 선수 개념에서도 필요한 설명으로 이동할 수 있습니다.

## 읽는 순서

## 전체 계산을 연결하기

[H₂ 종합 예제](../../notes/intro/)에서 실제 수치로 배치·표본·대각화를 연결할 수 있습니다. 필요한 계산은 [수학 복습](../../notes/prep-math/)에서, 확률 커버리지와 에너지 오차의 관계는 [심화 수학](../../notes/math/)에서 다시 확인합니다.
