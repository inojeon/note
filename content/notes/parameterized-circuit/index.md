---
{
  "title": "매개변수 양자 회로",
  "summary": "회로 구조는 고정하고 각도 값을 바꿔 상태를 준비하는 과정을 읽습니다.",
  "params": {
    "topics": [
      "vqe"
    ],
    "search_terms": [
      "parameterized circuit"
    ],
    "prerequisites": [
      {
        "id": "ansatz",
        "reason": "선택한 상태 가족을 각도가 있는 회로로 구현합니다."
      },
      {
        "id": "rotation-gate",
        "reason": "회전각을 바꾸었을 때 진폭과 위상이 변하는 규칙을 사용합니다."
      }
    ],
    "related": [
      {
        "id": "pauli-decomposition",
        "reason": "에너지를 양자컴퓨터에서 측정하기 쉬운 항으로 나누려면?"
      },
      {
        "id": "superposition",
        "reason": "확률은 같은데, 다른 측정에서 결과가 달라질 수 있을까?"
      },
      {
        "id": "vqe-algorithm",
        "reason": "상태 준비와 에너지 측정이 어떻게 바닥상태 탐색으로 이어질까?"
      }
    ]
  }
}
---

## 구조와 숫자를 나누기
매개변수 회로는 게이트 종류·연결 순서를 정해 두고 회전각 같은 숫자를 바꾸는 회로입니다. \(\theta\)를 바꾸면 준비 상태가 변하고 측정 확률도 달라집니다.

{{< experiment id="parameterized-circuit" >}}

## 회로의 순서가 식의 순서다
\(|0\rangle\)에 \(R_y(\theta)\)를 적용한 후 \(R_z(\phi)\)를 적용하면 전역 위상을 제외하고 다음 상태를 얻습니다.

$$
|\psi(\theta,\phi)\rangle=\cos(\theta/2)|0\rangle+e^{i\phi}\sin(\theta/2)|1\rangle.
$$

계산 기저 확률은 \(\phi\)와 무관하지만 X·Y 기대값은 달라집니다. 측정 확률 하나가 변하지 않는다고 상태가 변하지 않았다고 판단하면 안 됩니다.

## 한 번의 평가
매개변수를 대입하고, 초기 상태를 다시 준비하고, 회로를 실행하고, 측정합니다. 다른 측정 설정이나 샷에는 같은 매개변수의 상태를 다시 준비합니다. 슬라이더 조작은 같은 물리적 큐빗에 계속 게이트를 누적한다는 뜻이 아닙니다.

회로는 [안사츠](../ansatz/)를 구현하며, 그 숫자를 조정하는 정책은 [고전 최적화](../classical-optimization/)가 정합니다. 상태를 바꾸는 각도와 그림을 보는 카메라 각도도 별개입니다.
