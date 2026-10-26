---
{
  "title": "측정 기저",
  "summary": "같은 상태를 서로 다른 기저로 측정할 때 결과 확률이 달라지는 이유를 설명합니다.",
  "params": {
    "topics": [
      "quantum-computing"
    ],
    "search_terms": [
      "measurement basis"
    ],
    "prerequisites": [
      {
        "id": "born-rule",
        "reason": "기저와 상태의 내적에서 결과 확률을 구합니다."
      },
      {
        "id": "quantum-gate",
        "reason": "측정 전에 게이트로 기저를 바꾸는 절차를 설명합니다."
      }
    ],
    "related": [
      {
        "id": "energy-measurement",
        "reason": "0·1을 읽는 것과 에너지를 읽는 것은 어떻게 다를까?"
      },
      {
        "id": "computational-basis",
        "reason": "왜 0 상태는 영벡터가 아니라 첫째 좌표가 1인 벡터일까?"
      },
      {
        "id": "born-rule",
        "reason": "음수나 복소수인 진폭이 어떻게 확률이 될까?"
      }
    ]
  }
}
---

## 무엇을 구별하는 측정인가
계산 기저 측정은 0과 1을 구별합니다. X 기저 측정은 +와 −를 구별합니다. 같은 상태라도 무엇을 구별하느냐에 따라 확률이 달라집니다.

{{< experiment id="measurement-basis" >}}

## 투영의 길이를 제곱한다
정규직교 측정 기저 \(\{|b_j\rangle\}\)에서 순수상태의 결과 확률은 다음과 같습니다.

$$
p_j=|\langle b_j|\psi\rangle|^2.
$$

예를 들어 \(|\psi\rangle=|+\rangle\)이면 계산 기저에서는 반반이지만 X 기저에서는 +가 반드시 나옵니다. 같은 확률 분포를 보인 두 상태라도 다른 기저로 구별할 수 있습니다.

## 회로에서 기저를 바꾸기
X 측정은 [하다마드 게이트](../quantum-gate/)를 적용한 뒤 계산 기저로 읽어 구현할 수 있습니다. 이는 \(H_{\rm gate}|+\rangle=|0\rangle\)이기 때문입니다. Y 측정은 \(S^\dagger\) 다음 하다마드를 적용해 읽습니다.

기저를 바꿔 같은 상태의 좌표를 다시 쓰는 수학적 표현과, 실제 장치에서 측정 전에 게이트를 적용하는 절차를 구별하세요. 서로 다른 측정 설정을 비교할 때는 같은 초기 상태를 매번 다시 준비합니다. [에너지 측정](../energy-measurement/)은 해밀토니안의 고유공간을 구별하는 측정입니다.
