---
{
  "title": "SQD 퀵스타트 따라가기",
  "summary": "작은 N₂ 예제로 입력·표본·대각화 결과를 확인하고 무작위 표본의 한계를 이해합니다.",
  "params": {
    "topics": [
      "sqd",
      "sqd-workflow"
    ],
    "search_terms": [
      "00 quickstart"
    ],
    "prerequisites": [
      {
        "id": "intro",
        "reason": "배치와 부분공간 대각화의 역할을 이해합니다."
      }
    ],
    "related": []
  }
}
---

## 이 예제의 목표 {#overview}
양자 장비 없이 SQD API의 입력과 출력을 익힙니다. 표본은 균등 난수로 만들기 때문에 좋은 양자 회로의 성능을 보여주는 실험이 아닙니다. 문서를 읽는 데 Python 설치는 필요 없습니다. 재계산을 선택할 때만 `research/`의 환경을 사용합니다.

{{< experiment id="sqd-subspace" >}}

## 조건을 먼저 고정하기 {#prep}
N₂, 핵간 거리 **1.09768 Å**, STO-3G, 전하 0, 스핀 0, 활성 8공간 오비탈·10전자입니다. 뒤 실습의 cc-pVDZ·1.098 Å와 조건이 다릅니다. 두 결과의 에너지를 그대로 비교하지 않습니다.

```python
import numpy as np
from functools import partial
from pyscf import ao2mo, gto, mcscf, scf, fci
from qiskit_addon_sqd.counts import generate_bit_array_uniform
from qiskit_addon_sqd.fermion import (
    diagonalize_fermionic_hamiltonian, solve_sci_batch,
)

mol = gto.M(atom="N 0 0 0; N 0 0 1.09768", basis="sto-3g",
            unit="Angstrom", charge=0, spin=0)
mf = scf.RHF(mol).run()
cas = mcscf.CASCI(mf, 8, (5, 5))
hcore, ecore = cas.get_h1eff()
eri = ao2mo.restore(1, cas.get_h2eff(), 8)
bit_array = generate_bit_array_uniform(
    10_000, 16, rand_seed=np.random.default_rng(24)
)
result = diagonalize_fermionic_hamiltonian(
    hcore, eri, bit_array, samples_per_batch=20,
    norb=8, nelec=(5, 5), max_iterations=30,
    occupancies_tol=1e-7, symmetrize_spin=True,
    sci_solver=partial(solve_sci_batch, spin_sq=0.0, max_cycle=200),
    seed=np.random.default_rng(32),
)
print(result.energy + ecore)
exact = fci.direct_spin1.kernel(hcore, eri, 8, (5, 5))[0] + ecore
print(exact)
```

## 입력 네 개와 표본 {#samples}
`hcore`는 활성 공간의 유효 일전자 적분, `eri`는 이전자 적분, `norb`는 공간 오비탈 수, `nelec`는 α·β 전자 수입니다. 16비트 표본은 β 8비트 뒤에 α 8비트를 붙인 규약입니다.

균등 난수의 전자 수 통과 확률은 \(\binom85^2/2^{16}\approx4.785\%\)입니다. 보존된 실행은 약 4.97%의 샷이 통과했습니다. ‘난수 표본’은 실제 장비 잡음이 섞인 좋은 회로 분포와 다른 입력입니다.

## 결과와 옵션을 읽기 {#opts}

{{< experiment id="quickstart-results" >}}


보존된 HF 총 에너지는 약 −107.4958878 Ha, 활성 공간의 정확한 값은 −107.6525211 Ha입니다. 20개 표본·스핀 대칭화 조건의 최선 오차는 약 0.106 mHa였습니다. 시드·버전·수렴 조건이 달라지면 반복 기록이 달라질 수 있습니다.

| 옵션 | 영향을 받는 것 | 주의 |
|---|---|---|
| `samples_per_batch` | 배치마다 후보가 되는 표본 수 | 최종 행렬 차원과 같지 않음 |
| `num_batches` | 독립 공간을 푸는 횟수 | 계산 비용 증가 |
| `symmetrize_spin` | 두 스핀 문자열 집합의 대칭화 | 공간과 메모리가 커질 수 있음 |
| `max_iterations` | 복구 반복 예산 | 정확도 보장이 아님 |
| `seed` | 무작위 추출의 재현 | 버전·스레드도 함께 고정 |

`ecore`는 **핵 반발과 동결 내각의 에너지 상수**입니다. 원본 JSON의 `nuclear_repulsion_energy` 필드는 이 값을 잘못 좁게 이름 붙인 것이며, 단순 핵 반발로 해석하지 않습니다. 결과에 정확히 한 번 더합니다.

## 재현과 다음 단계 {#next}
보존된 [수치 기록](results.json)의 계산 코드는 `references/sqd-docs/scripts/p00_quickstart.py`입니다. 새 재현 진입점은 `python research/reproduce.py p00_quickstart`이며 결과는 원본과 분리됩니다. 패키지 기준은 qiskit-addon-sqd 0.14.0입니다. [공식 Quickstart](https://qiskit.github.io/qiskit-addon-sqd/guides/quickstart.html)의 API와 함께 비교할 수 있습니다.

이 작은 문제는 고전적으로도 풀립니다. 균등 표본으로 수렴한 사실만으로 큰 분자의 계산 가능성이나 양자 이득을 주장하지 않습니다. 입력을 직접 만드는 과정은 [PySCF 실습](../01-pyscf/)으로 이어집니다.
