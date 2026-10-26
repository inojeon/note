---
{
  "title": "하트리–폭 기준 상태 준비",
  "summary": "고전적으로 정한 오비탈의 점유 배치를 X 게이트로 준비합니다.",
  "params": {
    "topics": [
      "sqd"
    ],
    "search_terms": [
      "hf preparation"
    ],
    "prerequisites": [
      {
        "id": "occupation-bitstrings",
        "reason": "준비할 HF 배치를 고정된 비트 순서로 표현합니다."
      }
    ],
    "related": [
      {
        "id": "excitation-state",
        "reason": "하나의 전자 배치에서 여러 배치의 중첩 상태를 어떻게 준비할까?"
      },
      {
        "id": "hartree-fock",
        "reason": "전자 밀도가 방정식을 바꾸는데, 어떻게 해를 찾을까?"
      },
      {
        "id": "quantum-gate",
        "reason": "행렬을 곱해서 양자 상태를 어떻게 바꿀까?"
      }
    ]
  }
}
---

## 계산과 준비는 다른 단계
[하트리–폭](../hartree-fock/) 계산은 오비탈을 고전적으로 정합니다. 큐빗에서 그 기준 배치를 준비하는 것은 정해진 점유 비트에 X를 적용하는 과정입니다. X 게이트가 오비탈의 공간 모양을 계산하는 것은 아닙니다.

{{< experiment id="hf-preparation" >}}

## 0000에서 0101로
\(q_3q_2q_1q_0=\beta_1\beta_0\alpha_1\alpha_0\) 규약에서 오비탈 0을 α·β가 점유하려면 다음처럼 합니다.

$$
|0000\rangle\xrightarrow{X_0}|0001\rangle\xrightarrow{X_2}|0101\rangle.
$$

서로 다른 큐빗의 X는 순서를 바꿔도 같은 결과입니다. 완성된 상태를 계산 기저로 측정하면 이상적인 경우 0101만 나옵니다.

## 기준 배치의 한계
단일 배치는 [전자 상관](../electron-correlation/)을 모두 표현하지 못합니다. 이를 기준으로 여러 배치의 중첩을 만드는 연산을 추가합니다. 분자에 따라 점유 오비탈과 전자 수가 다르므로 모든 HF 상태가 0101인 것은 아닙니다.

[들뜸과 중첩](../excitation-state/)에서는 기준 배치에서 다른 배치를 포함시키며, 이것이 곧 정확한 바닥상태 준비를 보장하는 것은 아니라는 점을 확인합니다.
