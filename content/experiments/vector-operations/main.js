import { createPlane, inputNumber, number, pair, required, showResult } from 'learning-plane.js';

export function mount(root, { signal }) {
  const plane = createPlane(required(root, '[data-plane]'), { extent: 5 });
  const input = required(root, '[data-input="k"]');
  const result = required(root, '[data-result]');
  const modeButtons = [...root.querySelectorAll('[data-mode]')];
  const orderButtons = [...root.querySelectorAll('[data-order]')];
  let mode = 'addition', order = 'uv';
  const u = [2, 1], v = [-1, 2];
  function render() {
    const addition = mode === 'addition';
    required(root, '[data-addition-controls]').hidden = !addition;
    required(root, '[data-scaling-controls]').hidden = addition;
    required(root, '[data-scaling-examples]').hidden = addition;
    modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    orderButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.order === order)));
    result.dataset.mode = mode; result.dataset.order = order;
    plane.clear();
    if (addition) {
      delete result.dataset.scalar;
      required(root, '[data-question]').textContent = '두 이동을 더하는 순서';
      const first = order === 'uv' ? u : v;
      const firstName = order === 'uv' ? 'u' : 'v', secondName = order === 'uv' ? 'v' : 'u';
      plane.segment([0, 0], [1, 3], { className: 'lp-result', width: 5 });
      plane.segment([0, 0], first, { className: `lp-${firstName}`, dashed: firstName === 'v' });
      plane.segment(first, [1, 3], { className: `lp-${secondName}`, dashed: secondName === 'v' });
      plane.point([0, 0], { className: 'lp-origin', radius: 4 });
      plane.point(first, { className: 'lp-origin', radius: 3 });
      plane.label([first[0] / 2, first[1] / 2], firstName, { dx: order === 'uv' ? 12 : -17, dy: order === 'uv' ? 22 : -6 });
      plane.label([(first[0] + 1) / 2, (first[1] + 3) / 2], secondName, { dx: order === 'uv' ? 18 : 0, dy: order === 'uv' ? 4 : -18 });
      plane.label([1, 3], '합', { dx: 8, dy: -20, className: 'lp-result-text' });
      showResult(result, 1, 3, `${firstName} + ${secondName} = (1, 3)`);
      required(root, '[data-calculation]').textContent = order === 'uv' ? '가로: 2 + (−1) = 1 · 세로: 1 + 2 = 3' : '가로: −1 + 2 = 1 · 세로: 2 + 1 = 3';
      required(root, '[data-explanation]').textContent = `${firstName}의 끝에 ${secondName}의 시작을 이어 붙입니다. 어느 순서로 더해도 처음부터 마지막까지의 이동은 (1, 3)입니다.`;
      required(root, '[data-legend]').textContent = '회색 실선은 u, 주황 점선은 v입니다. 파란 화살표는 두 이동을 합한 결과입니다.';
      plane.describe(`${firstName} 다음 ${secondName}로 이동합니다. 중간 지점 ${pair(...first)}, 도착점 (1, 3). 두 벡터의 합은 (1, 3)입니다.`);
    } else {
      const k = inputNumber(input), x = 2 * k, y = k;
      required(root, '[data-k-value]').textContent = number(k);
      required(root, '[data-question]').textContent = '수를 곱했을 때의 방향과 길이';
      plane.segment([0, 0], u, { className: 'lp-u', dashed: true, width: 3 });
      plane.segment([0, 0], [x, y], { className: 'lp-result', width: 4.5 });
      plane.point([0, 0], { className: k === 0 ? 'lp-result' : 'lp-origin', radius: k === 0 ? 5 : 4 });
      if (k !== 1) plane.label(u, 'u', { dx: 20, dy: 15 });
      plane.label([x, y], k === 0 ? '영벡터' : k === 1 ? 'u = 1u' : `${number(k)}u`, { dy: k >= 0 ? -20 : 28, className: 'lp-result-text' });
      showResult(result, x, y, `${number(k)} × (2, 1) = ${pair(x, y)}`);
      result.dataset.scalar = number(k);
      required(root, '[data-calculation]').textContent = `가로: ${number(k)} × 2 = ${number(x)} · 세로: ${number(k)} × 1 = ${number(y)}`;
      const explanation = k === 0 ? '0을 곱하면 두 성분이 모두 0입니다. 이동하지 않으며 방향도 없습니다.' : `${k < 0 ? '반대' : '같은'} 방향으로, 원래 길이의 ${number(Math.abs(k))}배만큼 이동합니다.${Math.abs(k) === 0.5 ? ' 0.5배는 절반입니다.' : ''}`;
      required(root, '[data-explanation]').textContent = explanation;
      required(root, '[data-legend]').textContent = '회색 점선은 원래 벡터 u입니다. 파란 화살표는 수를 곱한 결과이고, 0을 곱한 결과는 점입니다.';
      plane.describe(`벡터 u = (2, 1)에 ${number(k)}을 곱한 결과는 ${pair(x, y)}입니다. ${explanation}`);
    }
  }
  modeButtons.forEach(button => button.addEventListener('click', () => { mode = button.dataset.mode; render(); }, { signal }));
  orderButtons.forEach(button => button.addEventListener('click', () => { order = button.dataset.order; render(); }, { signal }));
  input.addEventListener('input', render, { signal });
  root.querySelectorAll('[data-scalar]').forEach(button => button.addEventListener('click', () => { input.value = button.dataset.scalar; render(); }, { signal }));
  required(root, '[data-reset]').addEventListener('click', () => { mode = 'addition'; order = 'uv'; input.value = input.defaultValue; render(); }, { signal });
  render();
}
