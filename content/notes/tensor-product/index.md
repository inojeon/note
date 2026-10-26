---
{
  "title": "텐서곱과 여러 큐빗",
  "summary": "두 계의 기저를 조합해 전체 공간을 만들고 상태 차원이 곱해지는 이유를 봅니다.",
  "params": {
    "topics": [
      "quantum-computing"
    ],
    "search_terms": [
      "tensor product"
    ],
    "prerequisites": [
      {
        "id": "computational-basis",
        "reason": "한 큐빗의 두 기저를 조합해 여러 큐빗의 좌표를 만듭니다."
      }
    ],
    "related": [
      {
        "id": "entanglement",
        "reason": "전체 상태는 알지만,각 큐빗에 따로 순수상태를 지정할 수 없을 수 있습니다."
      },
      {
        "id": "computational-basis",
        "reason": "왜 0 상태는 영벡터가 아니라 첫째 좌표가 1인 벡터일까?"
      },
      {
        "id": "qubit",
        "reason": "기준 상태는 둘인데 가능한 상태는 왜 더 많을까?"
      }
    ]
  }
}
---

## 두 시스템을 함께 표현하기
첫 큐빗의 상태 둘과 둘째 큐빗의 상태 둘을 조합하면 전체 기저는 네 개입니다. 두 큐빗이 같은 2차원 공간을 나누는 것이 아니라 4차원 공간을 만듭니다.

{{< experiment id="tensor-product" >}}

## 계수의 모든 조합
여기서는 왼쪽 계와 오른쪽 계 순서를 고정합니다.

$$
\begin{pmatrix}a\\b\end{pmatrix}\otimes\begin{pmatrix}c\\d\end{pmatrix}
=\begin{pmatrix}ac\\ad\\bc\\bd\end{pmatrix}.
$$

\(|+\rangle\otimes|0\rangle=(|00\rangle+|10\rangle)/\sqrt2\)입니다. 오른쪽 큐빗은 반드시 0이고 왼쪽은 반반입니다. \(n\)큐빗의 계산 기저 수는 \(2^n\)입니다.

## 연산도 어느 계에 작용하는지 적는다
\(X\otimes I\)는 왼쪽 큐빗만 바꿉니다. \((A\otimes B)(u\otimes v)=Au\otimes Bv\)이므로 각 계에 독립적인 연산을 표현할 수 있습니다.

모든 전체 상태가 두 벡터의 텐서곱으로 분해되는 것은 아닙니다. \((|00\rangle+|11\rangle)/\sqrt2\)처럼 분해되지 않는 순수상태가 [얽힘](../entanglement/)입니다. 지수적인 기저 수가 측정 한 번에 지수적으로 많은 고전 정보를 읽는다는 뜻은 아닙니다.
