---
{
  "title": "샘플링: 비트열 얻기",
  "summary": "보른 분포·유한 샷·비트 뒤집힘·후선별을 구분해 SQD 입력을 준비합니다.",
  "params": {
    "topics": [
      "sqd",
      "sqd-workflow"
    ],
    "search_terms": [
      "05 sampling"
    ],
    "prerequisites": [
      {
        "id": "sqd-sampling",
        "reason": "한 샷과 확률의 의미를 사용합니다."
      }
    ],
    "related": []
  }
}
---

## 준비한 상태에서 결과 하나로 {#born}
측정 한 번은 비트열 하나를 만듭니다. 이 문서의 통계 예제는 **정확한 CASCI 상태에서 고전적으로 샘플링**하여 상태 준비 오차를 제외합니다. [앞 회로](../04-circuit/)의 근사 상태에서 얻은 분포와 다릅니다.

{{< experiment id="sqd-sampling" >}}

## 계산 조건과 큰 확률의 배치 {#shots}

배치 하나의 확률을 작게 설정한 뒤, 한 번 이상 발견할 가능성을 높이는 데 필요한 샷 수를 비교하세요. 발견 가능성과 실제 한 실행의 발견 여부를 구별합니다.

{{< experiment id="discovery-probability" >}}
N₂ cc-pVDZ, 1.098 Å, 활성 8오비탈·(5,5)의 3136개 배치가 대상입니다. HF 배치 `00011111|00011111`의 확률은 약 94.21%이고, 가장 큰 50개 배치가 약 99.832%를 차지하는 자료입니다. 이는 이 분자의 이 공간에서의 관찰이며 모든 분자에 일반화하지 않습니다.

확률 p인 배치를 한 번 이상 볼 확률은 \(1-(1-p)^M\)입니다. 샷을 늘리면 드문 배치를 발견할 가능성이 늘지만 한 번의 실행에서 발견 수가 정확히 정해지는 것은 아닙니다.

## 비트 순서와 BitArray {#format}
문자열은 β 8비트 다음 α 8비트이고 각 절반의 오른쪽이 오비탈 0입니다. 앞의 0도 의미가 있으므로 비트 폭을 고정합니다.

```python
from qiskit.primitives import BitArray
counts = {"0001111100011111": 75, "0011011100110111": 25}
bit_array = BitArray.from_counts(counts, num_bits=16)
```

위 횟수는 API를 보여주는 예시이며 실제 계산 결과가 아닙니다. 구분선 `|`나 공백을 넣지 않습니다. 서로 다른 큐빗 순서를 사용했다면 SQD 규약에 맞게 변환해야 합니다.

## 샘플링을 재현하는 방법 {#code}
```python
import numpy as np
from pyscf import fci
# cas.kernel()을 마친 8오비탈, (5, 5) CASCI 결과
probabilities = np.abs(cas.ci.ravel()) ** 2
probabilities /= probabilities.sum()
strings = fci.cistring.make_strings(range(8), 5)
rng = np.random.default_rng(1)
indices = rng.choice(probabilities.size, size=10_000, p=probabilities)
counts = {}
for index in indices:
    ia, ib = np.unravel_index(index, cas.ci.shape)
    bits = format(int(strings[ib]), "08b") + format(int(strings[ia]), "08b")
    counts[bits] = counts.get(bits, 0) + 1
bit_array = BitArray.from_counts(counts, num_bits=16)
```

CI 배열의 첫 축이 α, 둘째 축이 β라는 규약과 출력 문자열의 순서를 구별했습니다. 복소 계수에도 올바르도록 단순 제곱 대신 절댓값 제곱을 사용합니다.

## 잡음과 후선별 {#noise}

{{< experiment id="sampling-noise" >}}


각 비트가 독립 확률 q로 뒤집힌다는 모형을 넣을 수 있습니다. 16비트가 모두 그대로일 확률은 \((1-q)^{16}\)입니다. q=0.02에서 보존된 10,000샷 자료의 전자 수 통과율은 73.51%입니다. 통과했어도 두 비트가 바뀌어 잘못된 배치일 수 있습니다.

```python
from qiskit_addon_sqd.counts import bit_array_to_arrays
from qiskit_addon_sqd.subsampling import postselect_by_hamming_right_and_left
bitstrings, probabilities = bit_array_to_arrays(bit_array)
kept, kept_probabilities = postselect_by_hamming_right_and_left(
    bitstrings, probabilities, hamming_right=5, hamming_left=5,
)
```

후선별은 선택한 전자 수 구역을 벗어난 표본을 거릅니다. 잘못된 배치가 모두 걸러지는 것도, 이후 구성 복구가 모두 정답으로 고치는 것도 아닙니다. 장비 잡음에는 이 독립 뒤집힘 모형 밖의 상관·드리프트도 있습니다.

## SQD에 넘기기 {#handoff}
`diagonalize_fermionic_hamiltonian`에는 원본 `bit_array`와 적분을 전달합니다. 내부 반복에서 후선별·복구하므로 미리 버린 표본만 넘기면 활용할 원본 정보가 줄어듭니다. [보존된 통계](results.json)의 생성 코드는 `scripts/p05_sampling.py`이며, 다음 [SQD 반복 과정](../06-sqd-guide/)으로 이어집니다.
