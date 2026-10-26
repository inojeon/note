import { createPlane, inputNumber, number, pair, required, showResult } from 'learning-plane.js';

const near = value => Math.abs(value) < 1e-9;
const sets = {
  line: {
    label: '직선 y = x', defaults: [1, 2], range: 2, zero: true,
    vector: t => [t, t], rule: 'p = (t, t) · q = (s, s)',
    contains: ([x, y]) => near(y - x),
    proof: '이 직선에서는 임의의 (r, r), (s, s)를 더하면 (r + s, r + s), 실수 c를 곱하면 (cr, cr)입니다. 두 성분이 항상 같고 영벡터도 포함하므로 부분공간입니다.',
  },
  shifted: {
    label: '직선 y = x + 1', defaults: [0, 1], range: 2, zero: false,
    vector: t => [t, t + 1], rule: 'p = (t, t + 1) · q = (s, s + 1)',
    contains: ([x, y]) => near(y - x - 1),
    proof: '이 직선은 영벡터를 포함하지 않으므로 부분공간이 아닙니다. (0, 1) + (1, 2) = (1, 3)은 덧셈에 대한 반례이고, 0을 곱하면 직선 밖의 (0, 0)이 됩니다. 성공하는 계산이 있더라도 이 반례는 남습니다.',
  },
  segment: {
    label: '선분 −1 ≤ x ≤ 1, y = 0', defaults: [0.75, 0.75], range: 1, zero: true,
    vector: t => [t, 0], rule: 'p = (t, 0) · q = (s, 0)',
    contains: ([x, y]) => near(y) && Math.abs(x) <= 1 + 1e-9,
    proof: '선분은 영벡터를 포함하지만 부분공간이 아닙니다. (0.75, 0) + (0.75, 0) = (1.5, 0), 2(1, 0) = (2, 0)은 모두 선분 밖입니다. 일부 계산의 성공만으로 모든 덧셈과 수배에 닫혀 있다고 할 수는 없습니다.',
  },
  axes: {
    label: '두 좌표축의 합집합', defaults: [1, 1], range: 2, zero: true,
    vector: (t, which) => which === 0 ? [t, 0] : [0, t], rule: 'p = (t, 0) · q = (0, s)',
    contains: ([x, y]) => near(x) || near(y),
    proof: '각 축 위의 벡터에 실수를 곱하면 같은 축에 남습니다. 하지만 (1, 0) + (0, 1) = (1, 1)은 어느 축에도 속하지 않습니다. 수배가 성공해도 덧셈에 닫혀 있지 않으므로 부분공간이 아닙니다.',
  },
  zero: {
    label: '영벡터만 있는 집합', defaults: [0, 0], range: 2, zero: true,
    vector: () => [0, 0], rule: 'p = (0, 0) · q = (0, 0)',
    contains: ([x, y]) => near(x) && near(y),
    proof: '고를 수 있는 벡터는 0뿐입니다. 0 + 0 = 0이고 모든 실수 c에 대해 c0 = 0이므로 이 집합은 부분공간입니다.',
  },
  plane: {
    label: '평면 전체', defaults: [1, 2], range: 2, zero: true,
    vector: (t, which) => which === 0 ? [t, 1] : [1, t], rule: '이 예시의 입력: p = (t, 1) · q = (1, s)',
    contains: ([x, y]) => Number.isFinite(x) && Number.isFinite(y),
    proof: '이 화면은 평면의 일부 입력만 고릅니다. 일반적으로 두 실수 좌표를 각각 더하거나 실수를 곱해도 결과는 두 실수 좌표로 표현됩니다. 영벡터도 포함하므로 평면 전체는 자기 자신의 부분공간입니다.',
  },
};

