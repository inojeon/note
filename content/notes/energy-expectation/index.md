---
{
  "title": "에너지 기대값",
  "summary": "상태의 진폭과 해밀토니안을 함께 사용해 평균 에너지를 계산합니다.",
  "params": {
    "topics": [
      "vqe"
    ],
    "search_terms": [
      "energy expectation"
    ],
    "prerequisites": [
      {
        "id": "hamiltonian",
        "reason": "상태의 에너지를 나타내는 행렬을 사용합니다."
      },
      {
        "id": "born-rule",
        "reason": "에너지 측정의 확률 가중 평균을 해석합니다."
      }
    ],
    "related": [
      {
        "id": "energy-measurement",
        "reason": "0·1을 읽는 것과 에너지를 읽는 것은 어떻게 다를까?"
      },
      {
        "id": "variational-principle",
        "reason": "어떤 상태의 에너지를 낮추면 정확한 바닥상태에 가까워질까?"
      },
      {
        "id": "pauli-decomposition",
        "reason": "에너지를 양자컴퓨터에서 측정하기 쉬운 항으로 나누려면?"
      }
    ]
  }
}
---

## 평균이 낮은 상태 찾기
에너지 기대값은 같은 상태를 매번 준비해 에너지를 측정했을 때의 평균입니다. 단일 측정 결과나 가장 자주 나온 비트열의 에너지와 다릅니다.

{{< experiment id="energy-expectation" >}}

## 대각 원소 밖에도 에너지가 있다
정규화된 좌표 \(c\)에서 기대값은 \(c^\dagger Hc\)입니다. 실수 대칭 2×2 H와 \(c=(\cos t,\sin t)^T\)라면 다음과 같습니다.

$$
E(t)=H_{00}\cos^2t+H_{11}\sin^2t+2H_{01}\sin t\cos t.
$$

마지막 항은 두 진폭 사이의 간섭입니다. 확률 \(\cos^2t,\sin^2t\)만 알아서는 부호와 상대 위상에 따른 이 항을 결정할 수 없습니다. \(H_{01}>0\)이면 두 진폭의 부호가 반대일 때 이 항은 음수입니다.

## 변분 원리와 연결
[변분 원리](../variational-principle/)에 따라 같은 H의 모든 정규화 상태에서 \(E\ge E_0\)입니다. 하지만 유한 샷으로 추정한 값은 통계 오차로 \(E_0\) 아래에 보일 수도 있습니다. 이론적 기대값과 추정량을 구별해야 합니다.

[VQE](../vqe-algorithm/)는 매개변수에 따른 이 기대값을 최소화합니다. 최소화할 때마다 H를 바꾸는 것이 아니라 상태를 바꿉니다.
