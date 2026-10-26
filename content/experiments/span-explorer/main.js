import { createPlane, inputNumber, number, pair, required, showResult } from 'learning-plane.js';

const modes = {
  one: { u: [1, 0], v: [0, 0], kind: 'line', description: '모든 실수 a를 쓰면 x축 전체를 만듭니다.' },
  collinear: { u: [1, 0], v: [2, 0], kind: 'line', description: '가로 성분은 a + 2b, 세로 성분은 항상 0입니다. 벡터가 두 개여도 생성공간은 x축 전체입니다.' },
  plane: { u: [1, 0], v: [1, 1], kind: 'plane', description: '모든 실수 a, b를 쓰면 평면 전체를 만듭니다. 원하는 점 (x, y)에 대해 b = y, a = x − y로 정할 수 있습니다.' },
  zero: { u: [0, 0], v: [0, 0], kind: 'zero', description: '영벡터에는 어떤 수를 곱해 더해도 (0, 0)입니다. 생성공간은 영벡터 하나뿐입니다.' },
};

export function mount(root, { signal }) {
  const select = required(root, '[data-set]');
  const aInput = required(root, '[data-input="a"]');
  const bInput = required(root, '[data-input="b"]');
  const samples = required(root, '[data-samples]');
  const result = required(root, '[data-result]');
  const plane = createPlane(required(root, '[data-plane]'));

  function render() {
    const mode = modes[select.value];
    if (!mode) throw new Error('알 수 없는 벡터 조합입니다.');
    const single = select.value === 'one';
    const a = inputNumber(aInput), b = single ? 0 : inputNumber(bInput);
    const au = mode.u.map(value => a * value), bv = mode.v.map(value => b * value);
    const sum = au.map((value, i) => value + bv[i]);
    required(root, '[data-b-control]').hidden = single;
    required(root, '[data-a-value]').textContent = number(a);
    required(root, '[data-b-value]').textContent = number(b);
    required(root, '[data-vectors]').textContent = `u = ${pair(...mode.u)}${single ? '' : ` · v = ${pair(...mode.v)}`}`;
    const term = value => value < 0 ? `(${number(value)})` : number(value);
    showResult(result, ...sum, `${number(a)}u${single ? '' : ` + ${term(b)}v`} = ${pair(...sum)}`);
    Object.assign(result.dataset, { mode: select.value, spanKind: mode.kind, coefficientA: number(a), coefficientB: number(b) });
    required(root, '[data-calculation]').textContent = single ? `${number(a)} × ${pair(...mode.u)} = ${pair(...sum)}` : `${pair(...au)} + ${pair(...bv)} = ${pair(...sum)}`;
    required(root, '[data-kind]').textContent = mode.description;
    plane.clear();
    if (mode.kind === 'plane') plane.area([[-7, -7], [7, -7], [7, 7], [-7, 7]]);
    if (mode.kind === 'line') plane.segment([-7, 0], [7, 0], { className: 'lp-set', width: 7, dashed: true, arrow: false });
    if (mode.kind === 'zero') plane.point([0, 0], { className: 'lp-set', radius: 10, hollow: true });
    const endpoints = new Map();
    if (samples.checked) {
      for (let ai = -4; ai <= 4; ai++) {
        for (let bi = single ? 0 : -4; bi <= (single ? 0 : 4); bi++) {
          const point = mode.u.map((value, i) => ai / 2 * value + bi / 2 * mode.v[i]);
          endpoints.set(point.join(','), point);
        }
      }
      endpoints.forEach(point => plane.point(point, { className: 'lp-sample', radius: 3.5 }));
    }
    result.dataset.sampleCount = String(endpoints.size);
    plane.segment([0, 0], sum, { className: 'lp-result', width: 5 });
    if (au.some(Boolean) && bv.some(Boolean)) {
      plane.segment([0, 0], au, { className: 'lp-u', width: 3 });
      plane.segment(au, sum, { className: 'lp-v', dashed: true, width: 3 });
    }
    plane.point([0, 0], { className: 'lp-origin', radius: 3 });
    plane.label(sum, sum.every(value => value === 0) ? '결과 0' : '결과', { dy: sum[1] >= 0 ? -20 : 29, className: 'lp-result-text' });
    const scope = mode.kind === 'zero'
      ? '계수에 어떤 실수를 써도 결과는 원점 하나입니다.'
      : `${mode.kind === 'line' ? '굵은 점선' : '옅은 면'}은 모든 실수 계수로 만드는 생성공간 중 화면에 보이는 부분입니다. 화면 밖으로도 이어집니다.`;
    const sampleText = samples.checked
      ? `${single ? 'a를' : 'a, b를'} −2부터 2까지 0.5씩 골라 만든 ${single ? 9 : 81}가지 조합을 표시했습니다. ${mode.kind === 'zero' ? '모두 원점 하나에 겹칩니다.' : `겹치는 결과를 합치면 서로 다른 점 ${endpoints.size}개입니다. 이 유한한 점들이 생성공간 전체는 아닙니다.`}`
      : '파란 화살표는 현재 계수로 만든 결과입니다.';
    required(root, '[data-scope]').textContent = `${sampleText} ${scope}`;
    plane.describe(`${mode.description} 현재 계수는 a = ${number(a)}${single ? '' : `, b = ${number(b)}`}이고 결과는 ${pair(...sum)}입니다. ${samples.checked ? `유한한 표본 ${endpoints.size}개의 서로 다른 끝점을 함께 표시합니다.` : ''}`);
  }
  [aInput, bInput].forEach(input => input.addEventListener('input', render, { signal }));
  select.addEventListener('change', render, { signal });
  samples.addEventListener('change', render, { signal });
  required(root, '[data-reset]').addEventListener('click', () => {
    select.value = 'one'; aInput.value = aInput.defaultValue; bInput.value = bInput.defaultValue; samples.checked = false; render();
  }, { signal });
  render();
}
