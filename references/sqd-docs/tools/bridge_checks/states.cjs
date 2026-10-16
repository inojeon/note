const choose=require('../choose_option.cjs');
const assert=require('node:assert/strict');
module.exports=async({page,go,near})=>{
 await go('two-level-system');
 for(const [value,omitted,energies] of [['0,1','C','0, 1'],['0,2','B','0, 3'],['1,2','A','1, 3']]){
  await choose(page,'bt-pair',value);
  assert((await page.locator('#bt-omitted').innerText()).endsWith(omitted));
  assert((await page.locator('#bt-summary').innerText()).endsWith(energies));
  assert.equal(await page.locator('#bt-matrix .katex-error').count(),0);
 }
 await go('qubit');
 for(const [value,p0] of [['zero',100],['one',0],['plus',50],['minus',50],['plusi',50]]){
  await choose(page,'bq-state',value);
  near(parseFloat(await page.locator('#bq-p0').innerText()),p0,.001);
  near(parseFloat(await page.locator('#bq-p1').innerText()),100-p0,.001);
  await page.locator('#bq-vector .katex').waitFor();
 }
 await go('computational-basis');
 for(const value of ['zero','one','plus','null']){
  await choose(page,'bc-preset',value);
  assert.equal(await page.locator('#bc-norm').innerText(),value==='null'?'0':'1');
  if(value==='null')assert((await page.locator('#bc-probs').innerText()).includes('정의할 수 없습니다'));
  await page.locator('#bc-vector .katex').waitFor();
 }
};
