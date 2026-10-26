---
{
  "title": "계산 기저 측정과 에너지 측정",
  "summary": "비트열을 읽는 일과 에너지 고유값을 측정하거나 기대값을 추정하는 일을 구별합니다.",
  "params": {
    "topics": [
      "quantum-computing"
    ],
    "search_terms": [
      "energy measurement"
    ],
    "prerequisites": [
      {
        "id": "measurement-basis",
        "reason": "에너지 고유기저와 계산 기저의 측정을 구별합니다."
      },
      {
        "id": "hamiltonian",
        "reason": "에너지 연산자의 고유값과 기대값을 비교합니다."
      }
    ],
    "related": [
      {
        "id": "tensor-product",
        "reason": "두 큐빗을 함께 보면,각각의 결과를 짝지은 네 가지가 기준이 됩니다."
      },
      {
        "id": "rotation-gate",
        "reason": "회전각을 바꾸면 무엇이 달라질까?"
      },
      {
        "id": "energy-expectation",
        "reason": "한 번의 측정값과 평균 에너지는 어떻게 다를까?"
      }
    ]
  }
}
---

## 비트에는 에너지가 적혀 있지 않다
계산 기저 측정으로 얻은 0·1은 상태 이름입니다. 그것을 에너지로 해석하려면 어떤 [해밀토니안](../hamiltonian/)을 측정하는지 알아야 합니다.

{{< experiment id="energy-measurement" >}}

## 에너지 측정의 수학적 뜻
\(H|E_j\rangle=E_j|E_j\rangle\)일 때 에너지 측정은 고유값 \(E_j\)를 반환합니다. 비축퇴 경우의 확률은 \(|\langle E_j|\psi\rangle|^2\)이고, 축퇴하면 같은 에너지의 고유공간에 대한 확률을 합합니다.

$$
\langle H\rangle=\sum_j E_j\,|\langle E_j|\psi\rangle|^2.
$$

설명용 \(H=X\)에서 0 상태를 준비하면 에너지 +1과 −1이 반반이고 평균은 0입니다. 0은 이 H의 고유값이 아닙니다. 따라서 기대값은 단일 측정에서 가능한 결과일 필요가 없습니다.

## VQE와 SQD에서 쓰는 방법
[VQE](../vqe-algorithm/)는 H를 여러 [파울리 항](../pauli-decomposition/)으로 나눠 각 평균을 측정합니다. 각 실험은 서로 다른 기저 설정과 반복 준비가 필요할 수 있습니다.

[SQD](../sqd-subspace/)는 점유 비트열로 배치 후보를 모으고, 전자 적분으로 구성한 작은 행렬을 고전적으로 대각화합니다. 계산 기저의 빈도만으로 에너지나 상대 위상을 모두 복원하는 과정은 아닙니다.
