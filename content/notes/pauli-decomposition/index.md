---
{
  "title": "파울리 분해",
  "summary": "해밀토니안을 측정 가능한 파울리 문자열의 합으로 바꾸어 기대값을 구합니다.",
  "params": {
    "topics": [
      "vqe"
    ],
    "search_terms": [
      "pauli decomposition"
    ],
    "prerequisites": [
      {
        "id": "energy-expectation",
        "reason": "항별 평균을 합해 전체 에너지 기대값을 구합니다."
      },
      {
        "id": "tensor-product",
        "reason": "여러 큐빗의 파울리 문자열을 정의합니다."
      }
    ],
    "related": [
      {
        "id": "measurement-shots",
        "reason": "같은 상태를 준비했는데 왜 에너지 추정값이 달라질까?"
      }
    ]
  }
}
---

## 큰 에너지 연산을 작은 평균으로
한 큐빗의 에르미트 행렬은 I, X, Y, Z의 실수 계수 합으로 나타낼 수 있습니다. 여러 큐빗에서는 이 행렬들의 텐서곱이 기저가 됩니다.

{{< experiment id="pauli-decomposition" >}}

$$
H=\sum_j h_jP_j,\qquad h_j=2^{-n}\operatorname{Tr}(P_jH),\qquad
\langle H\rangle=\sum_j h_j\langle P_j\rangle.
$$

계수 \(h_j\)는 H가 정하는 에너지 값이고, \(\langle P_j\rangle\)는 준비 상태에 의존합니다. 항등행렬 I의 평균은 항상 1이므로 측정할 필요가 없습니다.

## 예: 실수 2×2 행렬
\(H=\begin{pmatrix}a&b\\b&d\end{pmatrix}\)이면 \(H=(a+d)I/2+bX+(a-d)Z/2\)입니다. Z 평균은 계산 기저에서, X 평균은 하다마드를 적용한 뒤 측정해 추정할 수 있습니다.

## 측정 비용이 생기는 지점
파울리 문자열 한 샷의 고유값은 ±1이며 해당 비트 결과의 부호를 곱해 얻습니다. 서로 양립할 수 없는 설정은 같은 상태의 새 준비가 필요합니다. 함께 측정 가능한 항의 묶음과 샷 배분은 비용을 줄일 수 있지만, 임의의 항을 모두 한 번에 읽을 수는 없습니다.

[반복 측정](../measurement-shots/)에서는 각 평균의 오차가 전체 에너지 추정에 어떻게 들어오는지 다룹니다.
