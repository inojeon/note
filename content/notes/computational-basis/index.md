---
{
  "title": "계산 기저와 상태 벡터",
  "summary": "상태의 이름과 그 상태에 곱하는 계수를 구별하고, 비트 순서를 명시합니다.",
  "params": {
    "topics": [
      "quantum-computing"
    ],
    "search_terms": [
      "computational basis"
    ],
    "prerequisites": [
      {
        "id": "qubit",
        "reason": "0·1 상태와 복소 진폭을 좌표로 적습니다."
      }
    ],
    "related": [
      {
        "id": "quantum-gate",
        "reason": "행렬을 곱해서 양자 상태를 어떻게 바꿀까?"
      },
      {
        "id": "born-rule",
        "reason": "음수나 복소수인 진폭이 어떻게 확률이 될까?"
      },
      {
        "id": "energy-measurement",
        "reason": "0·1을 읽는 것과 에너지를 읽는 것은 어떻게 다를까?"
      }
    ]
  }
}
---

## 0 상태는 영벡터가 아니다
\(|0\rangle\)의 0은 상태 이름입니다. 기저 순서를 \(|0\rangle,|1\rangle\)로 정하면 첫 상태의 계수가 1이므로 좌표는 \((1,0)^T\)입니다.

{{< experiment id="computational-basis" >}}

$$
|0\rangle=\begin{pmatrix}1\\0\end{pmatrix},\qquad
|1\rangle=\begin{pmatrix}0\\1\end{pmatrix},\qquad
|\psi\rangle=\begin{pmatrix}a\\b\end{pmatrix}.
$$

두 성분이 모두 0인 벡터는 정규화할 수 없으므로 양자 상태가 아닙니다. [보른 규칙](../born-rule/)에 따라 정규화된 상태의 확률 합은 1입니다.

## 여러 큐빗의 순서
두 큐빗을 \(|q_1q_0\rangle\)로 적을 때 기저 순서는 00, 01, 10, 11로 정할 수 있습니다. \(|01\rangle\)은 네 성분 중 두 번째 성분만 1인 상태입니다. 오른쪽 비트가 큐빗 0이라는 규약과 행렬의 행·열 순서를 함께 적어야 합니다.

계산 기저는 표준적인 좌표 기준입니다. 분자의 [에너지 고유상태](../energy-measurement/)와 항상 같은 것은 아니므로 0이 항상 가장 낮은 에너지를 뜻하지 않습니다.
