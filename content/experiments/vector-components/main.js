import { createPlane, inputNumber, number, pair, required, showResult } from 'learning-plane.js';

export function mount(root, { signal }) {
  const xInput = required(root, '[data-input="x"]');
  const yInput = required(root, '[data-input="y"]');
  const plane = createPlane(required(root, '[data-plane]'));
  const result = required(root, '[data-result]');
  const buttons = [...root.querySelectorAll('[data-tail]')];
  let shifted = false;

  function render() {
    const x = inputNumber(xInput), y = inputNumber(yInput);
    const start = shifted ? [-2, -1] : [0, 0];
    const end = [start[0] + x, start[1] + y];
    const zero = x === 0 && y === 0;
    required(root, '[data-x-value]').textContent = number(x);
    required(root, '[data-y-value]').textContent = number(y);
    buttons.forEach(button => button.setAttribute('aria-pressed', String((button.dataset.tail === 'shifted') === shifted)));
    showResult(result, x, y, `이동량 ${pair(x, y)}${zero ? ' · 영벡터' : ''}`);
    result.dataset.startX = number(start[0]); result.dataset.startY = number(start[1]);
    result.dataset.endX = number(end[0]); result.dataset.endY = number(end[1]);
    required(root, '[data-position]').textContent = `시작점 ${pair(...start)} → 끝점 ${pair(...end)}`;
    const operand = n => n < 0 ? `(${number(n)})` : number(n);
    required(root, '[data-calculation]').textContent = `가로: ${number(end[0])} − ${operand(start[0])} = ${number(x)} · 세로: ${number(end[1])} − ${operand(start[1])} = ${number(y)}`;
    const horizontal = `${x > 0 ? '오른쪽' : '왼쪽'}으로 ${Math.abs(x)}칸`;
    const vertical = `${y > 0 ? '위' : '아래'}로 ${Math.abs(y)}칸`;
    const explanation = zero ? '이동하지 않으므로 시작점과 끝점이 같습니다. 영벡터에는 방향이 없습니다.'
      : x === 0 ? `가로로는 움직이지 않고, ${vertical} 이동합니다.`
      : y === 0 ? `${horizontal} 이동하고, 세로로는 움직이지 않습니다.`
      : `${horizontal}, ${vertical} 이동합니다.`;
    required(root, '[data-explanation]').textContent = explanation;
    plane.clear();
    if (shifted && !zero) {
      plane.segment([0, 0], [x, y], { className: 'lp-u', dashed: true, width: 2 });
      plane.point([0, 0], { className: 'lp-u', radius: 3 });
      plane.label([x, y], '비교', { dx: 15, dy: y >= 0 ? -18 : 28 });
    }
    plane.segment(start, [end[0], start[1]], { className: 'lp-u', dashed: true, arrow: false, width: 2.5 });
    plane.segment([end[0], start[1]], end, { className: 'lp-u', dashed: true, arrow: false, width: 2.5 });
    plane.segment(start, end, { className: 'lp-result', width: 4.5 });
    if (zero) {
      plane.label(start, '영벡터', { dy: -18, className: 'lp-result-text' });
    } else {
      plane.point(start, { className: 'lp-origin', radius: 4 });
      // Opposite offsets keep the start/end labels apart for one-step vectors.
      plane.label(start, '시작', { dy: y >= 0 ? 28 : -18 });
      plane.label(end, '끝', { dy: y >= 0 ? -18 : 28, className: 'lp-result-text' });
    }
    required(root, '[data-legend]').textContent = `격자 한 칸은 가로와 세로 모두 1입니다. 꺾인 점선은 가로·세로 이동량입니다.${shifted && !zero ? ' ‘비교’라고 표시한 회색 점선 화살표는 같은 이동을 원점에서 그린 것입니다. 두 화살표의 방향과 길이는 같습니다.' : ''}`;
    plane.describe(`시작점 ${pair(...start)}에서 끝점 ${pair(...end)}까지 이동량은 ${pair(x, y)}입니다. ${explanation}${shifted && !zero ? ' 비교용 점선 화살표는 같은 이동량을 원점에서 그린 것입니다.' : ''}`);
  }
  [xInput, yInput].forEach(input => input.addEventListener('input', render, { signal }));
  buttons.forEach(button => button.addEventListener('click', () => { shifted = button.dataset.tail === 'shifted'; render(); }, { signal }));
  required(root, '[data-reset]').addEventListener('click', () => {
    xInput.value = xInput.defaultValue; yInput.value = yInput.defaultValue; shifted = false; render();
  }, { signal });
  render();
}
