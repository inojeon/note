---
{
  "title": "UCJ 회로 안쪽: 층과 매개변수",
  "summary": "궤도 회전·점유 상호작용·CCSD 초기값을 나누어 UCJ와 LUCJ를 읽습니다.",
  "params": {
    "topics": [
      "vqe",
      "sqd-workflow"
    ],
    "search_terms": [
      "03 ucj inside"
    ],
    "prerequisites": [
      {
        "id": "ansatz",
        "reason": "표현 가능한 상태와 최적화를 구별합니다."
      }
    ],
    "related": []
  }
}
---

## 무엇을 조절하는 회로인가 {#overview}
UCJ(Unitary Cluster Jastrow)는 분자 상태를 준비하는 [안사츠](../ansatz/)입니다. 기준 배치에서 출발해 오비탈 회전과 점유에 따른 위상을 반복 적용합니다. 회로의 초기값을 정하는 것과 에너지를 최소화하는 것은 별도 과정입니다.

{{< experiment id="parameterized-circuit" >}}

위 한 큐빗 실험은 매개변수의 역할을 보여주는 단순 예입니다. 아래 N₂ UCJ는 16큐빗의 여러 전자 회로입니다.

## 오비탈 회전과 대각 점유 상호작용 {#layers}
오비탈 회전은 생성 연산자를 새 선형결합으로 바꿉니다. 일전자 공간의 회전이지만 여러 전자 상태에 유도된 유니터리로 작용합니다. 한 층은 회전한 기저에서 점유-점유 위상을 주고 되돌리는 구조로 이해할 수 있습니다.

$$
U_\ell=R_\ell^\dagger\exp\left(i\sum_{p,q,\sigma,\tau}J^{\sigma\tau}_{pq}\,n_{p\sigma}n_{q\tau}\right)R_\ell.
$$

이는 층의 개념식이며 계수 대칭·중복 합의 정규화는 구현의 규약을 따릅니다. 대각 위상층 자체는 그 기저에서 점유 확률을 바꾸지 않지만, 앞뒤 회전과 결합하면 최종 진폭이 달라집니다.

## CCSD t₂에서 초기값으로 {#t2}
보존된 예제는 N₂ cc-pVDZ, 1.098 Å, 활성 MO 2~9에서 CCSD 이중 들뜸 진폭을 구하고 이를 UCJ 초기값으로 분해합니다.

```python
import ffsim
# mf는 앞의 PySCF 실습에서 계산한 RHF 결과
md = ffsim.MolecularData.from_scf(mf, active_space=range(2, 10))
md.run_ccsd(store_t2=True)
op = ffsim.UCJOpSpinBalanced.from_t_amplitudes(md.ccsd_t2, n_reps=1)
parameters = op.to_parameters()
```

이 변환은 CCSD 파동함수나 에너지를 정확히 복제한다는 보장이 아닙니다. 이 예에서 CCSD 총 에너지는 약 −109.03279844 Ha지만 1층 UCJ 초기 상태는 −108.98490805 Ha입니다.

## 층 수와 연결 제한 {#reps}

{{< experiment id="ucj-layers" >}}


| 회로 | 층 수 | 초기 매개변수 수 | CASCI 대비 초기 오차 |
|---|---:|---:|---:|
| UCJ | 1 | 136 | 49.499 mHa |
| UCJ | 2 | 272 | 53.263 mHa |
| LUCJ | 1 | 73 | 69.942 mHa |
| LUCJ | 2 | 146 | 62.238 mHa |

LUCJ는 점유 상호작용의 연결을 제한합니다. 이 자료의 제한은 같은 스핀의 인접 오비탈 쌍과 일부 서로 다른 스핀 쌍이며, 모든 장비에 대한 보편적인 최적 연결은 아닙니다. 층이 두 배여도 이 초기화 규칙의 에너지가 반드시 더 낮지는 않습니다. 최적화 후 도달 가능한 최저점과 초기점을 구별하세요.

## 최적화와 기록의 범위 {#opt}
`p03_ucj_inside.py --optimize`는 L-BFGS-B로 최대 60회 반복하는 추가 실험입니다. 현재 [보존된 자료](results.json)에는 초기 상태 값만 있으므로 최적화가 완료된 결과처럼 제시하지 않습니다. 이 계산은 고전 시뮬레이터의 정확한 기대값을 사용하며 샷 잡음이나 실기기의 게이트 오류는 포함하지 않습니다.

원본은 `scripts/p03_ucj_inside.py`, ffsim 0.0.84입니다. [ffsim LUCJ 설명](https://qiskit-community.github.io/ffsim/explanations/lucj.html)에서 층의 연산 규약을 확인할 수 있습니다. 실제 게이트로 만드는 단계는 [상태 준비 회로 실습](../04-circuit/)입니다.
