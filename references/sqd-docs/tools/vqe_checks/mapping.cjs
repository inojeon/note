const choose=require('../choose_option.cjs');
module.exports = async ({page,go,near}) => {
  await go('fermion-qubit');
  const assert=(ok,msg)=>{if(!ok)throw new Error('mapping: '+msg);};
  let nTwo=0,nSpin=0;
  for(let i=0;i<16;i++){
    const bits=i.toString(2).padStart(4,'0');
    await page.evaluate(bits=>{['vm-bu','vm-bg','vm-au','vm-ag'].forEach((id,j)=>{document.getElementById(id).checked=bits[j]==='1';});document.getElementById('vm-ag').dispatchEvent(new Event('change',{bubbles:true}));},bits);
    const actual=await page.locator('#vm-status').evaluate(e=>({...e.dataset}));
    const n=Array.from(bits).filter(v=>v==='1').length;
    assert(await page.locator('#vm-bits').getAttribute('data-bits')===bits,'bit convention '+bits);
    assert(Number(await page.locator('#vm-electrons').textContent())===n,'electron count '+bits);
    const spin=bits.slice(0,2).split('1').length===2&&bits.slice(2).split('1').length===2;
    assert(actual.two===String(n===2),'N sector '+bits);
    assert(actual.spin===String(spin),'spin sector '+bits);
    if(actual.two==='true')nTwo++;if(actual.spin==='true')nSpin++;
  }
  assert(nTwo===6&&nSpin===4,'enumerated sector dimensions');
  for(const [sector,size] of [['all',16],['two',6],['spin',4],['pair',2]]){
    await choose(page,'vm-sector',sector);
    assert(Number(await page.locator('#vm-dimension').getAttribute('data-dimension'))===size,'dimension '+sector);
    assert(await page.locator('#vm-basis-list li').count()===size,'basis list '+sector);
  }
  for(const [button,bits] of [['g','0101'],['u','1010'],['empty','0000']]){
    await page.locator('#vm-preset-'+button).click();
    assert(await page.locator('#vm-bits').getAttribute('data-bits')===bits,'preset '+button);
  }
  await page.locator('#vm-preset-g').click();
};
