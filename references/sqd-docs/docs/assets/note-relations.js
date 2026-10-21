/* Local relationship explorer. Positions are deterministic; no network or physics engine. */
(function () {
  'use strict';
  const app = document.querySelector('#relations-app');
  if (!app) return;
  const data = JSON.parse(document.getElementById('rg-data').textContent);
  const notes = new Map(data.notes.map(n => [n.id, n]));
  const groups = new Map(data.groups.map(g => [g.id, g]));
  const paths = new Map(data.paths.map(p => [p.id, p]));
  const bundled = !!document.querySelector('[data-page]');
  const $ = id => document.getElementById(id);
  const stage = $('rg-stage'), svg = $('rg-fig'), nodeLayer = $('rg-nodes');
  const inspector = $('rg-inspector'), input = $('rg-search'), results = $('rg-results');
  const kinds = {prerequisite: '선수 개념', application: '응용', related: '함께 읽기'};
  let pendingNote = null, composing = false, frame = 0, canSaveURL = true;

  function element(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }
  function button(text, action, cls = '') {
    const b = element('button', cls, text);
    b.type = 'button'; b.addEventListener('click', action);
    return b;
  }
  function link(slug, text, cls = '') {
    const a = element('a', cls, text);
    a.href = bundled ? '#' + slug : slug === 'home' ? 'concepts.html' : 'concept-' + slug + '.html';
    return a;
  }
  function active() { return !app.closest('[data-page]')?.hidden; }
  function readState() {
    const p = new URL(location.href).searchParams;
    const view = ['overview', 'note', 'path'].includes(p.get('graph-view')) ? p.get('graph-view') : 'overview';
    const path = paths.has(p.get('graph-path')) ? p.get('graph-path') : data.paths[0].id;
    let note = notes.has(p.get('graph-note')) ? p.get('graph-note') : 'hamiltonian';
    if (view === 'path' && !paths.get(path).steps.some(s => s.slug === note)) note = paths.get(path).steps[0].slug;
    return {view, path, note,
      group: groups.has(p.get('graph-group')) ? p.get('graph-group') : null,
      filter: Object.hasOwn(kinds, p.get('graph-filter')) ? p.get('graph-filter') : 'all'};
  }
  let state = readState();
  function remember() {
    if (!active() || !canSaveURL) return;
    const url = new URL(location.href);
    for (const key of ['view', 'note', 'group', 'filter', 'path']) url.searchParams.delete('graph-' + key);
    url.searchParams.set('graph-view', state.view);
    if (state.view === 'overview' && state.group) url.searchParams.set('graph-group', state.group);
    if (state.view !== 'overview') url.searchParams.set('graph-note', state.note);
    if (state.view === 'note' && state.filter !== 'all') url.searchParams.set('graph-filter', state.filter);
    if (state.view === 'path') url.searchParams.set('graph-path', state.path);
    // Some embedded HTML previews disallow rewriting their opaque URL. Keep
    // the explorer usable in memory when that optional persistence is denied.
    try { history.replaceState(history.state, '', url); }
    catch (error) { if (error.name === 'SecurityError') canSaveURL = false; else throw error; }
  }
  function connections(id) {
    return data.edges.filter(e => e.from === id || e.to === id)
      .filter(e => state.filter === 'all' || e.type === state.filter)
      .map(e => ({edge: e, note: notes.get(e.from === id ? e.to : e.from)}))
      .sort((a, b) => Object.keys(kinds).indexOf(a.edge.type) - Object.keys(kinds).indexOf(b.edge.type)
        || a.note.label.localeCompare(b.note.label, 'ko'));
  }
  function relationLabel(edge, center) {
    if (edge.type === 'prerequisite') return edge.to === center ? '먼저 이해하기' : '이 개념을 바탕으로';
    if (edge.type === 'application') return edge.from === center ? '응용해서 보기' : '응용의 바탕';
    return '함께 읽기';
  }
  function closeSearch() { $('rg-search-pop').hidden = true; }
  function chooseNote(id) {
    state.note = id; state.view = 'note'; state.filter = 'all';
    input.value = ''; closeSearch();
    render(true);
    nodeLayer.querySelector('[data-rg-key="' + id + '"]')?.focus({preventScroll: true});
  }
  function sizeStage(height) {
    stage.style.height = height + 'px';
    svg.setAttribute('viewBox', '0 0 ' + stage.clientWidth + ' ' + height);
    svg.replaceChildren(); nodeLayer.replaceChildren();
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    for (const kind of ['prerequisite', 'application', 'overview', 'path']) {
      const marker = document.createElementNS(svg.namespaceURI, 'marker');
      for (const [k,v] of Object.entries({id:'rg-arrow-' + kind, viewBox:'0 0 10 10', refX:9, refY:5, markerWidth:6, markerHeight:6, orient:'auto-start-reverse'})) marker.setAttribute(k,v);
      const triangle = document.createElementNS(svg.namespaceURI, 'path');
      triangle.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
      triangle.setAttribute('class', 'rg-arrow rg-' + kind);
      marker.append(triangle); defs.append(marker);
    }
    svg.append(defs);
  }
  function line(d, kind, id, reversed = false, dim = false) {
    const p = document.createElementNS(svg.namespaceURI, 'path');
    p.setAttribute('d', d);
    p.setAttribute('class', 'rg-edge rg-' + kind + (dim ? ' is-dim' : ''));
    if (id) p.dataset.rgEdge = id;
    if (kind !== 'related') p.setAttribute(reversed ? 'marker-start' : 'marker-end', 'url(#rg-arrow-' + kind + ')');
    svg.append(p);
  }
  function graphNode({id, title, badge, group, x, y, w, h, selected, action, footer}) {
    const b = button('', action, 'rg-node' + (selected ? ' is-selected' : ''));
    b.dataset.rgKey = id;
    b.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;--rg-color:var(--${groups.get(group)?.color || 'accent'});`;
    b.setAttribute('aria-pressed', String(!!selected));
    b.setAttribute('aria-label', title + ' · ' + badge);
    b.append(element('span', 'rg-node-badge', badge), element('strong', '', title));
    if (footer) b.append(element('span', 'rg-node-footer', footer));
    nodeLayer.append(b);
  }
  function panelHeading(kicker, title, summary) {
    inspector.replaceChildren(element('p', 'rg-kicker', kicker));
    const h = element('h2', '', title); h.id = 'rg-detail-title'; h.tabIndex = -1;
    inspector.append(h, element('p', 'rg-summary', summary));
  }
  function noteRow(note, badge, action, reason) {
    const b = button('', action, 'rg-note-row'); b.dataset.rgNote = note.id;
    b.append(element('small', '', badge), element('strong', '', note.title));
    if (reason) b.append(element('span', '', reason));
    return b;
  }
  function overview() {
    const width = stage.clientWidth, narrow = width < 620;
    const w = narrow ? Math.min(160, (width - 32) / 2) : (width - 106) / 3;
    const h = narrow ? 126 : 130;
    const positions = narrow ? [
      [(width-w)/2, 16], [8, 206], [width-w-8, 206], [8, 410], [width-w-8, 410],
    ] : [[12, 140], [(width-w)/2, 30], [(width-w)/2, 270], [width-w-12, 30], [width-w-12, 270]];
    sizeStage(narrow ? 560 : 434);
    const box = new Map(data.groups.map((g, i) => [g.id, {x:positions[i][0], y:positions[i][1]}]));
    for (const edge of data.overview) {
      const a = box.get(edge.from), b = box.get(edge.to);
      if (narrow) {
        const sx = a.x+w/2, sy = a.y+h+3, tx = b.x+w/2, ty = b.y-5;
        line(`M${sx},${sy} C${sx},${(sy+ty)/2} ${tx},${(sy+ty)/2} ${tx},${ty}`, 'overview', null, false,
          state.group && edge.from !== state.group && edge.to !== state.group);
      } else {
        const sx=a.x+w+3, sy=a.y+h/2, tx=b.x-5, ty=b.y+h/2;
        line(`M${sx},${sy} C${(sx+tx)/2},${sy} ${(sx+tx)/2},${ty} ${tx},${ty}`, 'overview', null, false,
          state.group && edge.from !== state.group && edge.to !== state.group);
      }
    }
    data.groups.forEach((g,i) => graphNode({id:g.id, title:g.title, badge:String(i+1).padStart(2,'0') + ' · ' + g.notes.length + '개 노트',
      group:g.id, x:positions[i][0], y:positions[i][1], w, h, selected:state.group === g.id,
      footer:'노트 펼치기 →', action:() => {
        state.group = g.id; render();
        if (window.innerWidth < 900) inspector.scrollIntoView({block:'nearest'});
        $('rg-detail-title').focus({preventScroll:true});
      }}));
    $('rg-heading').textContent = '분야 사이의 연결';
    $('rg-count').textContent = data.groups.length + '개 분야 · ' + notes.size + '개 노트';
    $('rg-help').textContent = '분야를 누르면 노트 목록이 펼쳐집니다. 선은 분야 사이의 대표 연결입니다.';
    $('rg-legend').textContent = '화살표 → 배운 개념을 이어서 활용하는 방향';
    if (state.group) {
      const g = groups.get(state.group);
      panelHeading(g.notes.length + '개 노트', g.title, g.summary);
      inspector.append(link(g.id, '이 분야의 학습 지도 열기 →', 'rg-map-link'));
      const list = element('div', 'rg-note-list');
      g.notes.forEach((id,i) => list.append(noteRow(notes.get(id), String(i+1).padStart(2,'0'), () => chooseNote(id))));
      inspector.append(list);
    } else {
      panelHeading('전체에서 하나의 개념으로', '어디서부터 볼까요?', '분야를 펼치거나, 아래 개념에서 연결을 따라가 보세요.');
      const list = element('div', 'rg-note-list');
      for (const id of ['quantum-state', 'hamiltonian', 'vqe-algorithm', 'sqd-state-circuit']) {
        const n = notes.get(id);
        list.append(noteRow(n, groups.get(n.group).title, () => chooseNote(id), n.question));
      }
      inspector.append(list);
    }
  }
  function focusGraph() {
    const center = notes.get(state.note), neighbors = connections(state.note);
    const width = stage.clientWidth, narrow = width < 550;
    const h = 102, w = narrow ? width-44 : (width-78)/2;
    const cw = Math.min(280,width-32), cx=(width-cw)/2, cy=18, ch=104;
    const rows = narrow ? neighbors.length : Math.ceil(neighbors.length/2);
    sizeStage(Math.max(288, 180+rows*(h+18)));
    graphNode({id:center.id, title:center.label, badge:'선택한 노트 · '+groups.get(center.group).title,
      group:center.group, x:cx,y:cy,w:cw,h:ch,selected:true,action:() => {
        inspector.scrollIntoView({block:'nearest'}); $('rg-detail-title').focus({preventScroll:true});
      }});
    neighbors.forEach(({edge,note},i) => {
      const left = i%2 === 0;
      const x = narrow ? 34 : left ? 12 : width-w-12;
      const y = 170 + (narrow ? i : Math.floor(i/2))*(h+18);
      const sy=cy+ch+3, ty=y+h/2;
      const d = narrow ? `M${width/2},${sy} C${width/2},${sy+20} 16,${sy+20} 16,${sy+38} V${ty} H${x-4}`
        : `M${width/2},${sy} V${ty-12} Q${width/2},${ty} ${width/2+(left?-12:12)},${ty} H${left?x+w+4:x-4}`;
      line(d,edge.type,note.id,edge.to===center.id);
      graphNode({id:note.id,title:note.label,badge:relationLabel(edge,center.id),group:note.group,
        x,y,w,h,selected:false,action:() => chooseNote(note.id),footer:groups.get(note.group).title});
    });
    if (!neighbors.length) {
      const empty = element('p','rg-empty','이 종류로 등록된 연결은 없습니다. 다른 연결 종류를 선택해 보세요.');
      nodeLayer.append(empty);
    }
    $('rg-heading').textContent = center.label + '의 연결';
    $('rg-count').textContent = neighbors.length + '개 연결';
    $('rg-help').textContent = '이웃 노트를 누르면 그 노트가 중심이 됩니다. 아래로 스크롤하면 나머지 연결을 볼 수 있습니다.';
    $('rg-legend').replaceChildren();
    for (const [kind,label] of Object.entries(kinds)) {
      const item=element('span','rg-legend-item');
      item.append(element('i','rg-line-key rg-'+kind),element('span','',label+(kind==='related'?'':' →')));
      $('rg-legend').append(item);
    }
    panelHeading(groups.get(center.group).title+' · '+center.kind, center.title, center.question);
    inspector.append(link(center.id,'노트 열기 →','rg-open-note'));
    const list=element('div','rg-note-list');
    neighbors.forEach(({edge,note}) => list.append(noteRow(note,relationLabel(edge,center.id),() => chooseNote(note.id))));
    inspector.append(element('h3','','연결된 노트'),list);
    if (!neighbors.length) inspector.append(element('p','rg-summary','선택한 종류의 연결이 없습니다.'));
  }
  function pathGraph() {
    const path=paths.get(state.path), width=stage.clientWidth, w=width-64, h=96;
    sizeStage(20+path.steps.length*132);
    path.steps.forEach((step,i) => {
      const note=notes.get(step.slug), y=16+i*132;
      if(i) line(`M${width/2},${y-34} V${y-5}`,'path',null);
      graphNode({id:note.id,title:note.label,badge:`${i+1} / ${path.steps.length} · ${groups.get(note.group).title}`,
        group:note.group,x:32,y,w,h,selected:state.note===note.id,action:() => {
          state.note=note.id; render();
          if(window.innerWidth<900) inspector.scrollIntoView({block:'nearest'});
          $('rg-detail-title').focus({preventScroll:true});
        }});
    });
    const note=notes.get(state.note), step=path.steps.find(s=>s.slug===state.note);
    $('rg-heading').textContent=path.title;
    $('rg-count').textContent=path.steps.length+'개 노트';
    $('rg-help').textContent=path.summary;
    $('rg-legend').textContent='번호 → 이 목표를 위한 추천 읽기 순서';
    panelHeading('이 단계에서 알아볼 것',note.title,step.why);
    inspector.append(element('p','rg-summary',note.question),link(note.id,'노트 열기 →','rg-open-note'));
    inspector.append(button('이 노트의 다른 연결 보기',()=>chooseNote(note.id),'rg-secondary'));
    const list=element('ol','rg-path-list');
    path.steps.forEach(s=>{
      const li=element('li',''); li.append(link(s.slug,notes.get(s.slug).label)); list.append(li);
    });
    inspector.append(element('h3','','이 경로의 노트'),list);
  }
  function render(resetScroll = false) {
    if (!active() || stage.clientWidth < 1) return;
    const focused = document.activeElement?.dataset.rgKey;
    const scroll = $('rg-viewport').scrollTop;
    app.querySelectorAll('[data-rg-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rgView===state.view)));
    app.querySelectorAll('[data-rg-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rgFilter===state.filter)));
    app.querySelectorAll('[data-rg-path]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rgPath===state.path)));
    $('rg-filters').hidden=state.view!=='note'; $('rg-paths').hidden=state.view!=='path';
    ({overview,note:focusGraph,path:pathGraph})[state.view]();
    remember();
    $('rg-viewport').scrollTop=resetScroll?0:scroll;
    if(focused) nodeLayer.querySelector('[data-rg-key="'+focused+'"]')?.focus({preventScroll:true});
    $('rg-live').textContent=$('rg-heading').textContent+' · '+$('rg-count').textContent;
  }
  function schedule() { cancelAnimationFrame(frame); frame=requestAnimationFrame(()=>render()); }
  app.querySelectorAll('[data-rg-view]').forEach(b=>b.addEventListener('click',()=>{
    state.view=b.dataset.rgView;
    if(state.view==='path'&&!paths.get(state.path).steps.some(s=>s.slug===state.note)) state.note=paths.get(state.path).steps[0].slug;
    closeSearch(); render(true);
  }));
  app.querySelectorAll('[data-rg-filter]').forEach(b=>b.addEventListener('click',()=>{
    state.filter=b.dataset.rgFilter; render(true);
  }));
  data.paths.forEach(path=>{
    const b=button(path.title,()=>{state.path=path.id;state.note=path.steps[0].slug;render(true);});
    b.dataset.rgPath=path.id; b.setAttribute('aria-pressed',String(state.path===path.id)); $('rg-paths').append(b);
  });
  function normalize(text) {
    return text.normalize('NFKC').toLowerCase().replace(/큐비트/g,'큐빗').replace(/백터/g,'벡터')
      .replace(/슈레딩거|슈뢰덴거/g,'슈뢰딩거').replace(/[^\p{L}\p{N}]/gu,'');
  }
  function search() {
    const query=normalize(input.value); results.replaceChildren();
    if(!query){closeSearch();return;}
    const found=data.notes.filter(n=>normalize(n.title+' '+n.id).includes(query));
    $('rg-search-pop').hidden=false;
    $('rg-search-status').textContent=found.length ? found.length+'개 결과'+(found.length>8?' · 상위 8개 표시':'') : '일치하는 노트가 없습니다. 더 짧은 이름으로 찾아보세요.';
    found.slice(0,8).forEach(n=>{
      const li=element('li','');
      li.append(noteRow(n,groups.get(n.group).title,()=>chooseNote(n.id))); results.append(li);
    });
  }
  input.addEventListener('input',()=>{if(!composing)search();});
  input.addEventListener('focus',()=>{if(input.value&&!composing)search();});
  input.addEventListener('compositionstart',()=>{composing=true;});
  input.addEventListener('compositionend',()=>{composing=false;search();});
  input.addEventListener('keydown',e=>{
    if(composing||e.isComposing||e.keyCode===229)return;
    const first=results.querySelector('button');
    if(e.key==='ArrowDown'&&first){e.preventDefault();first.focus();}
    if(e.key==='Enter'&&first){e.preventDefault();first.click();}
    if(e.key==='Escape'){closeSearch();input.focus();}
  });
  results.addEventListener('keydown',e=>{
    const all=Array.from(results.querySelectorAll('button')),i=all.indexOf(document.activeElement);
    if(e.key==='Escape'){closeSearch();input.focus();return;}
    if(!['ArrowDown','ArrowUp'].includes(e.key)||i<0)return;
    e.preventDefault();
    if(e.key==='ArrowUp'&&i===0)input.focus();
    else all[Math.max(0,Math.min(all.length-1,i+(e.key==='ArrowDown'?1:-1)))].focus();
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest('.rg-search'))closeSearch();
    const a=e.target.closest('a[data-rg-focus], #reader-relations-open');
    if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    const id=a.dataset.rgFocus || document.querySelector('[data-page]:not([hidden])')?.dataset.page;
    if(notes.has(id)) {
      state.note=id;state.view='note';state.filter='all';
      if(active())render(true); else pendingNote=id;
    }
  });
  function highlight(id) { svg.querySelectorAll('[data-rg-edge]').forEach(e=>e.classList.toggle('is-highlighted',e.dataset.rgEdge===id)); }
  nodeLayer.addEventListener('pointerover',e=>highlight(e.target.closest('[data-rg-key]')?.dataset.rgKey));
  nodeLayer.addEventListener('pointerleave',()=>highlight(null));
  nodeLayer.addEventListener('focusin',e=>highlight(e.target.closest('[data-rg-key]')?.dataset.rgKey));
  nodeLayer.addEventListener('focusout',()=>highlight(null));
  window.addEventListener('hashchange',()=>{
    closeSearch();
    // The reader router runs in the same hashchange; wait until its visibility update.
    requestAnimationFrame(()=>{
      if(!active())return;
      if(pendingNote){state.note=pendingNote;state.view='note';state.filter='all';pendingNote=null;}
      else if(canSaveURL) state=readState();
      render(true);
    });
  });
  window.addEventListener('resize',schedule);
  if(typeof ResizeObserver==='function')new ResizeObserver(schedule).observe(stage);
  schedule();
})();
