const choose=require('../choose_option.cjs');
const assert=require('node:assert/strict');
module.exports=async({page,go,near})=>{
 const number=async id=>Number((await page.locator(id).innerText()).replace('%','').replace('°',''));
 const data=async id=>JSON.parse(await page.locator(id).getAttribute('data-values'));
 await go('quantum-gate');
 const s=Math.SQRT1_2,states={'0':[[1,0],[0,0]],'1':[[0,0],[1,0]],plus:[[s,0],[s,0]],minus:[[s,0],[-s,0]],plusi:[[s,0],[0,s]]};
 for(const [key,v]of Object.entries(states))for(const g of ['X','Z','H']){
  await choose(page,'bg-input',key);await choose(page,'bg-gate',g);
  // Independently apply each gate to real and imaginary parts.
  const expected=g==='X'?[v[1],v[0]]:g==='Z'?[v[0],v[1].map(x=>-x)]:[[s*(v[0][0]+v[1][0]),s*(v[0][1]+v[1][1])],[s*(v[0][0]-v[1][0]),s*(v[0][1]-v[1][1])]];
  const actual=await data('#bg-out-vector');for(let i=0;i<2;i++)for(let j=0;j<2;j++)near(actual[i][j],expected[i][j],1e-12);
  for(let i=0;i<2;i++)near(await number('#bg-p'+i),100*expected[i].reduce((a,x)=>a+x*x,0),.0051);
  near(await number('#bg-in-norm'),1,1e-8);near(await number('#bg-out-norm'),1,1e-8);
 }
 await choose(page,'bg-input','plus');await choose(page,'bg-gate','Z');
 assert((await data('#bg-out-vector'))[1][0]<0,'Z must change relative sign for plus');near(await number('#bg-p0'),50,1e-8);
 await go('rotation-gate');
 for(const deg of [0,1,30,90,137,180,270,359,360,450,720]){
  await page.locator('#br-angle').fill(String(deg));await page.locator('#br-angle').dispatchEvent('input');
  const theta=deg*Math.PI/180,v=await data('#br-vector'),bloch=await data('#br-bloch');
  near(v[0],Math.cos(theta/2),1e-12);near(v[1],Math.sin(theta/2),1e-12);
  near(await number('#br-half-angle'),deg/2,1e-8);near(await number('#br-p0'),100*v[0]**2,.0051);near(await number('#br-p1'),100*v[1]**2,.0051);
  // Recover Bloch coordinates from state amplitudes, independently of runtime sin(theta).
  near(bloch[0],2*v[0]*v[1],1e-12);near(bloch[1],0,1e-12);near(bloch[2],v[0]**2-v[1]**2,1e-12);
  assert(!/NaN|undefined/.test(await page.locator('#br-bloch-fig').innerHTML()));
 }
 for(const [id,deg]of [['br-zero',0],['br-quarter',90],['br-half',180],['br-turn',360]]){
  await page.locator('#'+id).click();near(await number('#br-angle-value'),deg,1e-8);
 }
 near((await data('#br-vector'))[0],-1,1e-12);near((await data('#br-bloch'))[2],1,1e-12);
};
