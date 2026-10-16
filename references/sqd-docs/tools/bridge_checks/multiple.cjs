const choose=require('../choose_option.cjs');
const assert=require('node:assert/strict');
module.exports=async({page,go,near})=>{
 await go('tensor-product');
 const kron=(a,b)=>a.flatMap(x=>b.map(y=>x*y));
 for(const [a,b] of [[0,0],[0,180],[180,0],[180,180],[90,90],[-60,127]]){
  for(const [id,v] of [['bp-a',a],['bp-b',b]]){await page.locator('#'+id).fill(String(v));await page.locator('#'+id).dispatchEvent('input');}
  const state=t=>[Math.cos(t*Math.PI/360),Math.sin(t*Math.PI/360)],expected=kron(state(a),state(b));
  const actual=JSON.parse(await page.locator('#bp-lab').getAttribute('data-coefficients'));
  for(let i=0;i<4;i++){near(actual[i],expected[i],1e-12);near(Number((await page.locator('#bp-p'+i).innerText()).replace('%','')),100*expected[i]**2,.0051);}
 }
 await go('entanglement');
 const cases={zero:{z:[1,0,0,0],x:[.25,.25,.25,.25]},plus:{z:[.25,.25,.25,.25],x:[1,0,0,0]},bell:{z:[.5,0,0,.5],x:[.5,0,0,.5]},mixture:{z:[.5,0,0,.5],x:[.25,.25,.25,.25]}};
 for(const [name,bases] of Object.entries(cases)){
  await choose(page,'bn-state',name);
  for(const [basis,expected] of Object.entries(bases)){
   await choose(page,'bn-basis',basis);
   const actual=JSON.parse(await page.locator('#bn-lab').getAttribute('data-probabilities'));
   for(let i=0;i<4;i++){near(actual[i],expected[i],1e-12);near(Number((await page.locator('#bn-p'+i).innerText()).replace('%','')),100*expected[i],.0051);}
   const m=JSON.parse(await page.locator('#bn-lab').getAttribute('data-marginals'));
   near(m[0],expected[0]+expected[1],1e-12);near(m[1],expected[0]+expected[2],1e-12);
   assert.equal(await page.locator('#bn-vector').evaluate(e=>e.hidden),name==='mixture');
  }
 }
};
