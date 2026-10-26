import { createPlane, inputNumber, required } from 'learning-plane.js';

const format = value => String(Math.abs(value) < .0005 ? 0 : Math.round(value * 1000) / 1000);
const pair = (x, y) => `(${format(x)}, ${format(y)})`;
const factor = value => value < 0 ? `(${format(value)})` : format(value);
const examples = { perpendicular: [3, 4, -4, 3], same: [3, 4, 3, 4], opposite: [3, 4, -3, -4], zero: [0, 0, 1, 0] };

export function mount(root, { signal }) {
  const names = ['ux', 'uy', 'vx', 'vy'];
  const controls = names.map(name => required(root, `[data-input="${name}"]`));
  const normalize = required(root, '[data-normalize]'), result = required(root, '[data-result]');
  const plane = createPlane(required(root, '[data-plane]'), { extent: 5 });
  function render() {
    const [sourceX, sourceY, vx, vy] = controls.map(inputNumber);
    const sourceLength = Math.hypot(sourceX, sourceY);
    normalize.disabled = sourceLength === 0;
    if (sourceLength === 0) normalize.checked = false;
    const ux = normalize.checked ? sourceX / sourceLength : sourceX, uy = normalize.checked ? sourceY / sourceLength : sourceY;
    const productX = ux * vx, productY = uy * vy, dot = productX + productY;
    const length = Math.hypot(ux, uy), squaredLength = ux * ux + uy * uy;
    names.forEach((name, index) => { required(root, `[data-${name}-value]`).textContent = format(inputNumber(controls[index])); });
    Object.assign(result.dataset, { sourceX: String(sourceX), sourceY: String(sourceY), ux: String(ux), uy: String(uy), vx: String(vx), vy: String(vy), productX: String(productX), productY: String(productY), dot: String(dot), length: String(length), squaredLength: String(squaredLength), normalized: String(normalize.checked) });
    result.textContent = `내적: ${factor(ux)} × ${factor(vx)} + ${factor(uy)} × ${factor(vy)} = ${format(dot)}`;
    required(root, '[data-term-x]').textContent = format(productX);
    required(root, '[data-term-y]').textContent = format(productY);
    required(root, '[data-vectors]').textContent = `${normalize.checked ? '정규화한 u' : 'u'} = ${pair(ux, uy)}, v = ${pair(vx, vy)}`;
    required(root, '[data-length-detail]').textContent = `${normalize.checked ? '정규화한 u' : 'u'}와 자기 자신의 내적: ${format(squaredLength)} · 길이: ${format(length)}`;
    required(root, '[data-normalization]').textContent = sourceLength === 0 ? 'u의 길이가 0입니다. 0으로 나눌 수 없으므로 영벡터는 정규화하지 않습니다.' : normalize.checked ? `원래 u = ${pair(sourceX, sourceY)}의 각 성분을 길이 ${format(sourceLength)}로 나눴습니다. 표시한 u의 길이는 1입니다.` : `u의 길이: ${format(sourceLength)}. 각 성분을 이 길이로 나누면 길이가 1이 됩니다.`;
    const vLength = Math.hypot(vx, vy);
    let explanation;
    if (sourceLength === 0 || vLength === 0) explanation = '한 벡터가 영벡터라서 내적은 0입니다. 영벡터에는 방향을 정할 수 없으므로 두 화살표 사이의 각도를 비교하지 않습니다.';
    else if (Math.abs(dot) < 1e-10) explanation = '가로 성분의 곱과 세로 성분의 곱이 상쇄됩니다. 두 벡터가 모두 영벡터가 아니므로, 내적 0은 두 방향이 수직임을 뜻합니다.';
    else if (vx === sourceX && vy === sourceY && !normalize.checked) explanation = '자기 자신과의 내적은 성분 제곱의 합입니다. 이 값은 길이의 제곱이므로 음수가 될 수 없습니다.';
    else if (vx === -sourceX && vy === -sourceY && !normalize.checked) explanation = '크기는 같고 방향이 반대입니다. 자기 자신과의 내적에 −1을 곱한 값이므로, 영벡터가 아니면 내적은 음수입니다.';
    else explanation = `가로 성분의 곱은 ${format(productX)}, 세로 성분의 곱은 ${format(productY)}입니다. 두 값을 더하면 ${format(dot)}입니다.`;
    required(root, '[data-explanation]').textContent = explanation;
    plane.clear();
    plane.segment([0, 0], [ux, uy], { className: 'lp-u', width: 6 });
    plane.segment([0, 0], [vx, vy], { className: 'lp-v', width: 3, dashed: true });
    plane.label([ux, uy], normalize.checked ? '정규화한 u' : 'u', { dy: -19, dx: normalize.checked ? 19 : 0 });
    plane.label([vx, vy], 'v', { dy: 27 });
    plane.describe(`${required(root, '[data-vectors]').textContent}. ${result.textContent}. ${explanation}`);
  }
  controls.forEach(input => input.addEventListener('input', render, { signal }));
  normalize.addEventListener('change', render, { signal });
  root.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {
    controls.forEach((input, index) => { input.value = String(examples[button.dataset.example][index]); });
    normalize.checked = false; render();
  }, { signal }));
  required(root, '[data-reset]').addEventListener('click', () => {
    controls.forEach(input => { input.value = input.defaultValue; }); normalize.checked = false; render();
  }, { signal });
  render();
}
