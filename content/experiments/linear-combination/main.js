import { createPlane, inputNumber, number, pair, required, showResult } from 'learning-plane.js';

export function mount(root, { signal }) {
  const aInput = required(root, '[data-input="a"]');
  const bInput = required(root, '[data-input="b"]');
  const result = required(root, '[data-result]');
  const plane = createPlane(required(root, '[data-plane]'));
  function render() {
    const a = inputNumber(aInput), b = inputNumber(bInput);
    const x = a + b, y = b, reached = x === 3 && y === 2;
    required(root, '[data-a-value]').textContent = number(a);
    required(root, '[data-b-value]').textContent = number(b);
    result.dataset.coefficientA = number(a); result.dataset.coefficientB = number(b);
    result.dataset.goalReached = String(reached);
    const term = n => n < 0 ? `(${number(n)})` : number(n);
    showResult(result, x, y, `${number(a)}u + ${term(b)}v = ${pair(x, y)}`);
    required(root, '[data-calculation]').textContent = `${pair(a, 0)} + ${pair(b, b)} = ${pair(x, y)}`;
    const first = a === 0 ? 'u의 이동은 더하지 않습니다.' : `먼저 ${pair(a, 0)}만큼 이동합니다.${a < 0 ? ' 음수를 곱했으므로 u의 반대 방향입니다.' : ''}`;
    const second = b === 0 ? 'v의 이동은 더하지 않습니다.' : `그 끝에서 ${pair(b, b)}만큼 이동합니다.${b < 0 ? ' 음수를 곱했으므로 v의 반대 방향입니다.' : ''}`;
    const explanation = a === 0 && b === 0 ? '두 이동을 모두 0배 하므로 원점에 머뭅니다. 결과는 영벡터입니다.' : `${first} ${second}`;
    required(root, '[data-explanation]').textContent = explanation;
    const goal = reached ? '목표에 도착했습니다. 가로: 1 + 2 = 3, 세로: 0 + 2 = 2입니다.' : `목표까지 더 필요한 이동은 ${pair(3 - x, 2 - y)}입니다.`;
    required(root, '[data-goal]').textContent = goal;
    plane.clear();
    plane.point([3, 2], { className: 'lp-origin', radius: 10, hollow: true, dashed: true });
    plane.label([3, 2], reached ? '목표 도착' : '목표', { dx: 10, dy: -20 });
    plane.segment([0, 0], [x, y], { className: 'lp-result', width: 5.5 });
    if (a !== 0) plane.segment([0, 0], [a, 0], { className: 'lp-u', width: 3 });
    if (b !== 0) plane.segment([a, 0], [x, y], { className: 'lp-v', width: 3, dashed: true });
    plane.point([0, 0], { className: a === 0 && b === 0 ? 'lp-result' : 'lp-origin', radius: 4 });
    if (a !== 0 && b !== 0) {
      plane.label([a / 2, 0], 'au', { dy: b >= 0 ? 29 : -17 });
      plane.label([a + b / 2, b / 2], 'bv', { dx: 22, dy: b >= 0 ? 3 : -3 });
      if (!reached) plane.label([x, y], '합', { dx: -15, dy: b >= 0 ? -19 : 29, className: 'lp-result-text' });
    } else if (a !== 0) plane.label([x, y], 'au = 합', { dy: -20, className: 'lp-result-text' });
    else if (b !== 0) plane.label([x, y], 'bv = 합', { dy: b >= 0 ? -20 : 29, className: 'lp-result-text' });
    else plane.label([0, 0], '영벡터', { dy: -20, className: 'lp-result-text' });
    plane.describe(`${number(a)}배 한 u ${pair(a, 0)}에 ${number(b)}배 한 v ${pair(b, b)}를 더하면 ${pair(x, y)}입니다. ${goal}`);
  }
  [aInput, bInput].forEach(input => input.addEventListener('input', render, { signal }));
  root.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {
    aInput.value = button.dataset.example === 'negative' ? '-1' : '2';
    bInput.value = button.dataset.example === 'negative' ? '1' : '0';
    render();
  }, { signal }));
  required(root, '[data-reset]').addEventListener('click', () => { aInput.value = aInput.defaultValue; bInput.value = bInput.defaultValue; required(root, '[data-hint]').open = false; render(); }, { signal });
  render();
}
