(() => {
  const system = matchMedia('(prefers-color-scheme: dark)');
  const apply = () => {
    let saved;
    try { saved = localStorage.getItem('note-theme'); } catch {}
    document.documentElement.dataset.theme = saved === 'light' || saved === 'dark' ? saved : system.matches ? 'dark' : 'light';
  };
  apply();
  system.addEventListener('change', apply);
  window.addEventListener('storage', event => { if (event.key === 'note-theme') apply(); });
})();
