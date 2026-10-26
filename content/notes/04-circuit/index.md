---
{
  "title": "양자 회로: 근사 바닥상태 만들기",
  "summary": "HF와 UCJ를 회로로 연결하고 회로 비용·표본·SQD 에너지를 함께 평가합니다.",
  "params": {
    "topics": [
      "quantum-computing",
      "sqd-workflow"
    ],
    "search_terms": [
      "04 circuit"
    ],
    "prerequisites": [
      {
        "id": "03-ucj-inside",
        "reason": "회로에 넣는 UCJ 연산의 출처를 사용합니다."
      }
    ],
    "related": []
  }
}
---

## 회로의 두 역할 {#overview}
먼저 고전적으로 정한 HF 배치를 준비하고, 이어서 UCJ 연산으로 다른 배치에 진폭을 줍니다. 측정한 비트열을 SQD에 전달하면 표본이 선택한 공간 안에서 에너지를 다시 계산합니다.

{{< experiment id="sqd-state-circuit" >}}

위 회로는 두 배치의 준비를 설명하는 축소 예입니다. 아래 UCJ는 다른 연산과 전체 활성 공간을 사용합니다.

## Qiskit 회로로 구성하기 {#circuit}
[PySCF 입력](../01-pyscf/)과 [UCJ 초기화](../03-ucj-inside/)의 `mf`, `hcore`, `eri`, `ecore`, `op`를 사용합니다.

```python
import ffsim
from qiskit import QuantumCircuit, QuantumRegister, transpile
from qiskit.primitives import StatevectorSampler
from qiskit_addon_sqd.fermion import diagonalize_fermionic_hamiltonian

norb, nelec = 8, (5, 5)
q = QuantumRegister(2 * norb)
circuit = QuantumCircuit(q)
circuit.append(ffsim.qiskit.PrepareHartreeFockJW(norb, nelec), q)
circuit.append(ffsim.qiskit.UCJOpSpinBalancedJW(op), q)
circuit.measure_all()
bit_array = StatevectorSampler(seed=1).run(
    [circuit], shots=10_000
).result()[0].data.meas
result = diagonalize_fermionic_hamiltonian(
    hcore, eri, bit_array, norb=norb, nelec=nelec,
    samples_per_batch=min(len(bit_array.get_counts()), 200),
    num_batches=3, max_iterations=5, seed=1,
)
print(result.energy + ecore)
```

측정 레지스터 이름 `meas`는 `measure_all()`이 만든 이름입니다. 다른 이름으로 회로를 작성하면 결과 접근도 맞춰 바꿔야 합니다. `StatevectorSampler`는 이상적 고전 시뮬레이션으로 실제 양자 장비 실행이 아닙니다.

## 회로 비용 비교 {#cost}

{{< experiment id="ucj-layers" >}}


보존된 1층 회로를 `cz, rz, sx, x` 기저 게이트, 최적화 수준 1로 변환했을 때 UCJ 깊이는 307, CZ 수는 312이고 LUCJ는 깊이 166, CZ 수 198입니다. 이 숫자는 특정 실기기의 결합 지도·오류율·스케줄을 반영한 성능 지표가 아닙니다. 장치에 맞춘 라우팅은 비용을 추가할 수 있습니다.

## 표본의 질이 결과에 미치는 영향 {#state}
| 회로 | 샷 | 고유 배치 | SQD의 CASCI 대비 오차 |
|---|---:|---:|---:|
| UCJ 1층 | 10,000 | 10 | 46.564 mHa |
| UCJ 1층 | 100,000 | 22 | 13.111 mHa |
| LUCJ 1층 | 10,000 | 6 | 54.118 mHa |
| LUCJ 1층 | 100,000 | 12 | 39.595 mHa |

이 수치는 CCSD에서 초기화만 한 회로입니다. 깊이가 짧다는 이유로 에너지가 더 정확하지 않고, 겹침이 높아도 중요한 꼬리 배치가 거의 안 나오면 SQD 정확도에 영향을 줍니다. 샷 증가의 효과도 회로가 부여한 확률에 한정됩니다.

## 무엇을 같은 조건으로 비교할까 {#conditions}
분자 거리 1.098 Å, cc-pVDZ, 활성 공간 8·(5,5), 핵·내각 상수 포함 총 에너지, 시드 1이 조건입니다. [계산 기록](results.json)은 `scripts/p04_circuit.py`에서 얻었고 최적화된 회로나 하드웨어 결과로 해석하지 않습니다. [샘플링 실습](../05-sampling/)은 표본 자체의 통계와 잡음을 분리해 설명합니다.
