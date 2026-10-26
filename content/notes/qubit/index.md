---
{
  "title": "큐빗",
  "summary": "두 기저 상태의 복소 진폭으로 표현하는 정보 단위와 측정 확률을 이해합니다.",
  "params": {
    "topics": [
      "quantum-computing"
    ],
    "search_terms": [
      "qubit"
    ],
    "prerequisites": [
      {
        "id": "two-level-system",
        "reason": "두 기준 상태가 만드는 2차원 공간과 중첩의 의미를 사용합니다."
      }
    ],
    "related": [
      {
        "id": "computational-basis",
        "reason": "왜 0 상태는 영벡터가 아니라 첫째 좌표가 1인 벡터일까?"
      },
      {
        "id": "superposition",
        "reason": "확률은 같은데, 다른 측정에서 결과가 달라질 수 있을까?"
      },
      {
        "id": "measurement-basis",
        "reason": "같은 상태인데, 무엇을 측정하느냐에 따라 결과가 달라질까?"
      }
    ]
  }
}
---

## 기준은 두 개, 가능한 상태는 여러 개
큐빗의 0과 1은 [기저](../basis/) 상태의 이름입니다. 한 큐빗은 그 두 상태 중 하나뿐 아니라 중첩으로 준비할 수 있습니다. 큐빗이 전자 하나를 뜻하는 것은 아닙니다.

{{< experiment id="qubit" >}}

## 진폭과 확률
한 큐빗의 정규화된 순수상태를 다음처럼 씁니다.

$$
|\psi\rangle=\alpha|0\rangle+\beta|1\rangle,\qquad |\alpha|^2+|\beta|^2=1.
$$

\(\alpha,\beta\)는 복소수입니다. 계산 기저로 측정할 때 0과 1의 확률은 각각 절댓값 제곱입니다. 진폭을 직접 확률로 읽지 않습니다.

## 확률이 같아도 상태가 다를 수 있다
\(|+\rangle=(|0\rangle+|1\rangle)/\sqrt2\)와 \(|-\rangle=(|0\rangle-|1\rangle)/\sqrt2\)는 모두 0·1 확률이 반반입니다. 그러나 [측정 기저](../measurement-basis/)를 바꾸면 서로 다른 결과를 줍니다. 두 진폭 사이의 상대 위상이 다르기 때문입니다.

전체 진폭에 같은 \(e^{i\phi}\)를 곱하면 전역 위상만 변해 같은 순수상태를 나타냅니다. 여기서는 순수상태만 다룹니다. 잡음이나 부분계의 상태는 일반적으로 밀도행렬이 필요합니다.
