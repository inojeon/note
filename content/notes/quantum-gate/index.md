---
{
  "title": "양자 게이트",
  "summary": "이상적인 게이트를 상태 벡터에 작용하는 유니터리 행렬로 읽습니다.",
  "params": {
    "topics": [
      "quantum-computing"
    ],
    "search_terms": [
      "quantum gate"
    ],
    "prerequisites": [
      {
        "id": "computational-basis",
        "reason": "게이트 행렬을 곱할 상태 벡터의 순서를 정합니다."
      }
    ],
    "related": [
      {
        "id": "rotation-gate",
        "reason": "회전각을 바꾸면 무엇이 달라질까?"
      },
      {
        "id": "measurement-basis",
        "reason": "같은 상태인데, 무엇을 측정하느냐에 따라 결과가 달라질까?"
      }
    ]
  }
}
---

## 상태에 적용하는 연산
상태 벡터는 준비된 상태의 표현이고, 게이트는 그 상태를 바꾸는 연산입니다. 입력을 고정한 뒤 X, Z, 하다마드를 비교해 보세요.

{{< experiment id="quantum-gate" >}}

## 길이를 보존하는 행렬
측정과 잡음을 제외한 이상적인 게이트 \(U\)는 다음 조건을 만족합니다.

$$
|\psi_{\rm out}\rangle=U|\psi_{\rm in}\rangle,\qquad U^\dagger U=I.
$$

따라서 입력의 길이가 1이면 출력도 길이가 1입니다. 복소수 성분에서는 전치뿐 아니라 복소켤레를 취하는 \(\dagger\)가 필요합니다.

$$
X=\begin{pmatrix}0&1\\1&0\end{pmatrix},\quad
Z=\begin{pmatrix}1&0\\0&-1\end{pmatrix},\quad
H_{\rm gate}=\frac1{\sqrt2}\begin{pmatrix}1&1\\1&-1\end{pmatrix}.
$$

X는 두 진폭을 맞바꾸고, Z는 두 번째 진폭의 부호를 바꿉니다. \(H_{\rm gate}|0\rangle=|+\rangle\)이고 한 번 더 적용하면 0으로 돌아옵니다. 회로의 연속된 두 게이트 \(U\), \(V\)는 \(VU|\psi\rangle\) 순서로 곱합니다.

## 헷갈리기 쉬운 H
하다마드의 H와 [해밀토니안](../hamiltonian/)의 H는 다른 역할입니다. 해밀토니안은 에르미트 조건, 게이트는 유니터리 조건을 만족합니다. X·Z처럼 둘 다인 행렬도 있지만 모든 에너지 행렬이 게이트인 것은 아닙니다. [회전 게이트](../rotation-gate/)는 각도를 연속적으로 바꾸는 예입니다.
