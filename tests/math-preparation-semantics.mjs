import assert from 'node:assert/strict';

export async function runMathPreparationSemantics(page,{baseURL}) {
 let checks=0;
 const load=async id=>{await page.goto(new URL(`experiments/${id}/`,baseURL).href);await page.waitForSelector('body[data-state="ready"]');};
 const state=()=>page.locator('[data-result]').evaluate(el=>({...el.dataset}));
 const close=(value,expected,message)=>{assert(Math.abs(Number(value)-expected)<1e-9,message);checks++;};
 const reset=()=>page.locator('[data-reset]').click();
 await load('probability');close((await state()).mean,2.5);
 for(const [p,mean] of [[0,3],[.5,2],[1,1]]){await page.locator(`[data-preset="${p}"]`).click();close((await state()).mean,mean);close((await state()).probability,p);}
 await reset();close((await state()).mean,2.5);
 await page.locator('[data-p]').focus();await page.keyboard.press('ArrowRight');close((await state()).probability,.3);
 await load('functions-and-density');close((await state()).probability,.25);
 for(const [preset,area] of [['0.5,1',.75],['0,1',1],['0.5,0.5',0]]){await page.locator(`[data-preset="${preset}"]`).click();close((await state()).probability,area);}
 await page.locator('[data-a]').evaluate(el=>{el.value=.8;el.dispatchEvent(new Event('input'));});let s=await state();close(s.left,.8);close(s.right,.8);close(s.probability,0);
 await reset();close((await state()).probability,.25);
 await load('angles-and-rotation');
 for(const [angle,x,y] of [[0,1,0],[90,0,1],[180,-1,0],[270,0,-1]]){await page.locator(`[data-preset="${angle}"]`).click();s=await state();close(s.x,x);close(s.y,y);close(s.length,1);}
 await reset();close((await state()).degrees,0);
 await load('complex-numbers');s=await state();close(s.normSquared,25);
 for(const [op,x,y] of [['conjugate',3,-4],['times-i',-4,3]]){await page.locator(`[data-operation="${op}"]`).click();s=await state();close(s.x,x);close(s.y,y);close(s.normSquared,25);}
 await reset();close((await state()).x,3);close((await state()).y,4);
 await load('complex-inner-product');s=await state();close(s.normSquared,2);close(s.naive,0);
 await page.locator('[data-normalize]').check();close((await state()).normSquared,1);
 await page.locator('[data-preset="1,2"]').click();close((await state()).normSquared,5);close((await state()).naive,-3);
 await page.locator('[data-preset="0,0"]').click();close((await state()).normSquared,0);assert(await page.locator('[data-normalize]').isDisabled());checks++;
 await reset();close((await state()).normSquared,2);
 await load('jordan-wigner-parity');
 for(const [preset,sign,bits] of [['odd',-1,'1000'],['even',1,'1100'],['occupied',0,'1010']]){await page.locator(`[data-example="${preset}"]`).click();assert.equal(await page.locator('[data-sign]').innerText(),String(sign));assert.equal(await page.locator('[data-bits]').innerText(),bits);checks+=2;}
 await load('discovery-probability');await page.locator('[data-example="2"]').click();assert(Math.abs(parseFloat(await page.locator('[data-found]').innerText())-63.3968)<.001);checks++;
 await page.locator('[data-example="3"]').click();assert(Math.abs(parseFloat(await page.locator('[data-found]').innerText())-99.9957)<.001);checks++; // high likelihood remains below certainty
 for(const id of ['probability','functions-and-density','angles-and-rotation','complex-numbers','complex-inner-product']){
  await load(id);await page.setViewportSize({width:320,height:740});await page.emulateMedia({colorScheme:'dark'});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${id}: mobile overflow`);checks++;
  assert.equal(await page.locator('svg').evaluateAll(nodes=>nodes.some(el=>/NaN|Infinity/.test(el.innerHTML))),false);checks++;
 }
 return {experiments:7,checks};
}
