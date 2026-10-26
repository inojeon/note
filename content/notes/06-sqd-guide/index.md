---
{
  "title": "SQD 이해하기: 복구와 부분공간 반복",
  "summary": "원본 표본에서 전자 수 복구·곱 공간·대각화·수렴까지 추적합니다.",
  "params": {
    "topics": [
      "sqd",
      "sqd-workflow"
    ],
    "search_terms": [
      "06 sqd guide"
    ],
    "prerequisites": [
      {
        "id": "05-sampling",
        "reason": "BitArray와 표본의 출처를 사용합니다."
      },
      {
        "id": "sqd-subspace",
        "reason": "투영과 대각화의 역할을 사용합니다."
      }
    ],
    "related": []
  }
}
---

## 표본을 계수로 그대로 쓰지 않는다 {#why}
SQD는 양자 측정의 배치 후보와 고전 전자 적분을 결합합니다. 표본 빈도를 최종 파동함수의 계수로 고정하지 않고, 선택 공간 안에서 에너지가 낮은 계수를 새로 풉니다.

{{< experiment id="sqd-subspace" >}}

## 이 기록의 입력 {#input}
N₂ cc-pVDZ, 1.098 Å, 활성 8오비탈·(5,5)의 정확한 CASCI 분포에서 20,000샷을 고전적으로 뽑고, 비트마다 독립적으로 3% 뒤집힘을 넣었습니다. 난수 시드는 1입니다. 실제 장비나 근사 UCJ 회로의 실험 결과가 아닙니다.

원본 643종의 비트열 중 각 절반에 1이 5개인 것은 107종입니다. 표본 종류의 비율과 샷의 통과 비율은 다른 값입니다. 알고리즘은 원본을 보존하고 점유도 추정이 생긴 뒤 그 원본에 복구를 적용합니다.

## 각 모듈이 하는 일 {#map}
| 구성 | 입력 → 출력 |
|---|---|
| `counts` | BitArray → 고유 비트열과 확률 |
| `subsampling` | 전자 수 후선별, 확률 가중 표본 묶음 |
| `configuration_recovery` | 비트열·점유도 → 유효한 배치 후보 |
| `fermion` | 배치와 적분 → 에너지·상태·점유도 |
| `StandardPolicy`, `TrimPolicy` | 반복 안에서 공간을 만들고 결과를 고르는 일정 |
| `processes` | 사용 가능한 경우 프로세스 간 계산 분배 |
| `qubit` | 일반 큐빗 해밀토니안의 별도 투영 경로 |

공개 진입점은 `fermion.diagonalize_fermionic_hamiltonian`입니다. 문서의 실행 기준 버전은 0.14.0입니다.

## 후선별과 구성 복구 {#recover}

{{< experiment id="configuration-recovery" >}}


초기 점유도가 없을 때는 전자 수 조건으로 후선별합니다. 대각화 후 각 오비탈의 평균 점유도를 구하면, 전자가 부족한 문자열은 점유 가능성이 큰 0을 1로, 과한 문자열은 점유 가능성이 작은 1을 0으로 바꾸는 후보를 확률적으로 만듭니다.

점유도는 단순한 정답 비트가 아니라 \(\langle n_{p\sigma}\rangle\)입니다. 복구의 확률 함수에는 충전 비율과 규제 매개변수도 포함되므로 점유도 자체를 그대로 뒤집힘 확률이라고 단정하지 않습니다. 보존된 예에서 유효 후보는 107종에서 176종으로 늘었습니다. 이것이 잘못된 측정의 실제 원인을 알아내거나 참 상태를 복원했다는 뜻은 아닙니다.

## 표본 50개가 행렬 50차원은 아니다 {#subspace}
분자용 solver는 선택한 표본을 α·β 문자열 집합 \(S_\alpha,S_\beta\)로 나누고 그 데카르트 곱을 사용합니다.

