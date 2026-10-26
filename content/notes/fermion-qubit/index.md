---
{
  "title": "페르미온을 큐빗으로 표현하기",
  "summary": "전자 점유를 비트로 저장하면서 교환 반대칭의 부호를 보존합니다.",
  "params": {
    "topics": [
      "quantum-computing"
    ],
    "search_terms": [
      "fermion qubit"
    ],
    "prerequisites": [
      {
        "id": "electronic-configuration",
        "reason": "스핀 오비탈별 점유를 비트에 대응합니다."
      },
      {
        "id": "slater-determinant",
        "reason": "전자 교환의 반대칭을 Z 사슬의 부호와 연결합니다."
      }
    ],
    "related": [
      {
        "id": "basis-set",
        "reason": "기저 함수가 부족하면 어떤 오차가 남을까?"
      },
      {
        "id": "computational-basis",
        "reason": "왜 0 상태는 영벡터가 아니라 첫째 좌표가 1인 벡터일까?"
      }
    ]
  }
}
---

## 점유를 저장하는 규약
고정된 스핀 오비탈 하나는 점유 0 또는 1입니다. Jordan–Wigner 표현은 이 점유를 큐빗의 0·1에 대응시킵니다. 공간 오비탈 하나에는 α·β 스핀 오비탈이 있으므로 보통 두 큐빗이 필요합니다.

{{< experiment id="fermion-qubit" >}}

## 점유 비트만 바꾸면 부족한 이유
전자 생성·소멸 연산자는 서로 반교환합니다. 앞쪽에 점유된 오비탈의 수가 홀수면 부호가 바뀌어야 합니다. 큐빗 번호 \(p\)보다 작은 번호에 Z를 적용하면 이 점유의 짝홀을 기록할 수 있습니다.

$$
a_p^\dagger=\left(\prod_{j<p}Z_j\right)\frac{X_p-iY_p}{2},\qquad
n_p=a_p^\dagger a_p=\frac{I-Z_p}{2}.
$$

여기서는 점유 0을 \(|0\rangle\), 점유 1을 \(|1\rangle\)로 정했습니다. Pauli 문자열을 출력할 때 큰 큐빗 번호부터 적는 Qiskit의 규약도 함께 확인합니다.

## 변환과 축약은 다르다
2공간 오비탈·4스핀 오비탈은 직접 매핑하면 4큐빗입니다. 전자 수·대칭을 이용한 축약으로 더 작은 논리 공간을 만들 수 있지만, 일반적인 JW 변환이 자동으로 1큐빗이 되는 것은 아닙니다.

[Jordan–Wigner 실습](../02-jordan-wigner/)에서 연산자 수준의 변환을, [점유수 비트열](../occupation-bitstrings/)에서 측정 문자열 해석을 이어서 다룹니다.
