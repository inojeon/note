import assert from 'node:assert/strict';

/** Fixed pedagogical examples, measured counts and invariants visible in the labs.
 * These checks do not reproduce the model's implementation to manufacture answers. */
export async function runQuantumPathSemantics(page, { baseURL }) {
  let checks = 0;
  const load = async id => {
    const response = await page.goto(new URL(`experiments/${id}/`, baseURL).href);
    assert.equal(response.status(), 200, id);
    await page.waitForSelector('body[data-state="ready"]', { timeout: 30000 });
    checks++;
  };
  const input = async (selector, value) => page.locator(selector).evaluate((el, value) => {
    el.value = String(value); el.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
  const text = selector => page.locator(selector).innerText();
  const data = (selector, key) => page.locator(selector).evaluate((el, key) => el.dataset[key], key);
  const values = async (selector, key = 'values') => JSON.parse(await data(selector, key));
  const equal = (a, b, why) => { assert.deepEqual(a, b, why); checks++; };
  const near = (a, b, why, tolerance = 1e-5) => { assert(Math.abs(Number(a) - b) <= tolerance, `${why}: ${a} ≠ ${b}`); checks++; };
  const includes = async (selector, pattern) => { assert.match(await text(selector), pattern); checks++; };

  await load('two-level-system');
  equal(await values('#bt-probabilities'), [.36,.64,0], 'no leakage');
  await page.locator('[data-bt-leak="10"]').click();
  (await values('#bt-probabilities')).forEach((p,i)=>near(p,[.324,.576,.1][i],'10% outside the chosen subspace'));
  near(await data('#bt-retained','value'), .9, 'retained probability is not silently normalized');
  await page.locator('#bt-pair').selectOption('0,2');
  await page.locator('[data-bt-leak="0"]').click();
  near(await text('#bt-energy'), 1.92, 'A,C weighted mean');

  await load('qubit');
  await page.locator('#bq-state').selectOption('threefour');
  near(await data('#bq-p0','value'), .36, '3:4 amplitudes give 36:64 probabilities');
  await page.locator('[data-bq-example="plus,Z"]').click();
  near(await data('#bq-p0','value'), .5, '+ in Z');
  await page.locator('[data-bq-example="plus,X"]').click();
  near(await data('#bq-p0','value'), 1, '+ in X');
  await page.locator('[data-bq-example="minus,X"]').click();
  near(await data('#bq-p0','value'), 0, '− in X');

  await load('computational-basis');
  await page.locator('#bc-preset').selectOption('null');
  await includes('#bc-verdict', /유효한 양자 상태가 아닙니다/);
  await page.locator('#bc-preset').selectOption('two01');
  equal(await values('#bc-vector'), [0,1,0,0], '01 is the second of four basis vectors');
  await page.locator('#bc-preset').selectOption('two10');
  equal(await values('#bc-vector'), [0,0,1,0], '10 is the third basis vector');

  await load('quantum-gate');
  await page.locator('#bg-gate').selectOption('X');
  equal(await values('#bg-out-vector'), [[0,0],[1,0]], 'X sends 0 to 1');
  await page.locator('#bg-times').selectOption('2');
  equal(await values('#bg-out-vector'), [[1,0],[0,0]], 'X²=I');
  await page.locator('#bg-gate').selectOption('H');
  const hh = await values('#bg-out-vector'); near(hh[0][0],1,'H² restores input');near(hh[1][0],0,'H² cancels second amplitude');
  await page.locator('#bg-input').selectOption('plus');
  await page.locator('#bg-gate').selectOption('Z');
  await page.locator('#bg-times').selectOption('1');
  assert((await values('#bg-out-vector'))[1][0]<0,'Z changes relative sign');checks++;
  near(await text('#bg-out-norm'),1,'unitary norm');

  await load('rotation-gate');
  await page.locator('#br-sixty').click();
  await includes('#br-p1', /25\.00%/);
  await includes('#br-half-angle', /30/);
  const probabilities = [await text('#br-p0'),await text('#br-p1')];
  await page.locator('#br-view-top').click();
  equal([await text('#br-p0'),await text('#br-p1')],probabilities,'camera does not change probabilities');
  await page.locator('#br-double').click();
  await includes('#br-p0', /100\.00%/);
  await includes('#br-half-angle', /360/);

  await load('measurement-basis');
  await page.locator('#bm-state').selectOption('plus');
  await page.locator('#bm-basis').selectOption('X');
  near(await data('#bm-overlap','value'),1,'plus overlaps itself');
  await page.locator('#bm-state').selectOption('plusi');
  await page.locator('#bm-basis').selectOption('Y');
  near(await data('#bm-overlap','value'),1,'Y uses the conjugated bra');
  await includes('#bm-readout-circuit',/S† → 하다마드/);

  await load('tensor-product');
  await page.locator('[data-bp-preset="90,0"]').click();
  let product = await values('#bp-lab','coefficients');
  near(product[1],0,'+⊗0 excludes 01');near(product[3],0,'+⊗0 excludes 11');
  near(product[0]**2,.5,'00 probability');near(product[2]**2,.5,'10 probability');
  await page.locator('[data-bp-preset="90,90"]').click();
  product = await values('#bp-lab','coefficients'); product.forEach(x=>near(x,.5,'+⊗+ amplitude is 1/2'));
  equal(await page.locator('#bp-products tr').count(),4,'four explicit products');

  await load('entanglement');
  await page.locator('#bn-state').selectOption('bell');
  await page.locator('#bn-basis').selectOption('x');
  let p=await values('#bn-lab','probabilities');[.5,0,0,.5].forEach((x,i)=>near(p[i],x,'Bell X probabilities'));
  equal(await values('#bn-comparison'),[1,1],'Bell correlated in both bases');
  await page.locator('#bn-state').selectOption('mixture');
  equal(await values('#bn-lab','probabilities'),[.25,.25,.25,.25],'classical mixture in X');
  equal(await values('#bn-comparison'),[1,.5],'classical correlation differs in X');

  await load('energy-measurement');
  near(await data('#be-direct','value'),.8,'preserved common-model initial state');
  await page.locator('#be-model').selectOption('x');
  near(await data('#be-direct','value'),0,'H=X, |0> mean is zero');
  await includes('#be-plow',/50\.000%/); await includes('#be-phigh',/50\.000%/);
  await page.locator('#be-plus').click();
  near(await data('#be-direct','value'),1,'H=X, |+> is +1 eigenstate');
  await page.locator('#be-ground').click();
  near(await data('#be-direct','value'),-1,'H=X ground preset follows selected model');
  await page.locator('#be-excited').click();
  near(await data('#be-direct','value'),1,'H=X excited preset wraps angle into slider range');
  await includes('#be-phigh',/100\.000%/);

  await load('energy-expectation');
  near(await text('#ve-energy'),.8,'zero-state expectation');
  await page.locator('#ve-plus').click();near(await text('#ve-energy'),.5,'plus expectation');near(await text('#ve-cross'),-.5,'plus cross term');
  await page.locator('#ve-minus').click();near(await text('#ve-energy'),1.5,'minus expectation');near(await text('#ve-cross'),.5,'minus cross term');
  await page.locator('#ve-ground').click();near(await text('#ve-energy'),.461484,'known minimum',1e-6);

  await load('ansatz');
  await page.locator('#va-best').click();near(await text('#va-energy'),.576795,'restricted minimum',1e-6);near(await text('#va-search-gap'),0,'optimized within restricted set');
  assert(Number(await text('#va-gap'))>.11,'candidate restriction still costs energy');checks++;
  await page.locator('#va-mode').selectOption('full');await page.locator('#va-best').click();near(await text('#va-energy'),.461484,'expanded candidate set includes ground',1e-6);near(await text('#va-gap'),0,'restriction removed');
  await includes('#va-status',/넓은 후보에는.*바닥상태가 포함/);

  await load('parameterized-circuit');
  await page.locator('#vpc-plus').click();near(await text('#vpc-energy'),.5,'+90 energy');const plusP=await text('#vpc-p0');
  await page.locator('#vpc-minus').click();near(await text('#vpc-energy'),1.5,'−90 energy');equal(await text('#vpc-p0'),plusP,'phase changes energy but not Z probability');

  await load('pauli-decomposition');
  await page.locator('[data-vp-preset="90"]').click();near(await data('#vp-x','value'),1,'X mean');near(await data('#vp-z','value'),0,'Z mean');near(await data('#vp-energy','value'),.5,'Pauli sum');
  equal(await page.locator('#vp-terms tr').count(),3,'three terms in arithmetic table');
  await page.locator('[data-vp-preset="-90"]').click();near(await data('#vp-energy','value'),1.5,'negative X eigenstate');

  await load('measurement-shots');
  const num=async id=>Number(await data('#vs-'+id,'value'));
  equal(await num('xplus')+await num('xminus'),100,'X count conservation');equal(await num('zplus')+await num('zminus'),100,'Z count conservation');equal(await num('total'),200,'N per term requires 2N preparations');
  const se=await num('se');await page.locator('#vs-shots').selectOption('10000');near(await num('se'),se/10,'100x shots shrink theoretical SE tenfold');equal(await num('total'),20000,'larger total budget');
  const means=await values('#vs-arithmetic','means');assert(means.every(x=>x>=-1&&x<=1),'count means bounded');checks++;

  await load('classical-optimization');
  await page.locator('#vo-step').click();near(parseFloat(await text('#vo-angle')),28.648,'first radian update displayed in degrees',.002);near(await data('#vo-update','gradient'),-.5,'known first gradient');near(await text('#vo-energy'),.584771,'first energy',2e-6);
  await page.locator('#vo-run').click();assert(Number(await text('#vo-gap'))<.0001,'small-model convergence after 21 updates');checks++;

  await load('vqe-algorithm');
  for(let i=0;i<3;i++)await page.locator('#vl-next').click();near(await text('#vl-energy'),.8,'first central evaluation');equal(await data('#vl-cost','evaluations'),'1','one center evaluation');
  await page.locator('#vl-next').click();equal(await data('#vl-cost','evaluations'),'3','two shifted evaluations counted');near(await text('#vl-energy'),.8,'old energy remains correctly labelled at update');await includes('#vl-stage',/이전 각도/);

  await load('vqe-hydrogen');
  near(await data('#vh-energy','value'),-1.1167593073964255,'stored HF reference',1e-9);
  await page.locator('#vh-reference').click();near(await data('#vh-energy','value'),-1.1372838344885021,'stored FCI result',1e-9);
  const hc=await values('#vh-populations','coefficients');near(hc[1],-.11254388689316025,'rare negative amplitude',1e-8);near(hc[0]**2+hc[1]**2,1,'real molecule normalization');await includes('#vh-conditions',/핵 반발 포함/);

  await load('occupation-bitstrings');
  for(const bits of ['0101','1010','1001','0110']){await page.locator(`[data-sob-preset="${bits}"]`).click();equal(await data('#sob-status','valid'),'true',bits+' has one alpha and beta');}
  await page.locator('[data-sob-preset="0011"]').click();equal(await data('#sob-total','value'),'2','total particle number can still match');equal(await data('#sob-status','valid'),'false','spin counts reject 0011');

  await load('fermion-qubit');
  await page.locator('#vm-preset-empty').click();await page.locator('#vm-create').selectOption('2');equal(await data('#vm-created','bits'),'0100','create p=2 in vacuum');equal(await data('#vm-created','sign'),'1','vacuum sign');
  await page.locator('#vm-ag').check();equal(await data('#vm-created','bits'),'0101','create after lower occupied orbital');equal(await data('#vm-created','sign'),'-1','one lower occupation gives minus');
  await page.locator('#vm-au').check();equal(await data('#vm-created','sign'),'1','two lower occupations give plus');
  await page.locator('#vm-bg').check();equal(await data('#vm-created','sign'),'0','Pauli exclusion returns zero vector');

  await load('hf-preparation');
  await page.locator('[data-shf-step="1"]').click();equal(await data('#shf-state','value'),'0001','normal first X');
  await page.locator('#shf-order').selectOption('20');equal(await data('#shf-state','value'),'0100','reversed first X');
  await page.locator('[data-shf-step="2"]').click();equal(await data('#shf-state','value'),'0101','commuting X gates finish at same occupation');

  await load('excitation-state');
  near(await data('#sex-energy','value'),.5,'equal positive amplitudes');const before=await values('#sex-state','probabilities');
  await page.locator('#sex-sign').selectOption('-1');near(await data('#sex-energy','value'),1.5,'relative sign changes energy');equal(await values('#sex-state','probabilities'),before,'relative sign preserves occupation probabilities');

  await load('sqd-state-circuit');
  await input('#ssc-theta',60);
  for(let i=0;i<3;i++)await page.locator('#ssc-next').click();near(await data('#ssc-sector','validProbability'),0,'three-electron intermediate is honestly shown');
  for(let i=0;i<3;i++)await page.locator('#ssc-next').click();near(await data('#ssc-sector','validProbability'),.25,'only 1010 branch lies in target sector at step 6');
  await page.locator('#ssc-finish').click();near(await data('#ssc-sector','validProbability'),1,'final target sector restored');const sc=await values('#ssc-amplitudes');near(sc[5]**2,.75,'final 0101 probability');near(sc[10]**2,.25,'final 1010 probability');near(sc.reduce((sum,c)=>sum+c*c,0),1,'full circuit norm');

  await load('sqd-sampling');
  await page.locator('[data-ssa-angle="0"]').click();await page.locator('#ssa-hundred').click();equal(await values('#ssa-counts','counts'),[100,0],'zero angle deterministic');near(await data('#ssa-discovery','value'),0,'zero-probability configuration never discovered');
  await page.locator('[data-ssa-angle="180"]').click();await page.locator('#ssa-hundred').click();equal(await values('#ssa-counts','counts'),[0,100],'180 angle deterministic');
  await page.locator('[data-ssa-angle="60"]').click();await page.locator('#ssa-budget').selectOption('1');near(await data('#ssa-discovery','value'),.25,'one-shot discovery equals Born probability');equal(await values('#ssa-counts','counts'),[0,0],'forecast does not fabricate measured samples');

  await load('sqd-subspace');
  await page.locator('[data-ssu-preset="rare"]').click();const rare=await values('#ssu-state','coefficients');near(await data('#ssu-energy','value'),.4614835192865496,'known lowest eigenvalue',1e-10);
  await page.locator('[data-ssu-preset="balanced"]').click();equal(await values('#ssu-state','coefficients'),rare,'same support produces identical optimized state');near(await data('#ssu-residual','value'),0,'eigenpair residual');near((await values('#ssu-comparison','probabilities'))[0],.6856953381770519,'optimized population differs from both input frequencies',1e-10);
  await page.locator('[data-ssu-preset="hf"]').click();near(await data('#ssu-energy','value'),.8,'single determinant subspace');await page.locator('[data-ssu-preset="excited"]').click();near(await data('#ssu-energy','value'),1.2,'other determinant subspace');
  return { checks, experiments:24 };
}
