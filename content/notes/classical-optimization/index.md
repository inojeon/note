---
{
  "title": "고전 최적화",
  "summary": "회로 매개변수에 따른 에너지 지형에서 다음 평가점을 고르는 과정을 이해합니다.",
  "params": {
    "topics": [
      "vqe"
    ],
    "search_terms": [
      "classical optimization"
    ],
    "prerequisites": [
      {
        "id": "energy-expectation",
        "reason": "최소화할 목적함수를 상태의 에너지로 정합니다."
      },
      {
        "id": "measurement-shots",
        "reason": "샷 오차가 최적화의 평가값을 흔드는 이유를 이해합니다."
      }
    ],
    "related": [
      {
        "id": "vqe-algorithm",
        "reason": "상태 준비와 에너지 측정이 어떻게 바닥상태 탐색으로 이어질까?"
      },
      {
        "id": "energy-expectation",
        "reason": "한 번의 측정값과 평균 에너지는 어떻게 다를까?"
      },
      {
        "id": "ansatz",
        "reason": "어떤 상태들을 후보로 찾아볼까?"
      }
    ]
  }
}
---

## 양자 회로 밖에서 정하는 다음 각도
최적화기는 지금까지 평가한 에너지를 바탕으로 다음 매개변수를 고릅니다. 상태를 준비하고 기대값을 평가하는 과정과, 다음 숫자를 결정하는 과정은 구별됩니다.

{{< experiment id="classical-optimization" >}}

## 1매개변수 예
\(H=aI+bX+cZ\)와 \(R_y(\theta)|0\rangle\)에서 에너지는 다음과 같습니다.

$$
E(\theta)=a+b\sin\theta+c\cos\theta,\qquad
\frac{dE}{d\theta}=b\cos\theta-c\sin\theta.
$$

경사 하강은 \(\theta_{k+1}=\theta_k-\eta E'(\theta_k)\)로 이동합니다. 보폭 \(\eta\)가 크면 최저점을 지나 흔들릴 수 있습니다. 이 예의 전역 최솟값은 \(a-\sqrt{b^2+c^2}\)라서 수치 결과를 검증하기 좋습니다.

## 실제 회로에서는
매개변수가 많으면 지형이 복잡하고 국소 최솟값이나 평평한 영역이 생깁니다. 샷 오차로 함수 값과 기울기 추정도 흔들립니다. 에너지 변화가 작다는 조건만으로 정확한 바닥상태에 도달했다고 결론내리면 안 됩니다.

평가 횟수, 종료 이유, 여러 시작점, [안사츠](../ansatz/)의 표현 범위와 오차를 함께 기록합니다. 최적화가 멈춘 것과 문제를 정확히 푼 것은 다른 주장입니다.
