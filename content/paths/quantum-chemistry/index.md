---
weight: 20
title: "양자 상태에서 분자 에너지까지"
summary: "확률과 상태, 오비탈과 전자 배치, 해밀토니안과 근사 계산을 차례로 연결합니다."
params:
  steps: ["quantum-state", "born-rule", "superposition", "observable", "hamiltonian", "schrodinger", "born-oppenheimer", "orbital", "electron-spin", "pauli", "electronic-configuration", "slater-determinant", "basis-set", "sto-3g", "basis-orbital-energies", "molecular-orbital", "electron-integrals", "hamiltonian-elements", "h2-hamiltonian", "h2-state-energy", "large-hamiltonian", "hamiltonian-size", "variational-principle", "hartree-fock", "electron-correlation", "configuration-interaction", "active-space", "potential-energy"]
---

## 이 경로에서 연결할 질문

상태 벡터에서 측정 확률을 읽고, 허용 에너지를 고유값 문제로 바꾸는 것부터 시작합니다. 다음에는 원자·분자 오비탈을 유한한 기저로 표현하고 여러 전자가 점유한 배치로 에너지 행렬을 만듭니다.

H₂의 작은 행렬을 이해한 뒤 큰 분자에서 생기는 비용을 살펴봅니다. 마지막에는 HF·전자 상관·CI·활성 공간이 각각 무엇을 근사하는지 구별하고 거리별 에너지 곡선을 읽습니다.

벡터·내적·고유값이 낯설면 먼저 [선형대수 경로](../linear-algebra/)를 읽으세요. 계산 결과를 볼 때는 기저, 전자 수, 스핀 조건, 핵 반발 포함 여부와 에너지 단위를 함께 확인합니다.
