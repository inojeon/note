const assert=require('node:assert/strict');
module.exports=async({page,go,near})=>{
 const val=async id=>Number((await page.locator(id).innerText()).replace('%',''));
 // Complex inner product, independent of UI's Bloch expectation formula.
 const s=Math.SQRT1_2,states={zero:[[1,0],[0,0]],one:[[0,0],[1,0]],plus:[[s,0],[s,0]],minus:[[s,0],[-s,0]],plusi:[[s,0],[0,s]]};
 const bases={Z:states.zero,X:states.plus,Y:states.plusi};
 const prob=(u,v)=>{let re=0,im=0;for(let i=0;i<2;i++){re+=u[i][0]*v[i][0]+u[i][1]*v[i][1];im+=u[i][0]*v[i][1]-u[i][1]*v[i][0];}return re*re+im*im;};
 await go('measurement-basis');
 for(const [name,state] of Object.entries(states)){
  await page.locator('#bm-state').selectOption(name);
  const before=await page.locator('#bm-c0').innerText()+';'+await page.locator('#bm-c1').innerText();
  for(const [basis,u] of Object.entries(bases)){
   await page.locator('#bm-basis').selectOption(basis);
   near(await val('#bm-p-first'),100*prob(u,state),.00051);
   near(await val('#bm-p-first')+await val('#bm-p-second'),100,.000001);
   assert.equal(await page.locator('#bm-c0').innerText()+';'+await page.locator('#bm-c1').innerText(),before,'basis selection preserves prepared computational coordinates');
  }
 }
 await go('energy-measurement');
 // Solve 2x2 characteristic polynomial; construct eigenvector from matrix row.
 const h00=.8,h01=-.5,h11=1.2,tr=h00+h11,det=h00*h11-h01*h01,lo=(tr-Math.sqrt(tr*tr-4*det))/2,hi=tr-lo;
 const n=Math.hypot(h01,lo-h00),u=[[h01/n,0],[(lo-h00)/n,0]];
 for(const degree of [-180,-137,-90,-20,0,48,90,133,180]){
  await page.locator('#be-angle').fill(String(degree));await page.locator('#be-angle').dispatchEvent('input');
  const a=Math.cos(degree*Math.PI/360),b=Math.sin(degree*Math.PI/360),p=prob(u,[[a,0],[b,0]]);
  near(await val('#be-c0'),a,.00000051);near(await val('#be-c1'),b,.00000051);
  near(await val('#be-p0'),100*a*a,.00051);near(await val('#be-p1'),100*b*b,.00051);
  near(await val('#be-plow'),100*p,.00051);near(await val('#be-phigh'),100*(1-p),.00051);
  near(await val('#be-low'),lo,.00000051);near(await val('#be-high'),hi,.00000051);
  near(await val('#be-mean'),a*(h00*a+h01*b)+b*(h01*a+h11*b),.00000051);
 }
 for(const [id,p] of [['ground',100],['excited',0]]){await page.locator('#be-'+id).click();near(await val('#be-plow'),p,.00051);assert(await val('#be-p0')>0&&await val('#be-p0')<100,'energy eigenstate is not computational state');}
 await page.locator('#be-zero').click();near(await val('#be-p0'),100,.00051);near(await val('#be-mean'),.8,.00000051);
 await page.locator('#be-plus').click();near(await val('#be-p0'),50,.00051);near(await val('#be-mean'),.5,.00000051);
};