$$
\mathcal S=\operatorname{span}\{|D_{a,b}\rangle:a\in S_\alpha,b\in S_\beta\},\qquad
\dim\mathcal S=|S_\alpha|\,|S_\beta|.
$$

예제의 한 50표본 묶음은 α 17종, β 16종을 만들어 272차원이 되었습니다. 실제로 측정하지 않은 조합도 공간에 들어갑니다. 이월(carryover)은 중요한 문자열을 보존하고, 스핀 대칭화는 두 집합을 맞추며, `max_dim`은 각 스핀의 문자열 수를 제한합니다. 전체 차원은 두 수의 곱이므로 메모리를 따로 확인해야 합니다.

## 대각화와 반복 기록 {#diag}
```python
from qiskit_addon_sqd.fermion import diagonalize_fermionic_hamiltonian
result = diagonalize_fermionic_hamiltonian(
    hcore, eri, bit_array, samples_per_batch=50,
    norb=8, nelec=(5, 5), num_batches=3, max_iterations=8,
    seed=1, callback=lambda results: print([r.energy for r in results]),
)
total_energy = result.energy + ecore
occ_alpha, occ_beta = result.orbital_occupancies
```

`hcore`, `eri`, `ecore`와 `bit_array`는 앞 실습에서 준비한 같은 분자·같은 순서의 입력입니다. 기본 solver의 `result.sci_state.amplitudes`는 \(|S_\alpha|\times|S_\beta|\) 배열이며 계수의 부호 규약도 중요합니다. 각 오비탈 점유도는 각 배치의 절댓값 제곱을 그 배치의 0·1 점유로 가중하여 합합니다. 단순 행·열 합은 스핀 문자열의 주변 확률입니다.

| 반복 | 최선 배치 공간 | 총 에너지 | CASCI 대비 |
|---:|---:|---:|---:|
| 0 | 17×16 | −109.03036293 Ha | 4.044 mHa |
| 1 | 20×19 | −109.03194895 Ha | 2.458 mHa |
| 3 | 21×22 | −109.03243944 Ha | 1.968 mHa |
| 5 | 25×25 | −109.03286547 Ha | 1.542 mHa |
| 7 | 26×28 | −109.03296401 Ha | 1.443 mHa |

이 표는 보존된 실행 결과입니다. 매 반복 공간이 포함 관계로 커진다는 보장은 없고, 실행마다 모든 에너지가 단조 감소하는 것도 아닙니다. 알고리즘은 지금까지의 최선 결과를 보관합니다. 에너지와 점유도 변화의 수렴 기준이 작아도 선택 공간 밖의 오차가 작다는 증명은 아닙니다.

{{< experiment id="sqd-iterations" >}}

## Standard와 Trim {#policy}
기본 Standard 방식은 여러 묶음의 공간을 각각 풀어 좋은 결과를 고릅니다. Trim 방식은 각 공간의 중요한 문자열을 추려 합친 공간을 다시 풉니다. 선택 전략이 바뀌면 비용과 공간 크기가 달라지므로 같은 계산 예산으로 비교해야 합니다. 위 표는 기본 정책 실행이며 Trim 성능 비교표가 아닙니다.

## 재현과 해석 범위 {#scope}
[전체 반복 데이터](results.json)는 `scripts/p06_sqd_guide.py`의 출력입니다. `python research/reproduce.py p06_sqd_guide`로 별도 결과 폴더에 재생성할 수 있습니다. [공식 API](https://qiskit.github.io/qiskit-addon-sqd/apidocs/qiskit_addon_sqd.fermion.html)에서 버전에 맞는 옵션을 확인합니다.

이 예는 3136차원의 작은 참조 문제라 고전 정답을 알고 검증합니다. 더 큰 문제에서는 샷·공간 크기·활성 공간·여러 시드에 대한 안정성을 함께 보고해야 합니다. 최종 상태는 고전 계수와 배치 목록이며 그 상태를 양자 장비에 다시 준비했다는 뜻은 아닙니다.