export function mount(root, { signal }) {
  const select = required(root, '[data-set]');
  const tInput = required(root, '[data-input="t"]');
  const sInput = required(root, '[data-input="s"]');
  const kInput = required(root, '[data-input="k"]');
  const result = required(root, '[data-result]');
  const buttons = [...root.querySelectorAll('[data-mode]')];
  const plane = createPlane(required(root, '[data-plane]'), { extent: 7 });
  let operation = 'addition';

  function preset() {
    const set = sets[select.value];
    if (!set) throw new Error('알 수 없는 집합입니다.');
    [tInput, sInput].forEach(input => { input.min = String(-set.range); input.max = String(set.range); input.disabled = select.value === 'zero'; });
    tInput.value = String(select.value === 'segment' && operation === 'scaling' ? 1 : set.defaults[0]);
    sInput.value = String(set.defaults[1]); kInput.value = kInput.defaultValue;
  }

  function drawSet(name) {
    const style = { className: 'lp-set', width: 7, dashed: true, arrow: false };
    if (name === 'line') plane.segment([-7, -7], [7, 7], style);
    if (name === 'shifted') plane.segment([-7, -6], [6, 7], style);
    if (name === 'segment') {
      plane.segment([-1, 0], [1, 0], { ...style, dashed: false });
      plane.point([-1, 0], { className: 'lp-set', radius: 5 });
      plane.point([1, 0], { className: 'lp-set', radius: 5 });
    }
    if (name === 'axes') { plane.segment([-7, 0], [7, 0], style); plane.segment([0, -7], [0, 7], style); }
    if (name === 'zero') plane.point([0, 0], { className: 'lp-set', radius: 11, hollow: true });
    if (name === 'plane') plane.area([[-7, -7], [7, -7], [7, 7], [-7, 7]]);
  }

  function render() {
    const set = sets[select.value];
    if (!set) throw new Error('알 수 없는 집합입니다.');
    const t = inputNumber(tInput), s = inputNumber(sInput), k = inputNumber(kInput);
    const p = set.vector(t, 0), q = set.vector(s, 1), addition = operation === 'addition';
    const output = p.map((value, i) => addition ? value + q[i] : k * value);
    const inside = set.contains(output);
    if (!set.contains(p) || !set.contains(q)) throw new Error('입력 벡터가 선택한 집합 밖에 있습니다.');
    required(root, '[data-s-control]').hidden = !addition;
    required(root, '[data-k-control]').hidden = addition;
    required(root, '[data-input-rule]').textContent = addition ? set.rule : `p = ${select.value === 'plane' ? '(t, 1)' : select.value === 'shifted' ? '(t, t + 1)' : select.value === 'line' ? '(t, t)' : select.value === 'zero' ? '(0, 0)' : '(t, 0)'}`;
    [['t', t], ['s', s], ['k', k]].forEach(([key, value]) => { required(root, `[data-${key}-value]`).textContent = number(value); });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === operation)));
    showResult(result, ...output, `${addition ? 'p + q' : `${number(k)}p`} = ${pair(...output)} · ${inside ? '집합 안' : '집합 밖'}`);
    Object.assign(result.dataset, { set: select.value, mode: operation, inside: String(inside), zeroIncluded: String(set.zero), inputUX: number(p[0]), inputUY: number(p[1]), inputVX: number(q[0]), inputVY: number(q[1]), scalar: number(k) });
    required(root, '[data-calculation]').textContent = `${addition ? `${pair(...p)} + ${pair(...q)}` : `${number(k)} × ${pair(...p)}`} = ${pair(...output)}`;
    required(root, '[data-membership]').textContent = `${addition ? `입력 p = ${pair(...p)}, q = ${pair(...q)}는 모두` : `입력 p = ${pair(...p)}는`} 집합 안에 있습니다. ${inside ? '이번 결과도 집합 안에 있습니다.' : '결과는 집합 밖입니다. 이 계산 하나가 닫힘을 깨는 반례입니다.'}`;
    required(root, '[data-zero]').textContent = `영벡터 (0, 0): ${set.zero ? '포함' : '포함하지 않음'}`;
    required(root, '[data-proof]').textContent = set.proof;
    plane.clear(); drawSet(select.value);
    if (addition) {
      plane.segment([0, 0], p, { className: 'lp-u', width: 3 });
      plane.segment(p, output, { className: 'lp-v', width: 3, dashed: true });
      if (q.some(Boolean)) plane.point(q, { className: 'lp-v', radius: 5, hollow: true });
    } else if (p.some(Boolean)) plane.segment([0, 0], p, { className: 'lp-u', width: 3, dashed: true });
    plane.segment([0, 0], output, { className: 'lp-result', width: 4.5 });
    plane.point([0, 0], { className: 'lp-origin', radius: 3 });
    if (p.some(Boolean)) plane.point(p, { className: 'lp-u', radius: 4 });
    const sameInputs = p.every((value, i) => value === q[i]);
    if (p.some(Boolean)) plane.label(p, addition && sameInputs ? 'p = q' : 'p', { dx: -14, dy: 29 });
    if (addition && !sameInputs && q.some(Boolean)) plane.label(q, 'q', { dx: 18, dy: 8 });
    if (!inside) {
      const [x, y] = output, d = 0.13;
      plane.segment([x - d, y - d], [x + d, y + d], { className: 'lp-result', width: 3, arrow: false });
      plane.segment([x - d, y + d], [x + d, y - d], { className: 'lp-result', width: 3, arrow: false });
    }
    plane.label(output, output.every(value => value === 0) ? '결과 0' : '결과', { dy: output[1] >= 0 ? -20 : 30, className: 'lp-result-text' });
    plane.describe(`${set.label}. ${addition ? `입력 p = ${pair(...p)}, q = ${pair(...q)}를 더한` : `입력 p = ${pair(...p)}에 ${number(k)}을 곱한`} 결과 ${pair(...output)}는 집합 ${inside ? '안' : '밖'}입니다. 영벡터는 ${set.zero ? '포함됩니다.' : '포함되지 않습니다.'}`);
  }

  [tInput, sInput, kInput].forEach(input => input.addEventListener('input', render, { signal }));
  select.addEventListener('change', () => { operation = 'addition'; preset(); render(); }, { signal });
  buttons.forEach(button => button.addEventListener('click', () => {
    if (operation !== button.dataset.mode) { operation = button.dataset.mode; preset(); }
    render();
  }, { signal }));
  required(root, '[data-reset]').addEventListener('click', () => { select.value = 'line'; operation = 'addition'; preset(); render(); }, { signal });
  preset(); render();
}
