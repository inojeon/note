# H₂ 보른–오펜하이머 실험 데이터

`bo_h2.py`는 고정된 두 수소 원자핵의 25가지 거리(0.4–3.0 Å)에서 **FCI/STO-3G, 전자 2개, 스핀 단일항(Singlet)** 바닥상태를 계산한다. 실제 전자구조 계산값이며, 에너지와 전자 밀도는 같은 FCI 상태에서 얻는다. 이 스크립트는 기존의 전체 분자 계산을 실행하지 않는다.

프로젝트 루트(`references/sqd-docs`)에서:

```bash
.venv/bin/python scripts/bo_h2.py
python3 tools/check_bo_h2_data.py
.venv/bin/python tools/check_bo_h2_data.py --recompute
```

재생성 환경: Python 3.12, PySCF 2.14.0, NumPy 2.4.4. 새 환경에서는 `python3 -m venv /tmp/bo-h2-env` 후 해당 환경의 pip로 `pyscf==2.14.0 numpy==2.4.4`를 설치할 수 있다. 수치 라이브러리 스레드 수는 스크립트에서 1로 고정한다. 게시용 HTML 빌드에는 PySCF가 필요하지 않으며 이미 생성된 JSON을 사용한다.

## 에너지와 단위

- 핵은 x축의 ±R/2에 둔다. 입력 거리 `r_angstrom`만 Å이며, `nuclei_bohr` 및 밀도 그리드 좌표는 **보어(bohr)**다. `bohr_to_angstrom`으로 단위를 변환한다.
- 에너지 단위는 모두 **하트리(Hartree)**다.
- `energy_electronic_hartree`는 전자 운동·전자–핵 인력·전자 간 반발을 포함하고, 핵간 반발은 제외한다.
- `energy_nuclear_hartree = 1/R_bohr`, `energy_total_hartree`는 두 항의 합이다. 영점 진동 에너지는 포함하지 않는다.
- `minimum_index`는 **25개 계산 거리 중** 총에너지가 가장 낮은 점이다. 연속 최적화의 최소점이나 실험적 결합 길이로 해석하지 않는다.
- FCI는 선택한 STO-3G 기저 안에서 완전한 전자 배치를 다룬다. 최소 기저의 오차를 제거하는 방법은 아니며 완전 기저의 정확한 분자 에너지가 아니다.

## 같은 파동함수의 전자 밀도

`density_matrix_ao`는 공간 AO 기저에서 스핀을 합한 1전자 밀도행렬이다. AO 기저는 정규직교가 아니므로 전자 수는 `Tr(D S) = 2`다. 각 H에는 동일한 수축 s형 가우시안 AO 하나가 있다.

```text
AO_A(r) = Σ_p c_p exp(−α_p |r − R_A|²)
rho(r)  = Σ_AB D_AB AO_A(r) AO_B(r)
```

`gaussian_basis.coefficients`는 원시 가우시안 정규화·수축 정규화·구면조화함수 Y₀₀를 모두 포함한다. 추가 정규화 인자를 곱하지 않는다. α의 단위는 bohr⁻², AO의 단위는 bohr⁻³ᐟ², 밀도는 **전자 수/bohr³**다. `rho`는 개별 오비탈의 진폭·위상이나 전자의 궤적이 아니다.

브라우저는 이 작은 JSON에서 밀도를 계산해 33³ 그리드와 z=0 단면을 생성한다. 격자는 bohr 단위 원점 `[-7,-5,-5]`, 간격 `[0.4375,0.3125,0.3125]`, Gaussian cube 순서(x 바깥, z 가장 빠름)다. 모든 거리에서 동일한 등밀도면 값 **0.04 전자/bohr³**를 사용한다. cube 파일을 만들 때 양의 격자 수는 보어 좌표를 뜻한다. 원자 모델의 Å 좌표와 혼합하지 않도록 주의한다.

## 수치 검증

생성 시 모든 거리에서 FCI 고유벡터 잔차, 독립 4×4 행렬 전체 대각화, 1·2전자 밀도행렬로 재구성한 에너지, 스핀 S²=0, AO/MO 전자 수를 확인한다. 내보낸 AO는 PySCF `eval_gto` 결과와 비교한다. 같은 AO로 구한 시각화 격자의 수치 적분도 기록한다.

`check_bo_h2_data.py`는 외부 라이브러리 없이 가우시안 곱 적분으로 AO 겹침과 `Tr(DS)`를 독립 검증하고, 유한 표시 상자 밖의 전자 수를 오차함수 적분으로 계산한다. 밀도행렬의 양의 준정부호성, 핵간 반발의 거리 의존성, RHF에 대한 FCI 변분 관계도 확인한다. `--recompute`는 PySCF 계산을 다시 수행하고 저장된 에너지·밀도행렬과 대조한다.
