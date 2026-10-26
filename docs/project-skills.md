# 이 프로젝트에 복사한 스킬

## 설치한 것

`scientific-visualization` v1.4를 `.agents/skills/scientific-visualization/`에 복사했다. 스킬 본문, 상대 참조, 도구 파일 18개와 원본 MIT 라이선스를 함께 보존했다. 약 205 KB의 파일이며 Python·npm 패키지를 설치한 것이 아니다.

- 원본 경로: `/Users/ino/Projects/claude-scientific-skills/skills/scientific-visualization/`
- 원본 저장소: <https://github.com/K-Dense-AI/claude-scientific-skills>
- 원본 커밋: `593377bb048752abb0152deab9fbb1083a6087df`
- 복사일: 2026-10-26
- 저작권·라이선스: K-Dense Inc., MIT. 복사본의 `LICENSE.md` 참고.
- 파일별 SHA-256: [project-skills.lock.json](project-skills.lock.json)

## 이번 작업에서 적용하는 방법

새 학습 그림·실험을 만들 때 [SKILL.md](../.agents/skills/scientific-visualization/SKILL.md)를 읽는다. `references/publication_guidelines.md`의 정직한 축척·접근성·출력 검토 원칙을 적용한다. 사용 대상은 웹 학습용 SVG 실험이다. 학술지 투고·논문 그림 출력 절차는 이번 작업 대상이 아니다.

두 축의 단위를 같게 그리고, 색만으로 벡터를 구별하지 않으며, 직접 라벨과 실선·점선을 함께 쓴다. 숫자 결과, 키보드 입력, JavaScript 없이 읽을 수 있는 설명도 제공한다. 실제 작은 화면에서 글자와 화살표가 겹치지 않는지 확인한다.

스킬의 색 대비 도구는 기존 Python 표준 라이브러리만으로 실행한다. 예:

```sh
python3 -B .agents/skills/scientific-visualization/scripts/palette_audit.py \
  --color 2563EB --color 475569 --background FFFFFF \
  --role graphical --fail-on background
```

색 수치 검사는 화면 전체의 접근성을 보장하지 않는다. 겹침·라벨·초점·키보드·모바일은 별도로 확인한다. 스킬 안의 Matplotlib·Plotly·uv 설치 예제는 실행하지 않는다. 공통 사이트는 계속 Hugo와 일반 CSS·JavaScript로 생성한다.

## 복사하지 않은 후보

| 후보 | 이번에 제외한 이유 |
| --- | --- |
| `sympy` | 정확한 상징 계산에는 유용하지만 현재 환경에 패키지가 없다. 첫 세 편의 정수·유리수 검산에는 필요하지 않아 보류한다. |
| `scientific-writing` | 연구 논문·보고서 작성 중심이다. 초보 한국어 학습 설명의 기준은 [재작성 계획](learning-path-redesign.md)으로 따로 정한다. |
| `scientific-critical-thinking` | 연구 설계와 근거 평가 중심으로 이번 기초 수학 설명에 직접 필요한 범위가 작다. |
| `scientific-schematics`, `infographics` | 외부 생성 서비스가 필요하며 조작 가능한 SVG 수학 실험 제작과 맞지 않는다. |

새 스킬은 실제 작업에 필요한 경우에만 추가한다. 복사본을 바꿀 때에는 원본을 수정하지 않고 변경 내용·원본 버전·체크섬을 함께 기록한다. 스킬의 지침이 프로젝트의 설치 제약이나 사용자의 요청과 충돌하면 프로젝트 범위에 맞게 적용한다.

## 도구 출처

시각화 제작 기준에 사용한 스킬 라이브러리: Kassis, T., Agarwal, V., He, Y., Patel, D., & Brueckner, A. M. (2026). *Scientific Agent Skills: A Library of Procedural Knowledge for Research Agents*. [arXiv:2609.00065](https://doi.org/10.48550/arXiv.2609.00065). 서지사항은 2026-10-26에 arXiv 원문 페이지에서 확인했다. 이 출처는 도구의 기여 기록이며 학습 효과가 검증되었다는 주장이 아니다.
