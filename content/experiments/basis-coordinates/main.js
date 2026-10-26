import { createPlane, pair, required } from 'learning-plane.js';

const bases = {
  standard: { first: [1, 0], second: [0, 1], a: 3, b: 2 },
  tilted: { first: [1, 0], second: [1, 1], a: 1, b: 2 },
  collinear: { first: [1, 0], second: [2, 0] },
};

export function mount(root, { signal }) {
  const plane = createPlane(required(root, '[data-plane]'), { extent: 4 });
  const grid = required(root, '[data-grid]'), result = required(root, '[data-result]');
  let selected = 'standard';
  function render() {
    const { first, second, a, b } = bases[selected];
    const valid = selected !== 'collinear';
    Object.assign(result.dataset, { basis: selected, validBasis: String(valid), resultX: '3', resultY: '2', coefficientA: valid ? String(a) : '', coefficientB: valid ? String(b) : '', gridShown: String(grid.checked) });
    required(root, '[data-basis-vectors]').textContent = `b₁ = ${pair(...first)}, b₂ = ${pair(...second)}`;
    result.textContent = valid ? `이 기저에서 v의 좌표: ${pair(a, b)}` : '이 묶음은 평면의 기저가 아닙니다.';
    required(root, '[data-calculation]').textContent = valid ? `${a} × ${pair(...first)} + ${b} × ${pair(...second)} = (3, 2)` : 'a × (1, 0) + b × (2, 0) = (a + 2b, 0)';
    required(root, '[data-explanation]').textContent = selected === 'standard' ? '가로로 3, 세로로 2만큼 이동합니다. 표준 기저에서는 익숙한 성분 (3, 2)이 그대로 좌표가 됩니다.' : selected === 'tilted' ? '기울어진 b₂를 2배 하면 (2, 2)입니다. 여기에 b₁을 1배 한 (1, 0)을 더합니다. 같은 v를 표현하는 좌표가 (1, 2)로 바뀌었습니다.' : '어떤 계수를 선택해도 세로 성분은 0입니다. 목표의 세로 성분 2를 만들 수 없으므로 이 묶음에서 v의 좌표를 정할 수 없습니다.';
    plane.clear();
    if (grid.checked) {
      // Display only a finite window of integer coefficients, never the complete span.
      const positions = new Set();
      for (let i = -8; i <= 8; i++) for (let j = -8; j <= 8; j++) {
        const x = i * first[0] + j * second[0], y = i * first[1] + j * second[1];
        const key = `${x},${y}`;
        if (Math.abs(x) <= 4 && Math.abs(y) <= 4 && !positions.has(key)) {
          positions.add(key); plane.point([x, y], { className: 'lp-grid-point', radius: 2 });
        }
      }
      if (valid) for (let i = -3; i <= 3; i++) {
        if (selected === 'standard') {
          plane.segment([i, -4], [i, 4], { className: 'lp-basis-grid', arrow: false, width: 1.5 });
        } else {
          // x − y = i inside the fixed square viewport.
          const low = Math.max(-4, -4 - i), high = Math.min(4, 4 - i);
          plane.segment([low + i, low], [high + i, high], { className: 'lp-basis-grid', arrow: false, width: 1.5 });
        }
      }
    }
    if (!valid) plane.segment([-4, 0], [4, 0], { className: 'lp-span', width: 10, arrow: false });
    plane.segment([0, 0], [3, 2], { className: 'lp-result', width: 5 });
    if (valid) {
      const firstMove = [a * first[0], a * first[1]];
      plane.segment([0, 0], firstMove, { className: 'lp-u', width: 3 });
      plane.segment(firstMove, [3, 2], { className: 'lp-v', width: 3, dashed: true });
      plane.label([firstMove[0] / 2, firstMove[1] / 2], `${a}b₁`, { dy: 49 });
      plane.label([(firstMove[0] + 3) / 2, (firstMove[1] + 2) / 2], `${b}b₂`, { dx: 28, dy: 4 });
    } else {
      plane.segment([0, 0], first, { className: 'lp-u' });
      plane.segment([0, 0], second, { className: 'lp-v', dashed: true });
      plane.label(first, 'b₁', { dy: 48 }); plane.label(second, 'b₂', { dy: 48 });
    }
    plane.point([3, 2], { className: 'lp-result', radius: 5 });
    plane.label([3, 2], 'v = (3, 2)', { dx: -14, dy: -21, className: 'lp-result-text' });
    plane.describe(`${required(root, '[data-basis-vectors]').textContent}. ${result.textContent} 목표 v는 표준 좌표 (3, 2)에 그대로 있습니다.`);
  }
  function choose(value) {
    selected = value;
    root.querySelectorAll('[data-basis]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.basis === selected)));
    render();
  }
  root.querySelectorAll('[data-basis]').forEach(button => button.addEventListener('click', () => choose(button.dataset.basis), { signal }));
  grid.addEventListener('change', render, { signal });
  required(root, '[data-reset]').addEventListener('click', () => { grid.checked = false; choose('standard'); }, { signal });
  render();
}
