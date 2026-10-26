---
{
  "title": "회전 게이트와 블로흐 구",
  "summary": "회로의 회전각, 상태 진폭의 반각, 블로흐 구 좌표를 연결합니다.",
  "params": {
    "topics": [
      "quantum-computing"
    ],
    "search_terms": [
      "rotation gate"
    ],
    "prerequisites": [
      {
        "id": "quantum-gate",
        "reason": "유니터리 행렬이 정규화와 내적을 보존함을 사용합니다."
      }
    ],
    "related": [
      {
        "id": "measurement-basis",
        "reason": "같은 상태인데, 무엇을 측정하느냐에 따라 결과가 달라질까?"
      },
      {
        "id": "parameterized-circuit",
        "reason": "회전각 하나로 양자 상태를 어떻게 바꿀까?"
      }
    ]
  }
}
---

## 화면을 돌리는 것과 상태를 바꾸는 것
블로흐 구는 한 큐빗 순수상태를 표시하는 수학적 그림입니다. 전자의 실제 궤적이 아닙니다. 실험에서 회로 각도를 바꾸면 상태가 변하고, 카메라만 돌리면 측정 확률은 유지됩니다.

{{< experiment id="rotation-gate" >}}

## 왜 절반의 각도가 들어갈까
\(R_y(\theta)=\exp(-i\theta Y/2)\)의 행렬과 0 상태에 대한 작용은 다음과 같습니다.

$$
R_y(\theta)=\begin{pmatrix}\cos(\theta/2)&-\sin(\theta/2)\\\sin(\theta/2)&\cos(\theta/2)\end{pmatrix},\qquad
R_y(\theta)|0\rangle=\cos(\theta/2)|0\rangle+\sin(\theta/2)|1\rangle.
$$

블로흐 좌표는 \((\sin\theta,0,\cos\theta)\)입니다. 90°에서 진폭은 각각 \(1/\sqrt2\), 확률은 각각 1/2입니다. 180°에서 1 상태가 됩니다. 화면의 도 단위는 계산할 때 라디안으로 바꿉니다.

## 한 바퀴의 부호
360°에서 벡터는 \(-|0\rangle\)이지만 전체 부호는 [전역 위상](../superposition/)이므로 같은 물리적 상태입니다. 720°에서는 벡터 표현의 부호까지 돌아옵니다. 이 설명은 전체 큐빗에 적용한 회전을 비교합니다.

\(R_y\)만으로 도달하는 상태는 구의 한 큰 원에 놓입니다. 일반적인 복소 진폭을 만들려면 다른 축의 회전도 필요합니다. [매개변수 회로](../parameterized-circuit/)는 이런 조절 가능한 연산을 조합합니다.
