import { controls, loadJSON } from 'experiment-shared.js';

export async function mount(root, context) {
  const $ = selector => root.querySelector(selector);
  const data = await loadJSON(context, 'orb3d.json');
  const container = $('[data-volume]'), fallback = $('[data-plot]');
  const status = $('[data-render-status]'), THREE = globalThis.THREE;
  let renderer, scene, camera, surface, observer, themeObserver;
  let active = true, destroyed = false, selected = '', drag = null;
  const geometries = [], materials = [];

  function releaseSurface() {
    geometries.splice(0).forEach(geometry => geometry.dispose());
    materials.splice(0).forEach(material => material.dispose());
    surface?.clear();
  }
  function svgRender() {
    const rows = data[$('#orbital').value];
    const yaw = Number($('#yaw').value) * Math.PI / 180;
    const pitch = Number($('#pitch').value) * Math.PI / 180;
    const zoom = Number($('#zoom').value);
    const project = (x, y, z) => {
      const u = x * Math.cos(yaw) - z * Math.sin(yaw), v = x * Math.sin(yaw) + z * Math.cos(yaw);
      return [240 + 105 * zoom * u, 185 - 105 * zoom * (y * Math.cos(pitch) - v * Math.sin(pitch)), y * Math.sin(pitch) + v * Math.cos(pitch)];
    };
    const triangles = [];
    for (const mesh of rows) {
      const vertices = [];
      for (let i = 0; i < mesh.v.length; i += 3) vertices.push(project(...mesh.v.slice(i, i + 3)));
      for (let i = 0; i < mesh.f.length; i += 3) {
        const p = mesh.f.slice(i, i + 3).map(index => vertices[index]);
        const u = p[1].map((v, j) => (v - p[0][j]) * (j === 2 ? 105 : 1));
        const w = p[2].map((v, j) => (v - p[0][j]) * (j === 2 ? 105 : 1));
        const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
        const light = Math.abs((.35 * n[0] - .35 * n[1] + .87 * n[2]) / (Math.hypot(...n) || 1));
        triangles.push({ depth: p.reduce((sum, v) => sum + v[2], 0) / 3, sign: mesh.sign, p, shade: Math.round(45 + 55 * Math.min(1, light)) });
      }
    }
    triangles.sort((a, b) => a.depth - b.depth);
    fallback.setAttribute('viewBox', '0 0 480 370');
    fallback.innerHTML = '<title>WebGL 대체 화면: 같은 H₂ 오비탈 등값면의 SVG 투영</title>' + triangles.map(t => {
      const color = `color-mix(in srgb,var(--${t.sign > 0 ? 'n' : 'alpha'}) ${t.shade}%,var(--panel))`;
      return `<path d="M${t.p.map(p => p.slice(0, 2).join(',')).join('L')}Z" fill="${color}" stroke="${color}" stroke-width=".3"/>`;
    }).join('');
  }
  function fallbackMode(message) {
    if (destroyed) return;
    container.hidden = true; fallback.toggleAttribute('hidden', false);
    root.dataset.renderer = 'svg'; status.textContent = message;
    renderer?.dispose(); renderer = null; releaseSurface(); svgRender();
  }
  function buildSurface() {
    if (selected === $('#orbital').value) return;
    releaseSurface(); selected = $('#orbital').value;
    const css = getComputedStyle(root.ownerDocument.documentElement);
    for (const mesh of data[selected]) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(mesh.v, 3));
      geometry.setIndex(mesh.f); geometry.computeVertexNormals();
      const material = new THREE.MeshPhongMaterial({ color: css.getPropertyValue(mesh.sign > 0 ? '--n' : '--alpha').trim(), side: THREE.DoubleSide, shininess: 55 });
      geometries.push(geometry); materials.push(material); surface.add(new THREE.Mesh(geometry, material));
    }
  }
  function render() {
    const rows = data[$('#orbital').value];
    $('[data-sign]').textContent = rows.length === 1 ? '한 부호의 연결된 면' : '서로 반대 부호의 두 면';
    $('[data-surface]').textContent = rows.reduce((sum, mesh) => sum + mesh.f.length / 3, 0);
    if (!active || destroyed) return;
    if (!renderer) { svgRender(); return; }
    buildSurface();
    const width = Math.max(1, container.clientWidth), height = Math.max(1, container.clientHeight);
    renderer.setSize(width, height, false); camera.aspect = width / height;
    const distance = 4 / Number($('#zoom').value), yaw = Number($('#yaw').value) * Math.PI / 180, pitch = Number($('#pitch').value) * Math.PI / 180;
    camera.position.set(distance * Math.sin(yaw) * Math.cos(pitch), distance * Math.sin(pitch), distance * Math.cos(yaw) * Math.cos(pitch));
    camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
    renderer.setClearColor(getComputedStyle(root.ownerDocument.documentElement).getPropertyValue('--code').trim());
    renderer.render(scene, camera);
  }
  function destroy() {
    if (destroyed) return;
    destroyed = true; observer?.disconnect(); themeObserver?.disconnect(); releaseSurface();
    renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove(); renderer = null;
  }
  context.signal.addEventListener('abort', destroy, { once: true });
  try {
    if (!THREE) throw new Error('3D 라이브러리를 불러오지 못했습니다.');
    const canvas = root.ownerDocument.createElement('canvas');
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: false }) || canvas.getContext('webgl', { antialias: true, alpha: false });
    if (!gl) throw new Error('이 기기에서 WebGL을 사용할 수 없습니다.');
    renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: true });
    renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2));
    container.append(renderer.domElement); scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, 1, .1, 100); surface = new THREE.Group(); scene.add(surface);
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const light = new THREE.DirectionalLight(0xffffff, 2.4); light.position.set(3, 4, 5); scene.add(light);
    fallback.toggleAttribute('hidden', true); root.dataset.renderer = 'webgl';
    status.textContent = '드래그로 회전 · 휠로 확대 · 키보드는 시점·확대 슬라이더로 조작합니다. 색은 파동함수의 상대 부호입니다.';
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); fallbackMode('3D 연결이 끊겨 같은 등값면의 SVG 투영으로 전환했습니다. 시점 슬라이더는 계속 사용할 수 있습니다.'); }, { signal: context.signal });
    observer = new ResizeObserver(render); observer.observe(container);
    themeObserver = new MutationObserver(() => { selected = ''; render(); });
    themeObserver.observe(root.ownerDocument.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  } catch (error) {
    fallbackMode(error.message + ' 같은 등값면을 SVG 투영으로 표시합니다. 시점과 확대 슬라이더로 조작할 수 있습니다.');
  }
  container.addEventListener('pointerdown', event => { if (event.button !== 0) return; drag = { id: event.pointerId, x: event.clientX, y: event.clientY }; container.setPointerCapture(event.pointerId); }, { signal: context.signal });
  container.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    $('#yaw').value = Math.max(-180, Math.min(180, Number($('#yaw').value) + (event.clientX - drag.x) * .5));
    $('#pitch').value = Math.max(-75, Math.min(75, Number($('#pitch').value) + (event.clientY - drag.y) * .5));
    drag.x = event.clientX; drag.y = event.clientY; render();
  }, { signal: context.signal });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) container.addEventListener(type, () => { drag = null; }, { signal: context.signal });
  container.addEventListener('wheel', event => { event.preventDefault(); $('#zoom').value = Math.max(.7, Math.min(2, Number($('#zoom').value) - event.deltaY * .001)); render(); }, { passive: false, signal: context.signal });
  controls(root, context.signal, render);
  return { setActive(value) { active = value; if (active) render(); }, destroy };
}
