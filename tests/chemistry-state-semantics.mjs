import assert from 'node:assert/strict';

/** Independent examples and distinctions taught in states/atoms, using displayed
 * results. Actual stored H2 data are checked against their preserved conditions. */
export async function runChemistryStateSemantics(page, {baseURL}) {
  let checks=0;
  const load=async id=>{const response=await page.goto(new URL(`experiments/${id}/`,baseURL).href);assert.equal(response.status(),200,id);await page.waitForSelector('body[data-state="ready"]',{timeout:30000});};
  const near=(value,expected,tol=1e-9)=>{assert.ok(Math.abs(value-expected)<=tol,`${value} expected ${expected}`);checks++;};
  const number=async selector=>Number((await page.locator(selector).textContent()).replaceAll('−','-').replace(/[^0-9.eE+\-]/g,''));
  const data=async(selector,key)=>Number(await page.locator(selector).getAttribute('data-'+key));
  const input=async(selector,value)=>page.locator(selector).evaluate((element,next)=>{element.value=String(next);element.dispatchEvent(new Event('input',{bubbles:true}));},value);

  await load('quantum-state');near(await data('#qstate-rotated','first'),.6);near(await data('#qstate-rotated','second'),.8);
  await page.locator('#qstate-aligned').click();near(await data('#qstate-rotated','first'),1);near(await data('#qstate-rotated','second'),0);near(await data('#qstate-norm','norm'),1);
  await page.locator('#qstate-quarter').click();near(await data('#qstate-rotated','first'),.8);near(await data('#qstate-rotated','second'),-.6);
  await page.locator('.lab-reset').click();near(await data('#qstate-rotated','first'),.6);

  await load('born-rule');near(await data('#born-result-zero','probability'),.36);near(await data('#born-result-one','probability'),.64);
  await page.locator('#born-rational-negative').click();near(await data('#born-result-zero','probability'),.36);near(await data('#born-result-one','probability'),.64);
  assert.match(await page.locator('#born-vector').innerText(),/−0.600/);checks++;
  await page.locator('#born-certain').click();near(await data('#born-result-one','probability'),1);

  await load('superposition');near(await data('#phase-status','plus'),1);
  await page.locator('[data-phase-angle="180"]').click();near(await data('#phase-status','plus'),0);
  await page.locator('[data-phase-mode="mixed"]').click();near(await data('#phase-status','plus'),.5);assert(await page.locator('#phase-angle').isDisabled());assert(await page.locator('#phase-state-formula').isHidden());checks+=2;
  await page.locator('[data-phase-angle="0"]').click();near(await data('#phase-status','plus'),1);assert(await page.locator('#phase-angle').isEnabled());checks++;
  await page.locator('[data-phase-mode="mixed"]').click();await page.locator('.lab-reset').click();near(await data('#phase-status','plus'),1);

  await load('observable');near(await data('#obs-mean','value'),2.5);near(await data('#obs-variance','value'),.75);
  await page.locator('[data-obs-p="100"]').click();near(await data('#obs-mean','value'),1);near(await data('#obs-variance','value'),0);
  await page.locator('[data-obs-p="50"]').click();near(await data('#obs-mean','value'),2);near(await data('#obs-variance','value'),1);

  await load('hamiltonian');await page.locator('[data-hamiltonian-preset="uncoupled"]').click();near(await data('#hamiltonian-cross-term','low'),1);near(await data('#hamiltonian-cross-term','high'),3);
  await page.locator('[data-hamiltonian-preset="coupled"]').click();near(await data('#hamiltonian-cross-term','low'),.585786437626905);near(await data('#hamiltonian-cross-term','high'),3.414213562373095);
  await page.getByText('다른 상태의 평균 에너지도 비교하기',{exact:true}).click();
  await page.locator('[data-state-sign="plus"]').click();near(await data('#hamiltonian-cross-term','energy'),3);
  await page.locator('[data-state-sign="minus"]').click();near(await data('#hamiltonian-cross-term','energy'),1);

  await load('schrodinger');near(await data('#sch-energy','value'),.8);near(await data('#sch-residual','value'),.5);
  await page.locator('#sch-ground').click();near(await data('#sch-energy','value'),.4614835192865496);near(await data('#sch-residual','value'),0);
  await page.locator('#sch-excited').click();near(await data('#sch-energy','value'),1.5385164807134504);near(await data('#sch-residual','value'),0);

  await load('atom-electron-count');near(await number('#count-protons'),14);near(await data('#count-electrons','value'),14);
  for(const [example,expected]of [['H2,1',1],['H2O,0',10],['OH,-1',10]]){await page.locator(`[data-count-example="${example}"]`).click();near(await data('#count-electrons','value'),expected);}
  await input('#count-species','H');await input('#count-charge',2);assert.equal(await page.locator('#count-electrons').getAttribute('data-valid'),'false');checks++;
  await page.locator('[data-reset]').click();near(await data('#count-electrons','value'),14);

  await load('atomic-shells');near(await number('[data-valence]'),5);await page.locator('[data-atom-z="10"]').click();near(await number('[data-valence]'),8);await page.locator('[data-atom-z="11"]').click();near(await number('[data-valence]'),1);await page.locator('[data-reset]').click();near(await number('[data-valence]'),5);

  await load('born-oppenheimer');near(await number('#boh2-total'),-1.137284,1e-6);near(await number('#boh2-electronic')+await number('#boh2-nuclear'),await number('#boh2-total'),2e-6);assert.equal(await page.locator('[data-bo-advanced]').getAttribute('open'),null);checks++;
  await page.locator('#boh2-short').click();near(await number('#boh2-total'),-.9141497046270839,1e-6);
  await page.locator('#boh2-minimum').click();near(await number('#boh2-total'),-1.137284,1e-6);

  await load('orbital');near(await data('#orb-probability','value'),.5);near(await number('#orb-nodes'),1);
  const before=await page.locator('#orb-density-fig polyline').first().getAttribute('points');await page.locator('#orb-flip').check();near(await data('#orb-probability','value'),.5);assert.notEqual(await page.locator('#orb-density-fig polyline').first().getAttribute('points'),before);checks++;
  await page.locator('[data-orb-region="1"]').click();near(await data('#orb-probability','value'),1);await input('#orb-n',3);near(await number('#orb-nodes'),2);near(await data('#orb-probability','value'),1);

  await load('orbital-volume');const count=await number('[data-surface]');await page.locator('[data-volume-front]').click();near(await number('[data-surface]'),count);await page.locator('[data-volume-example="high"]').click();assert.match(await page.locator('[data-sign]').innerText(),/반대 부호/);checks++;

  await load('electron-spin');await page.locator('#spin-sixty').click();near(await data('#spin-plus','value'),.75);near(await data('#spin-minus','value'),.25);near(await number('#spin-mean'),.25);
  await page.locator('#spin-perpendicular').click();near(await number('#spin-mean'),0);near(await data('#spin-plus','value'),.5);await page.locator('#spin-opposite').click();near(await data('#spin-minus','value'),1);

  await load('pauli');await page.locator('#pauli-add-aa').click();await page.locator('#pauli-add-aa').click();near(await number('#pauli-total'),1);assert.match(await page.locator('#pauli-status').innerText(),/추가할 수 없습니다/);checks++;
  await page.locator('#pauli-add-ab').click();near(await number('#pauli-a-count'),2);await page.locator('[data-pauli-preset="parallel"]').click();assert.equal(await page.locator('#pauli-bits').getAttribute('data-occupancy'),'1010');checks++;
  await page.locator('[data-pauli-remove="0"]').click();near(await number('#pauli-total'),1);await page.locator('#pauli-reset').click();near(await number('#pauli-total'),0);

  await load('electronic-configuration');for(const [choice,bits,ms]of [[1,'1010',1],[2,'1001',0],[3,'0110',0],[4,'0101',-1]]){await page.locator(`[data-cfg-choice="${choice}"]`).click();assert.equal(await page.locator('#cfg-bits').getAttribute('data-bits'),bits);near(await number('#cfg-ms'),ms);near(await number('#cfg-count'),4);checks++;}

  await load('slater-determinant');near(await data('#sdet-probability','value'),.5);near(await data('#sdet-norm','value'),1);const amplitude=await data('#sdet-amplitude','value');await page.locator('#sdet-exchange').click();near(await data('#sdet-amplitude','value'),-amplitude);near(await data('#sdet-probability','value'),.5);
  await page.locator('#sdet-duplicate').click();near(await data('#sdet-norm','value'),0);near(await data('#sdet-amplitude','value'),0);assert.match(await page.locator('#sdet-validity').innerText(),/정규화할 수 없습니다/);checks++;
  return {checks};
}
