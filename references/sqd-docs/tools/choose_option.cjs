// Numerical checks use the actual visible controls.
module.exports=async(page,id,value)=>{
 const buttons=page.locator('[data-choice-for="'+id+'"] button');
 for(let i=0;i<await buttons.count();i++){
  const button=buttons.nth(i);
  if(await button.getAttribute('data-value')===String(value)){
   await button.click();
   if(await button.getAttribute('aria-pressed')!=='true')throw new Error('Selection not reflected: '+id);
   return;
  }
 }
 throw new Error('Missing choice '+id+': '+value);
};
