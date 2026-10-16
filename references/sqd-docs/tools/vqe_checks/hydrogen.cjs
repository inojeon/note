const choose=require('../choose_option.cjs');
const assert = require('node:assert/strict');
const data = require('../../data/vqe_h2.json');
module.exports = async ({page, go, near}) => {
  await go('vqe-hydrogen');
  const value = async id => Number(await page.locator('#vh-'+id).getAttribute('data-value'));
  let states=0;
  for(let index=0;index<data.samples.length;index++){
    const s=data.samples[index],p=s.pauli_hartree;
    await choose(page,'vh-distance',String(index));
    near(await value('energy'),s.energy_hf_hartree,1e-10);
    for(const deg of [-120,-30,0,60,170]){
      const theta=deg*Math.PI/180;
      await page.locator('#vh-angle').fill(String(deg));
      const e=p.I+p.X*Math.sin(theta)+p.Z*Math.cos(theta);
      near(await value('energy'),e,1e-8);near(await value('error'),1000*(e-s.energy_fci_hartree),1e-5);
      assert(await value('energy')>=s.energy_fci_hartree-1e-12);states++;
    }
    await page.locator('#vh-reset').click();
    let previous=await value('energy');
    for(let n=0;n<3;n++){
      await page.locator('#vh-step').click();const next=await value('energy');assert(next<=previous+1e-12);previous=next;
    }
    await page.locator('#vh-run').click();
    near(await value('energy'),s.energy_fci_hartree,1e-10);
    await page.locator('#vh-reference').click();near(await value('energy'),s.energy_fci_hartree,1e-12);
    assert(!/NaN|Infinity/.test(await page.locator('#vh-energy-fig').innerHTML()));
    await page.locator('#vh-reset').click();near(await value('energy'),s.energy_hf_hartree,1e-10);
  }
  return states;
};
