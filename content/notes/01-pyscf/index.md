---
{
  "title": "PySCF로 SQD 입력 만들기",
  "summary": "분자·기저·HF·활성 공간에서 SQD의 적분과 에너지 상수를 만듭니다.",
  "params": {
    "topics": [
      "quantum-chemistry",
      "sqd-workflow"
    ],
    "search_terms": [
      "01 pyscf"
    ],
    "prerequisites": [
      {
        "id": "00-quickstart",
        "reason": "같은 계산의 조건과 입력·출력을 이어 사용합니다."
      }
    ],
    "related": []
  }
}
---

## 이 계산에서 확인할 것

N₂라는 이름만으로 에너지 계산이 하나로 정해지지는 않습니다. 핵 사이 거리, 오비탈을 표현할 함수, 움직일 전자를 함께 정해야 합니다. 이 노트는 그 선택이 SQD 입력 `hcore`, `eri`, `ecore`로 이어지는 과정을 다룹니다.

질소 원자 하나의 전자는 7개이므로 중성 N₂에는 14개가 있습니다. 그중 핵 가까운 두 공간 오비탈을 항상 두 전자로 채워 고정하면 4전자가 동결되고, 움직이는 전자는 \(14-4=10\)개입니다. 이 10전자를 8개 활성 공간 오비탈에서 다룹니다. 실험에서 전자 수·오비탈 수를 바꿀 때 둘이 다른 양임을 확인할 수 있습니다.


## 분자를 먼저 숫자로 정한다 {#mol}
주 예제는 N₂, 거리 **1.098 Å**, cc-pVDZ, 중성·닫힌 껍질입니다. 14전자 중 내각 4전자를 동결하고 8공간 오비탈에 α·β 각각 5전자를 둡니다. 원자 단위 에너지는 Ha, 좌표는 Å를 사용합니다.

{{< experiment id="active-space" >}}

## 기저 세트와 HF가 정하는 것 {#basis}
[기저 세트](../basis-set/)는 오비탈을 표현할 함수의 재료입니다. 같은 N₂에서도 STO-3G는 10, 6-31G는 18, cc-pVDZ는 28개의 공간 기저 함수를 사용한 기록이 있습니다. 기저를 늘려도 전자 수는 14개입니다.

[HF](../hartree-fock/)는 이 함수들의 계수를 자기일관적으로 정해 분자 오비탈을 얻습니다. 오비탈 에너지를 모두 더한 값이 HF 총 에너지는 아닙니다. SCF 수렴과 원하는 전자·스핀 상태를 확인해야 합니다.

## 활성 공간과 적분 생성 {#cas}
```python
from pyscf import gto, scf, mcscf, ao2mo

mol = gto.M(atom="N 0 0 0; N 0 0 1.098", basis="cc-pvdz",
            unit="Angstrom", charge=0, spin=0)
mf = scf.RHF(mol).run()
assert mf.converged
norb, nelec = 8, (5, 5)
cas = mcscf.CASCI(mf, norb, nelec)
hcore, ecore = cas.get_h1eff()
eri = ao2mo.restore(1, cas.get_h2eff(), norb)
e_casci = cas.kernel()[0]
```

여기서는 기본 HF 오비탈 순서에서 내각 두 공간 오비탈을 제외하고 0부터 센 MO 2~9를 활성으로 삼습니다. 실제 새 분자에는 번호만 복사하지 말고 오비탈의 모양과 점유를 검토해야 합니다. CASCI는 오비탈을 고정하고 CI 계수를 풀며, CASSCF는 오비탈도 최적화합니다.

| 값 | 크기 | 의미 |
|---|---|---|
| `hcore` | 8×8 | 동결 내각의 효과를 포함한 유효 일전자 적분 |
| `eri` | 8×8×8×8 | 활성 오비탈의 이전자 적분 |
| `ecore` | 스칼라 | 핵 반발과 동결 내각의 상수 에너지 |
| `norb`, `nelec` | 8, (5,5) | 공간 크기와 스핀별 전자 수 |

## 적분과 배치 행렬은 다르다 {#ints}
8×8 `hcore`가 3136배치의 해밀토니안 자체는 아닙니다. [전자 적분](../electron-integrals/)을 이용해 배치 사이의 원소를 계산하거나, 행렬 전체를 저장하지 않고 벡터에 작용시킵니다. 텐서의 인덱스 순서와 화학자·물리학자 표기를 라이브러리 사이에서 확인해야 합니다.

총 에너지는 활성 전자 문제의 에너지에 `ecore`를 더합니다. 보존된 값은 `ecore ≈ −77.41742269 Ha`, HF 약 −108.95408661 Ha, CASCI 약 −109.03440704 Ha입니다. 음수 `ecore`를 양의 핵 반발만으로 해석하면 틀립니다.

## 작은 문제로 검증하기 {#validation}

{{< experiment id="n2-preparation" >}}


```python
from pyscf import fci
active_energy = fci.direct_spin1.kernel(hcore, eri, norb, nelec)[0]
assert abs(active_energy + ecore - e_casci) < 1e-7
```

이는 선택한 활성 공간과 오비탈이 같은지 확인하는 검사입니다. 전체 cc-pVDZ 기저의 FCI를 검증하는 것은 아닙니다. 결합을 늘리면 HF와 CASCI 차이가 커지는 기록이 있지만, 활성 공간 선택의 정확성도 다시 확인해야 합니다.

[수치 자료](results.json), 재현 원본 `scripts/p01_pyscf_n2.py`, [PySCF CASCI/CASSCF 설명](https://pyscf.org/user/mcscf.html)을 함께 읽을 수 있습니다. 다음은 같은 전자 연산을 큐빗으로 옮기는 [Jordan–Wigner](../02-jordan-wigner/)입니다.


## 계산과 해석 확인

**1. 총 에너지가 −109.03440704 Ha이고 ecore가 −77.41742269 Ha이면 활성 전자 부분의 에너지는 얼마인가요?**

{{< answer >}}
총 에너지는 활성 에너지에 ecore를 더한 값이므로, 활성 부분은 \(-109.03440704-(-77.41742269)=-31.61698435\) Ha입니다. 이미 총 에너지를 반환한 값에 ecore를 다시 더하면 중복 계산입니다.
{{< /answer >}}

**2. hcore가 8×8인데 배치 공간이 3136차원이 될 수 있나요?**

{{< answer >}}
네. hcore의 두 인덱스는 한 전자가 사용하는 공간 오비탈을 가리킵니다. 여러 전자의 배치는 각 스핀에서 8개 중 5개를 고르는 조합이므로 \(\binom85^2=3136\)개입니다. 일전자 적분과 여러 전자 배치 사이의 행렬은 다른 대상입니다.
{{< /answer >}}
