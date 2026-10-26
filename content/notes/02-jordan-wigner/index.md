---
{
  "title": "궤도를 큐빗으로: Jordan–Wigner",
  "summary": "점유수 인코딩·Z 사슬·파울리 문자열을 실제 N₂ 변환과 연결합니다.",
  "params": {
    "topics": [
      "quantum-computing",
      "sqd-workflow"
    ],
    "search_terms": [
      "02 jordan wigner"
    ],
    "prerequisites": [
      {
        "id": "01-pyscf",
        "reason": "앞에서 익힌 상태·배치·계산을 이 예제에 적용합니다."
      }
    ],
    "related": []
  }
}
---

## 이 계산에서 확인할 것

전자 배치를 0과 1로 적는 것만으로 전자 연산의 변환이 끝나지는 않습니다. 빈 자리에 전자를 넣을 때, 앞에 놓인 전자 수에 따라 부호가 달라져야 합니다. 이 노트에서는 그 부호를 읽는 순서를 고정하고 실제 계산의 비트 규약과 연결합니다.

작은 예로 오비탈을 0, 1, 2, 3 순서로 나열하고 점유를 (1,0,0,0)이라 하겠습니다. 오비탈 2에 전자를 만들려면 그보다 앞선 자리의 점유 합은 1입니다. 부호는 \((-1)^1=-1\)입니다. (1,1,0,0)에서는 앞선 전자가 2개라 부호가 +1입니다. 뒤의 짝홀 실험에서 이 두 입력을 비교합니다.


## 비트와 궤도의 대응부터 {#occ}
8공간 오비탈에는 16스핀 오비탈이 있습니다. 직접 JW 매핑은 16큐빗을 사용합니다. 여기서는 q₀~q₇이 α, q₈~q₁₅가 β이며 문자열은 큰 큐빗 번호부터 표시합니다.

{{< experiment id="fermion-qubit" >}}

따라서 출력 문자열의 오른쪽 8비트가 α입니다. `00011111|00011111`은 α·β 각각 오비탈 0~4를 점유한 기준 배치입니다. 구분선은 사람이 읽기 위한 것이고 API 입력에서는 제거합니다.

## 생성 연산자가 부호를 기억해야 하는 이유 {#sign}
전자 연산자는 \(a_pa_q^\dagger+a_q^\dagger a_p=\delta_{pq}\)를 만족합니다. 큐빗의 비트만 뒤집으면 서로 다른 오비탈에서 이 부호가 보존되지 않습니다.

$$
a_p^\dagger=\left(\prod_{j<p}Z_j\right)\frac{X_p-iY_p}{2},\qquad
 a_p=\left(\prod_{j<p}Z_j\right)\frac{X_p+iY_p}{2}.
$$

Z 사슬은 앞쪽 점유수의 짝홀에 따라 ±1을 줍니다. 이는 부가적인 전자나 확률이 아니라 반대칭을 유지하는 부호입니다. 생성 연산자 단독은 유니터리 게이트가 아닙니다.

## 연산자 하나를 확인하기 {#operator}

{{< experiment id="jordan-wigner-parity" >}}


```python
from qiskit_nature.second_q.operators import FermionicOp
from qiskit_nature.second_q.mappers import JordanWignerMapper

hop = FermionicOp({"+_2 -_0": 1.0}, num_spin_orbitals=4)
print(JordanWignerMapper().map(hop))
```

이 예는 오비탈 0에서 없애고 2에 만드는 항입니다. 물리적인 에르미트 hopping 해밀토니안에는 보통 켤레전치 항도 함께 들어갑니다. 출력의 Pauli 문자열은 왼쪽이 큐빗 3이며 이 순서를 거꾸로 읽지 않습니다.

## 분자 해밀토니안 전체 변환 {#ham}
[PySCF 실습](../01-pyscf/)의 `hcore`, `eri`를 준비한 뒤 다음을 수행합니다.

```python
from qiskit_nature.second_q.hamiltonians import ElectronicEnergy
fermionic_h = ElectronicEnergy.from_raw_integrals(hcore, eri).second_q_op()
qubit_h = JordanWignerMapper().map(fermionic_h)
print(qubit_h.num_qubits, len(qubit_h))
```

보존된 N₂ 활성 공간 계산은 16큐빗, 파울리 항 1177개입니다. 항 수는 적분의 수치 임계값과 정리 방식에 영향을 받으므로 모든 버전에서 고정된 물리량이 아닙니다. `ecore`는 이 코드의 변환 대상에 포함하지 않았으므로 총 에너지 비교 시 별도로 한 번 더합니다.

## SQD에서는 어디에 쓰일까 {#sqd}
전자 상태를 큐빗으로 준비하고 측정 비트열을 점유로 읽는 규약에 JW가 관여합니다. SQD의 고전 대각화 입력은 파울리 항을 측정한 값이 아니라 `hcore`, `eri`와 배치 후보입니다. [VQE](../vqe-algorithm/)와 측정 요구가 다른 이유입니다.

[보존된 변환 결과](results.json)의 원본은 `scripts/p02_jordan_wigner.py`, Qiskit Nature 0.8.0입니다. H₂에 대해 저장된 15개 Pauli 항은 전자 에너지이며 핵 반발 상수를 포함하지 않습니다. 특수한 두 배치 블록을 쓴 [H₂ VQE](../vqe-hydrogen/)와 에너지 기준·공간을 맞춰 비교해야 합니다.


## 계산과 해석 확인

**1. 오비탈 0,1,2,3 순서에서 점유 (1,1,0,0)에 생성 연산 a₂†를 적용하면 부호와 점유는 무엇인가요?**

{{< answer >}}
2보다 앞선 점유 합이 2라 부호는 \((-1)^2=+1\)입니다. 결과는 +(1,1,1,0)입니다. 목표 자리가 이미 1이라면 부호 계산과 관계없이 결과는 영벡터입니다.
{{< /answer >}}

**2. Z 사슬이 부호를 −1로 바꾸면 그 상태의 측정 확률도 음수가 되나요?**

{{< answer >}}
아닙니다. 확률은 진폭의 절댓값 제곱이라 음수가 되지 않습니다. 상대 부호는 다른 경로의 진폭과 합쳐질 때 간섭과 에너지에 영향을 줍니다.
{{< /answer >}}
