# 선택적 과학 계산 재현

노트를 읽거나 `hugo server -D`로 문서를 작성할 때 이 환경은 필요하지 않습니다. 기존 과학 계산의 숫자를 다시 확인할 때만 사용합니다. 계산 원본은 `references/sqd-docs/scripts/`에 보존하며 공개 사이트에서는 실행하지 않습니다.

## 설치와 실행

기존 계산 기준은 Python 3.12입니다. 패키지 8개의 고정 버전은 `requirements.txt`에 있습니다. 연구 환경은 저장소 루트에서 따로 만듭니다.

```sh
python3.12 -m venv research/.venv
research/.venv/bin/python -m pip install -r research/requirements.txt
research/.venv/bin/python research/reproduce.py --list
research/.venv/bin/python research/reproduce.py p00_quickstart
```

`--dry-run`은 작업 계획만 표시하고 과학 패키지를 불러오지 않습니다. `all`은 모든 계산을 실행합니다. UCJ의 추가 최적화는 `p03_ucj_inside --optimize` 또는 `all --optimize`를 명시할 때만 실행하며 오래 걸릴 수 있습니다.

실행기는 원본 스크립트와 입력 데이터를 임시 폴더로 복사합니다. 그 안에서 계산한 새 JSON·로그·버전 기록만 `research/results/<UTC 시각>-<작업>/`에 저장합니다. 원본 `references/`, 노트 `content/`, 배포 결과 `public/`는 수정하지 않습니다. 초기 seed 데이터 중 작업이 실제로 다시 쓰지 않은 파일은 새 결과로 내보내지 않습니다. OpenMP·OpenBLAS·MKL 스레드는 1로 고정합니다.

## 데이터와 조건

`provenance.json`은 기존 계산 데이터 15개의 원본 경로, SHA-256, 생성 스크립트와 해석 조건입니다. 이는 보존본을 식별하는 목록이지 이번 개편 과정에서 계산을 재실행했다는 뜻은 아닙니다. `run.json`은 새 실행에 사용한 실제 패키지 버전과 출력 체크섬을 남깁니다. 단순 최상위 버전 고정은 모든 플랫폼의 완전한 잠금 파일을 대신하지 않습니다.

- H₂ 입문·BO·VQE는 STO-3G, 고정 핵, 기본 거리 0.74 Å입니다. FCI의 ‘정확’은 이 기저와 전자 모형 안에서라는 뜻입니다.
- SQD 퀵스타트는 N₂/STO-3G/1.09768 Å, 활성 8오비탈·(5,5)입니다. 표본은 균등 난수입니다.
- 주 실습은 N₂/cc-pVDZ/1.098 Å, 활성 MO 2~9·(5,5)입니다. 05와 06은 정확한 CASCI 계수에서 샘플링하고, 04는 근사 UCJ/LUCJ 상태에서 샘플링합니다.
- `00_quickstart.json`의 `nuclear_repulsion_energy`는 역사적인 필드 이름입니다. 값은 `cas.get_h1eff()`의 **동결 내각과 핵 반발을 포함한 상수 ecore**입니다.
- `02_jw.json`의 H₂ 파울리 계수는 전자 에너지입니다. H₂ 총 에너지 자료와 비교할 때 핵 반발을 한 번 더합니다.
- `03_ucj.json`은 초기값 결과입니다. `E_opt` 필드가 없으면 최적화를 실행한 결과라고 해석하지 않습니다.
- 확률·에너지는 시드, 라이브러리 버전, 스레드, 수렴 조건을 함께 비교합니다. 재실행의 작은 수치 차이는 원인을 확인하고 물리량에 맞는 허용 오차로 판정합니다.

## 결과를 콘텐츠에 반영하기

새 JSON의 단위·기저 순서·정규화·행렬의 대칭성과 기대 결과를 검사한 다음 해당 노트나 실험의 데이터 원본을 명시적으로 교체합니다. 관련 조건과 설명도 함께 수정하고 Hugo 빌드와 브라우저 검사를 수행합니다. 재현 실행만으로 게시 데이터가 자동 갱신되지는 않습니다.
