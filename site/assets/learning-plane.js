// Small, dependency-free geometry helpers for learning on an equally scaled plane.
const NS = 'http://www.w3.org/2000/svg';
export const number = value => String(Object.is(value, -0) ? 0 : value);
export const pair = (x, y) => `(${number(x)}, ${number(y)})`;

export function required(root, selector) {
  const element = root.querySelector(selector);
  if (!element) throw new Error(`실험의 화면 요소를 찾을 수 없습니다: ${selector}`);
  return element;
}

export function inputNumber(input) {
  const value = input.valueAsNumber;
  if (!Number.isFinite(value) || value < Number(input.min) || value > Number(input.max)) {
    throw new Error('슬라이더 값이 표시 범위를 벗어났습니다.');
  }
  return value;
}

function element(tag, attributes = {}, text) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  if (text !== undefined) node.textContent = text;
  return node;
}

export function createPlane(svg, { extent = 7 } = {}) {
  // A square viewBox and a single scale keep one horizontal unit equal to one vertical unit.
  const size = 460, center = size / 2, margin = 38;
  const scale = (size - 2 * margin) / (2 * extent);
  const project = ([x, y]) => [center + x * scale, center - y * scale];
  const title = element('title');
  const grid = element('g', { class: 'lp-grid', 'aria-hidden': 'true' });
  const axes = element('g', { class: 'lp-axes', 'aria-hidden': 'true' });
  const drawing = element('g', { 'data-drawing': '', 'aria-hidden': 'true' });
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('role', 'img');
  svg.replaceChildren(title, grid, axes, drawing);
  for (let i = -extent; i <= extent; i++) {
    const [position] = project([i, 0]);
    grid.append(element('path', { d: `M${position},${margin}V${size - margin}M${margin},${position}H${size - margin}` }));
  }
  axes.append(element('path', { d: `M${margin},${center}H${size - margin}M${center},${margin}V${size - margin}` }));
  for (let i = -extent + 1; i < extent; i++) {
    if (i === 0 || i % 2 !== 0) continue;
    const [x, y] = project([i, i]);
    axes.append(element('text', { x, y: center + 23, 'text-anchor': 'middle' }, i));
    axes.append(element('text', { x: center - 10, y: y + 6, 'text-anchor': 'end' }, i));
  }
  axes.append(element('text', { x: center - 10, y: center + 23, 'text-anchor': 'end' }, '0'));
  axes.append(element('text', { x: size - 21, y: center + 7, 'text-anchor': 'middle' }, 'x'));
  axes.append(element('text', { x: center + 14, y: 22 }, 'y'));

  function point(at, { className = 'lp-result', radius = 5, hollow = false, dashed = false } = {}) {
    const [cx, cy] = project(at);
    const dot = element('circle', { cx, cy, r: radius, class: `${className} lp-point${hollow ? ' lp-hollow' : ''}` });
    if (dashed) dot.setAttribute('stroke-dasharray', '4 3');
    drawing.append(dot);
    return dot;
  }

  function segment(from, to, { className = 'lp-result', dashed = false, arrow = true, width = 3.5 } = {}) {
    const [x1, y1] = project(from), [x2, y2] = project(to);
    const length = Math.hypot(x2 - x1, y2 - y1);
    if (length < 0.01) {
      if (arrow) point(to, { className });
      return;
    }
    const dx = (x2 - x1) / length, dy = (y2 - y1) / length;
    const head = arrow ? Math.min(11, length * 0.4) : 0;
    const line = element('line', {
      x1, y1, x2: x2 - dx * head * 0.75, y2: y2 - dy * head * 0.75,
      class: `${className} lp-vector`, 'stroke-width': width,
    });
    if (dashed) line.setAttribute('stroke-dasharray', '8 6');
    drawing.append(line);
    if (arrow) drawing.append(element('polygon', {
      points: `${x2},${y2} ${x2 - dx * head - dy * head * 0.42},${y2 - dy * head + dx * head * 0.42} ${x2 - dx * head + dy * head * 0.42},${y2 - dy * head - dx * head * 0.42}`,
      class: `${className} lp-arrowhead`,
    }));
  }

  function label(at, text, { dx = 0, dy = -14, className = '', anchor = 'middle' } = {}) {
    const [px, py] = project(at);
    // Keep direct labels within the viewBox, including at all slider boundary values.
    const x = Math.max(42, Math.min(size - 42, px + dx));
    const y = Math.max(25, Math.min(size - 10, py + dy));
    drawing.append(element('text', { x, y, class: `lp-label ${className}`, 'text-anchor': anchor }, text));
  }

  function area(points, { className = 'lp-region' } = {}) {
    drawing.append(element('polygon', { points: points.map(at => project(at).join(',')).join(' '), class: className }));
  }

  return {
    clear: () => drawing.replaceChildren(), point, segment, label, area,
    describe(text) { title.textContent = text; svg.setAttribute('aria-label', text); },
  };
}

export function showResult(output, x, y, text) {
  output.dataset.resultX = number(x);
  output.dataset.resultY = number(y);
  output.textContent = text;
}
