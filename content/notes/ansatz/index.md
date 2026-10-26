---
{
  "title": "안사츠",
  "summary": "탐색할 상태의 가족을 정하고 표현력과 실행 비용 사이의 선택을 이해합니다.",
  "params": {
    "topics": [
      "vqe"
    ],
    "search_terms": [
      "ansatz"
    ],
    "prerequisites": [
      {
        "id": "energy-expectation",
        "reason": "탐색할 상태 가족의 에너지를 비교합니다."
      }
    ],
    "related": [
      {
        "id": "parameterized-circuit",
        "reason": "회전각 하나로 양자 상태를 어떻게 바꿀까?"
      },
      {
        "id": "variational-principle",
        "reason": "어떤 상태의 에너지를 낮추면 정확한 바닥상태에 가까워질까?"
      },
      {
        "id": "classical-optimization",
        "reason": "다음 회로 각도는 어떻게 선택할까?"
      }
    ]
  }
}
---

## 가능한 모든 상태를 탐색할 수 있을까
안사츠는 조절 가능한 매개변수로 준비할 상태의 가족을 정한 것입니다. 회로를 고르면 어떤 상태까지 도달할 수 있는지가 먼저 제한됩니다.

{{< experiment id="ansatz" >}}

$$
|\psi(\boldsymbol\theta)\rangle=U(\boldsymbol\theta)|\psi_{\rm ref}\rangle.
$$

## 작은 예로 표현력 확인하기
\(R_y(\theta)|0\rangle\)는 실수 진폭만 만들 수 있습니다. \((|0\rangle+i|1\rangle)/\sqrt2\)처럼 상대 위상 i가 필요한 상태는 이 가족에 없습니다. 위상 회전을 추가하면 도달 가능한 영역을 넓힐 수 있습니다.

분자에서는 [하트리–폭 기준 배치](../hf-preparation/)에서 출발해 점유를 바꾸는 연산을 조합합니다. 전자 수 같은 보존량을 유지하는 회로는 탐색할 필요가 없는 상태를 피하는 데 도움이 됩니다.

## 깊을수록 무조건 좋은가
표현 가능한 상태가 늘어도 초기 매개변수가 좋은 상태를 주는 것은 아닙니다. 게이트 수·잡음·최적화 난도도 증가할 수 있습니다. 안사츠의 최저 에너지와 실제 최적화가 찾은 값은 구별해야 합니다.

두 배치만 섞는 설명용 모형을 일반 분자의 충분한 안사츠로 해석하지 마세요. [UCJ 회로](../03-ucj-inside/)에서는 분자 구조를 반영한 층과 초기 매개변수를 살펴봅니다.
