---
{
  "title": "VQE 전체 알고리즘",
  "summary": "상태 준비·기대값 측정·고전 최적화를 연결해 변분 에너지를 낮춥니다.",
  "params": {
    "topics": [
      "vqe"
    ],
    "search_terms": [
      "vqe algorithm"
    ],
    "prerequisites": [
      {
        "id": "classical-optimization",
        "reason": "에너지 평가와 다음 매개변수 선택을 하나의 반복으로 연결합니다."
      },
      {
        "id": "parameterized-circuit",
        "reason": "매 반복에서 준비할 상태를 회로로 표현합니다."
      }
    ],
    "related": [
      {
        "id": "vqe-hydrogen",
        "reason": "실제 분자의 에너지도 회전각을 바꿔 가며 낮출 수 있을까?"
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

## 한 번의 반복을 따라가기
VQE는 Variational Quantum Eigensolver입니다. [안사츠](../ansatz/)의 매개변수를 바꾸며 같은 해밀토니안의 기대값을 낮춥니다.

{{< experiment id="vqe-algorithm" >}}

1. 분자 구조·기저·활성 공간에서 해밀토니안을 정합니다.
2. 기준 상태와 매개변수 회로로 시험 상태를 준비합니다.
3. [파울리 항](../pauli-decomposition/)을 여러 설정에서 반복 측정해 에너지를 추정합니다.
4. 고전 최적화기가 매개변수를 갱신합니다.
5. 평가 예산이나 수렴 조건에 도달하면 결과와 불확실성을 보고합니다.

$$
E_{\rm VQE}=\min_{\boldsymbol\theta}\langle\psi(\boldsymbol\theta)|H|\psi(\boldsymbol\theta)\rangle\ge E_0.
$$

위 식은 정확한 기대값과 해당 상태 가족 안의 전역 최소에 대한 관계입니다. 실행에서 반환한 값에는 최적화 실패·샷 오차·장비 잡음이 더해질 수 있습니다.

## 무엇을 검증할까
작은 문제는 고전 대각화 결과와 비교합니다. 전자 수, 에너지 단위, 핵 반발 상수 포함 여부를 같게 맞춰야 합니다. 최종 에너지가 낮다는 사실만으로 회로가 전체 참 상태와 가깝다고 단정할 수는 없으며, 에너지 간격도 관련됩니다.

## SQD와의 차이
[SQD](../sqd-subspace/)는 표본에서 배치 공간을 선택하고 그 안의 계수를 고전 대각화로 다시 구합니다. VQE는 준비한 상태의 기대값을 직접 최적화합니다. 둘은 상태 준비를 공유할 수 있지만 측정값을 사용하는 방식이 다릅니다.
