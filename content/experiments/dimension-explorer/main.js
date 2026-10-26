import { inputNumber, number, required } from 'learning-plane.js';

const NS = 'http://www.w3.org/2000/svg';
const spaces = {
  line: { dimension: 1, name: 'x축', formula: 'p = x(1, 0, 0)', reason: '세 성분으로 적지만 x 하나만 자유롭게 정합니다.', constraint: 'y와 z는 0으로 고정됩니다.' },
  plane: { dimension: 2, name: 'xy평면', formula: 'p = x(1, 0, 0) + y(0, 1, 0)', reason: 'x와 y를 따로 정하면 평면의 모든 벡터를 표현할 수 있습니다. 독립적인 기준은 두 개입니다.', constraint: 'z는 0으로 고정됩니다. x와 y는 따로 정할 수 있습니다.' },
  space: { dimension: 3, name: '공간 전체', formula: 'p = x(1, 0, 0) + y(0, 1, 0) + z(0, 0, 1)', reason: 'x, y, z를 각각 자유롭게 정합니다. 세 방향의 기준이 모두 필요합니다.', constraint: '세 성분을 서로 독립적으로 정할 수 있습니다.' },
  zero: { dimension: 0, name: '영벡터만 있는 공간', formula: 'p = (0, 0, 0)', reason: '영벡터 하나뿐이라 자유롭게 정할 수 있는 수가 없습니다. 차원은 0입니다.', constraint: '모든 성분이 0으로 고정됩니다.' },
};
const triple = values => `(${values.map(number).join(', ')})`;
function node(tag, attributes = {}, text) {
  const result = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes)) result.setAttribute(key, String(value));
  if (text !== undefined) result.textContent = text;
  return result;
}

export function mount(root, { signal }) {
  const svg = required(root, '[data-plane]'), result = required(root, '[data-result]');
  const controls = Object.fromEntries(['x', 'y', 'z', 'yaw', 'elevation'].map(name => [name, required(root, `[data-input="${name}"]`)]));
  let selected = 'line';
  function render() {
    const space = spaces[selected];
    const values = ['x', 'y', 'z'].map((name, index) => {
      const active = index < space.dimension;
      controls[name].disabled = !active;
      if (!active) controls[name].value = '0';
      const value = active ? inputNumber(controls[name]) : 0;
      required(root, `[data-${name}-value]`).textContent = number(value);
      return value;
    });
    const yaw = inputNumber(controls.yaw), elevation = inputNumber(controls.elevation);
    required(root, '[data-yaw-value]').textContent = number(yaw);
    required(root, '[data-elevation-value]').textContent = number(elevation);
    Object.assign(result.dataset, { space: selected, dimension: String(space.dimension), componentCount: '3', resultX: number(values[0]), resultY: number(values[1]), resultZ: number(values[2]), yaw: number(yaw), elevation: number(elevation) });
    result.textContent = `p = ${triple(values)} · ${space.name}의 차원: ${space.dimension}`;
    required(root, '[data-formula]').textContent = space.formula;
    required(root, '[data-reason]').textContent = space.reason;
    required(root, '[data-constraint]').textContent = space.constraint;

    const angle = yaw * Math.PI / 180, tilt = elevation * Math.PI / 180;
    const project = ([x, y, z]) => [230 + 56 * (x * Math.cos(angle) - y * Math.sin(angle)), 240 + 56 * ((x * Math.sin(angle) + y * Math.cos(angle)) * Math.sin(tilt) - z * Math.cos(tilt))];
    const title = node('title', {}, `${result.textContent}. ${space.reason} 시점 방향 ${yaw}도, 높이 ${elevation}도.`);
    const drawing = node('g', { 'data-drawing': '', 'aria-hidden': 'true' });
    svg.replaceChildren(title, drawing);
    svg.setAttribute('aria-label', title.textContent);
    const line = (a, b, className = 'dim-axis', dashed = false, arrow = false) => {
      const [x1, y1] = project(a), [x2, y2] = project(b);
      const attributes = { x1, y1, x2, y2, class: className };
      if (dashed) attributes['stroke-dasharray'] = '6 5';
      drawing.append(node('line', attributes));
      if (arrow) {
        const distance = Math.hypot(x2 - x1, y2 - y1);
        if (distance > .001) {
          const dx = (x2 - x1) / distance, dy = (y2 - y1) / distance;
          drawing.append(node('polygon', { points: `${x2},${y2} ${x2 - 12 * dx - 5 * dy},${y2 - 12 * dy + 5 * dx} ${x2 - 12 * dx + 5 * dy},${y2 - 12 * dy - 5 * dx}`, class: 'dim-head' }));
        }
      }
    };
    const label = (point, text, dy = -12, dx = 0) => {
      const [px, py] = project(point);
      drawing.append(node('text', { x: Math.max(65, Math.min(395, px + dx)), y: Math.max(26, Math.min(434, py + dy)), 'text-anchor': 'middle', class: 'lp-label' }, text));
    };
    if (selected === 'plane') drawing.append(node('polygon', { points: [[-2, -2, 0], [2, -2, 0], [2, 2, 0], [-2, 2, 0]].map(p => project(p).join(',')).join(' '), class: 'lp-region' }));
    if (selected === 'space') {
      for (let axis = 0; axis < 3; axis++) for (const a of [-2, 2]) for (const b of [-2, 2]) {
        const start = [a, b], end = [a, b]; start.splice(axis, 0, -2); end.splice(axis, 0, 2);
        line(start, end, 'dim-box', true);
      }
    }
    if (selected === 'line') line([-2.4, 0, 0], [2.4, 0, 0], 'dim-space-line');
    for (let axis = 0; axis < 3; axis++) {
      const negative = [0, 0, 0], positive = [0, 0, 0]; negative[axis] = -2.5; positive[axis] = 2.5;
      line(negative, positive, 'dim-axis');
      label(positive, ['x', 'y', 'z'][axis], axis === 2 ? -13 : 20);
      const tick = [0, 0, 0]; tick[axis] = 1;
      const [cx, cy] = project(tick);
      drawing.append(node('circle', { cx, cy, r: 2.5, class: 'dim-tick' }));
      label(tick, '1', axis === 2 ? -4 : 19, axis === 2 ? 13 : 0);
    }
    const [x, y, z] = values;
    line([x, 0, 0], [x, y, 0], 'dim-guideline', true);
    line([x, y, 0], [x, y, z], 'dim-guideline', true);
    line([0, 0, 0], values, 'dim-result', false, true);
    const [cx, cy] = project(values);
    drawing.append(node('circle', { cx, cy, r: 5, class: 'dim-point' }));
    label(values, `p ${triple(values)}`, -22);
    if (values.some(value => value !== 0)) label([0, 0, 0], '0', 24, -12);
  }
  function choose(id) {
    const previousDimension = spaces[selected].dimension;
    selected = id;
    ['x', 'y', 'z'].forEach((name, index) => {
      if (index >= previousDimension && index < spaces[id].dimension) controls[name].value = controls[name].defaultValue;
    });
    root.querySelectorAll('[data-space]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.space === id)));
    render();
  }
  Object.values(controls).forEach(control => control.addEventListener('input', render, { signal }));
  root.querySelectorAll('[data-space]').forEach(button => button.addEventListener('click', () => choose(button.dataset.space), { signal }));
  required(root, '[data-reset]').addEventListener('click', () => {
    Object.values(controls).forEach(control => { control.value = control.defaultValue; });
    required(root, '[data-camera-panel]').open = false;
    choose('line');
  }, { signal });
  render();
}
