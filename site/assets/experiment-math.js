/** Render only formulas authored or changed by an interactive model.
 * Static formulas are already rendered by Hugo. No scanning of ordinary prose.
 */
export function observeMath(root, signal) {
  if (signal.aborted) return () => {};
  if (!globalThis.katex?.render) throw new Error('실험 수식 렌더러 KaTeX를 불러오지 못했습니다.');
  const selector = '.math-tex[data-tex]';
  const rendered = new WeakMap();
  let stopped = false;
  const formulas = node => node.nodeType === 1
    ? [...(node.matches(selector) ? [node] : []), ...node.querySelectorAll(selector)]
    : [];
  for (const formula of formulas(root)) {
    if (formula.querySelector('.katex')) rendered.set(formula, formula.dataset.tex);
  }
  const render = formula => {
    if (!root.contains(formula) || !formula.isConnected) return;
    const tex = formula.dataset.tex;
    if (rendered.get(formula) === tex && formula.querySelector('.katex')) return;
    try {
      globalThis.katex.render(tex, formula, {
        displayMode: false,
        output: 'htmlAndMathml',
        throwOnError: true,
        strict: 'error',
        trust: false
      });
      rendered.set(formula, tex);
    } catch (cause) {
      throw new Error(`실험 수식을 렌더링할 수 없습니다: ${tex.slice(0, 160)}`, { cause });
    }
  };
  const observer = new MutationObserver(records => {
    if (stopped || signal.aborted) return;
    const pending = new Set();
    for (const record of records) {
      const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
      if (!target || target.closest('.katex,script,style,svg')) continue;
      const formula = target.closest(selector);
      if (formula) pending.add(formula);
      for (const node of record.addedNodes) formulas(node).forEach(el => pending.add(el));
    }
    if (!pending.size) return;
    // Our own KaTeX DOM changes must not schedule another rendering pass.
    observer.disconnect();
    try {
      pending.forEach(render);
    } catch (error) {
      stopped = true;
      // A thrown observer error reaches the runner's global error handler.
      throw error;
    }
    if (!stopped && !signal.aborted) observe();
  });
  const observe = () => observer.observe(root, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['data-tex']
  });
  const stop = () => { stopped = true; observer.disconnect(); };
  signal.addEventListener('abort', stop, { once: true });
  // This also supports an unrendered formula added by a custom page template.
  for (const formula of formulas(root)) render(formula);
  observe();
  return stop;
}
