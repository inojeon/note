import { createPlane, required } from 'learning-plane.js';

const vectors = { u: [1, 0], v: [2, 0], w: [0, 1], zero: [0, 0] };
const sets = { redundant: ['u', 'v', 'w'], independent: ['u', 'w'], 'with-zero': ['u', 'zero'] };
const names = { plane: '평면 전체', line: '가로 직선', vertical: '세로 직선', zero: '영벡터만' };

function span(ids) {
  const horizontal = ids.includes('u') || ids.includes('v');
  return ids.includes('w') ? (horizontal ? 'plane' : 'vertical') : (horizontal ? 'line' : 'zero');
}

function draw(plane, ids) {
  const kind = span(ids);
  plane.clear();
  if (kind === 'plane') plane.area([[-3, -3], [3, -3], [3, 3], [-3, 3]]);
  if (kind === 'line') plane.segment([-3, 0], [3, 0], { className: 'lp-span', width: 10, arrow: false });
  if (kind === 'vertical') plane.segment([0, -3], [0, 3], { className: 'lp-span', width: 10, arrow: false });
  for (const id of ids) {
    const vector = vectors[id];
    plane.segment([0, 0], vector, { className: id === 'v' ? 'lp-v' : 'lp-u', dashed: id === 'v', width: 3 });
    plane.label(vector, id === 'zero' ? '0' : id, { dx: id === 'u' ? -5 : 10, dy: id === 'v' ? 49 : -16 });
  }
  if (kind === 'zero') {
    plane.point([0, 0], { className: 'lp-result', radius: 6 });
    if (!ids.length) plane.label([0, 0], '0', { dy: -17 });
  }
  plane.describe(`${ids.length ? ids.join(', ') : '벡터 없음'}의 생성공간: ${names[kind]}.`);
}

export function mount(root, { signal }) {
  const originalPlane = createPlane(required(root, '[data-original-plane]'), { extent: 3 });
  const remainingPlane = createPlane(required(root, '[data-plane]'), { extent: 3 });
  const result = required(root, '[data-result]');
  let selectedSet = 'redundant';
  function render() {
    const original = sets[selectedSet];
    const remaining = original.filter(id => required(root, `[data-keep="${id}"]`).checked);
    const before = span(original), after = span(remaining), same = before === after;
    const independent = !remaining.includes('zero') && !(remaining.includes('u') && remaining.includes('v'));
    Object.assign(result.dataset, { set: selectedSet, originalSpan: before, remainingSpan: after, sameSpan: String(same), remainingCount: String(remaining.length), independent: String(independent) });
    required(root, '[data-original-label]').textContent = names[before];
    required(root, '[data-remaining-label]').textContent = names[after];
    result.textContent = same ? '생성공간이 같습니다.' : `생성공간이 줄었습니다: ${names[before]} → ${names[after]}.`;
    const removed = original.filter(id => !remaining.includes(id));
    let reason;
    if (!removed.length) reason = selectedSet === 'redundant' ? '아직 벡터를 빼지 않았습니다. v = 2u이므로, v를 빼도 같은 평면을 만들 수 있습니다.' : '아직 벡터를 빼지 않았습니다. 체크를 하나 해제해 두 그림을 비교합니다.';
    else if (!remaining.length) reason = '벡터가 하나도 없으면 빈 합을 영벡터로 정합니다. 따라서 만들 수 있는 것은 영벡터뿐입니다.';
    else if (same && removed.includes('zero')) reason = '영벡터는 어떤 수를 곱해도 0입니다. u와 영벡터로 만들던 모든 벡터를 u 하나로 만들 수 있습니다.';
    else if (same && removed.includes('v')) reason = 'v = 2u입니다. v가 맡던 이동을 u 두 배로 대신하므로, 만들 수 있는 공간은 같습니다.';
    else if (same && removed.includes('u')) reason = 'u = ½v입니다. u가 맡던 이동을 v의 절반으로 대신하므로, 만들 수 있는 공간은 같습니다.';
    else if (after === 'line') reason = '세로 방향 w를 뺐습니다. u와 v에 어떤 수를 곱해 더해도 세로 성분은 0입니다.';
    else if (after === 'vertical') reason = '가로 방향 벡터를 모두 뺐습니다. w만으로는 가로 성분이 0이 아닌 벡터를 만들 수 없습니다.';
    else reason = '남은 벡터는 영벡터뿐입니다. 어떤 수를 곱해도 원점에서 벗어나지 않습니다.';
    required(root, '[data-reason]').textContent = reason;
    required(root, '[data-independence]').textContent = !remaining.length ? '빈 묶음의 생성공간을 {0}으로 표시하는 약속을 썼습니다.' : remaining.includes('zero') ? '남은 묶음은 선형 종속입니다. 영벡터에 1을 곱하고 나머지에 0을 곱해도 합이 0입니다.' : !independent ? '남은 묶음은 선형 종속입니다. 2u − v = 0이므로, 계수를 모두 0으로 두지 않아도 상쇄됩니다.' : remaining.length === 1 ? '남은 것은 영벡터가 아닌 벡터 하나입니다. 계수를 0으로 둘 때만 합이 0이 되므로 선형 독립입니다.' : '남은 묶음은 선형 독립입니다. 가로·세로 성분을 모두 0으로 만들려면 두 계수를 각각 0으로 두어야 합니다.';
    draw(originalPlane, original); draw(remainingPlane, remaining);
  }
  function select(id) {
    selectedSet = id;
    root.querySelectorAll('[data-set]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.set === id)));
    for (const name of Object.keys(vectors)) {
      const shown = sets[id].includes(name);
      required(root, `[data-choice="${name}"]`).hidden = !shown;
      required(root, `[data-keep="${name}"]`).checked = shown;
    }
    render();
  }
  root.querySelectorAll('[data-set]').forEach(button => button.addEventListener('click', () => select(button.dataset.set), { signal }));
  root.querySelectorAll('[data-keep]').forEach(input => input.addEventListener('change', render, { signal }));
  required(root, '[data-reset]').addEventListener('click', () => select('redundant'), { signal });
  select('redundant');
}
