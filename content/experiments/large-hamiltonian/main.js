import { controls, fmt, chart } from 'experiment-shared.js';

export async function mount(root, context) {
  const $ = selector => root.querySelector(selector);
  function render() {
    const n = Number($('#n').value);
    $('#large-n-value').textContent = String(n);
    $('[data-dense]').textContent = (n * n).toLocaleString();
    $('[data-sparse]').textContent = (3 * n - 2).toLocaleString();
    $('[data-bytes]').textContent = fmt(n * n * 8 / 1024 / 1024, 2) + ' MiB';
    const v = n === 3 ? [1, 2, 1] : Array.from({ length: n }, (_, i) => Math.sin((i + 1) * Math.PI / (n + 1)));
    const av = v.map((value, i) => 2 * value - (v[i - 1] ?? 0) - (v[i + 1] ?? 0));
    $('[data-product]').textContent = av.slice(0, 3).map(x => fmt(x, 6)).join(', ');
    $('[data-product]').dataset.values = JSON.stringify(av.slice(0, 3));
    $('[data-calculation]').textContent = n === 3
      ? 'v = (1, 2, 1): 첫째 2×1 − 2 = 0, 둘째 2×2 − 1 − 1 = 2, 셋째 2×1 − 2 = 0. 결과는 (0, 2, 0)입니다.'
      : '행 i에서는 2vᵢ − vᵢ₋₁ − vᵢ₊₁만 계산합니다. 현재 입력은 양끝에서 0이 되는 매끄러운 사인 모양입니다.';
    // For small cases independently materialize a dense operator and compare its action.
    const comparison = $('[data-comparison]');
    if (n <= 40) {
      const dense = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 2 : Math.abs(i - j) === 1 ? -1 : 0));
      const product = dense.map(row => row.reduce((sum, value, j) => sum + value * v[j], 0));
      const difference = Math.max(...product.map((value, i) => Math.abs(value - av[i])));
      comparison.textContent = '검산: 실제로 만든 작은 조밀 행렬과 이웃 규칙의 결과 차이 최대 ' + difference.toExponential(2) + '.';
      comparison.dataset.difference = difference;
    } else {
      comparison.textContent = '큰 N에서는 이웃 규칙만 실행합니다. 조밀 행렬을 만들지 않았으므로 독립 비교값을 표시하지 않습니다. N=10으로 돌아가 두 계산을 비교할 수 있습니다.';
      delete comparison.dataset.difference;
    }
    const shown = Math.min(n, 10), svg = $('[data-pattern]'), step = 25, start = 40;
    svg.setAttribute('viewBox', `0 0 330 ${70 + step * shown}`);
    let picture = '<title>대각 2와 이웃 대각 −1, 나머지 0</title>';
    for (let i = 0; i < shown; i++) {
      picture += `<text x="${start + i * step + 11}" y="26" text-anchor="middle" fill="var(--ink)" font-size="10">${i + 1}</text><text x="25" y="${start + i * step + 15}" text-anchor="end" fill="var(--ink)" font-size="10">${i + 1}</text>`;
      for (let j = 0; j < shown; j++) {
        const value = i === j ? 2 : Math.abs(i - j) === 1 ? -1 : 0;
        picture += `<rect x="${start + j * step}" y="${start + i * step}" width="23" height="23" fill="var(--panel)" stroke="var(--line)"/><text x="${start + j * step + 11}" y="${start + i * step + 15}" text-anchor="middle" fill="var(${value ? '--ink' : '--ink2'})" font-size="11">${value < 0 ? '−1' : value}</text>`;
      }
    }
    svg.innerHTML = picture;
    $('[data-pattern-caption]').textContent = n > shown ? '왼쪽 위 10×10 부분만 표시합니다. 같은 이웃 규칙이 나머지 행에도 이어집니다.' : `현재 ${n}×${n} 행렬 전체입니다. 숫자 0도 실제로 0인 원소입니다.`;
    chart($('[data-plot]'), [{ points: v.map((y, i) => [i + 1, y]) }, { points: av.map((y, i) => [i + 1, y]) }], { xlabel: '성분 번호', title: '입력 v · 실선 / 결과 Av · 점선' });
    const curves = $('[data-plot]').querySelectorAll('path[stroke-width="2.5"]');
    curves[1]?.setAttribute('stroke-dasharray', '6 4');
  }
  root.querySelectorAll('[data-large-n]').forEach(button => button.addEventListener('click', () => {
    $('#n').value = button.dataset.largeN;
    render();
  }, { signal: context.signal }));
  controls(root, context.signal, render);
}
