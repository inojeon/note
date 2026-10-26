import { controls } from 'experiment-shared.js';

export function mount(root, context) {
  const $ = selector => root.querySelector(selector);
  const species = {
    H: [['H',1]], He: [['He',2]], N: [['N',7]],
    H2: [['H',1],['H',1]], N2: [['N',7],['N',7]],
    H2O: [['H',1],['H',1],['O',8]], OH: [['O',8],['H',1]]
  };
  function render() {
    const nuclei=species[$('#count-species').value], charge=Number($('#count-charge').value);
    const protons=nuclei.reduce((sum,[,z])=>sum+z,0), electrons=protons-charge, valid=electrons>=0;
    $('#count-charge-value').textContent=(charge>0?'+':'')+charge;
    $('#count-protons').textContent=protons;
    $('#count-electrons').textContent=valid?String(electrons):'불가능';
    $('#count-electrons').dataset.value=String(electrons);
    $('#count-electrons').dataset.valid=String(valid);
    $('#count-calculation').textContent='Nₑ = ('+nuclei.map(([,z])=>z).join(' + ')+') − ('+charge+') = '+electrons;
    $('#count-status').textContent=!valid?'전자 수가 음수가 되어 이 핵 구성에 가능한 전하가 아닙니다. 전하를 낮춰 주세요.':charge===0?'양성자 수와 전자 수가 같아서 전체 전하가 0입니다.':charge>0?'중성일 때보다 전자가 '+charge+'개 적습니다. 핵의 양성자 수는 그대로입니다.':'중성일 때보다 전자가 '+(-charge)+'개 많습니다. 이 계산만으로 이온의 안정성을 판단하지는 않습니다.';
    const svg=$('#count-figure'), width=360, height=valid?210+Math.ceil(electrons/8)*25:200;
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    let drawing='<title>핵의 양성자 '+protons+'개, '+(valid?'전자 '+electrons+'개':'허용되지 않는 음의 전자 수')+'</title>';
    nuclei.forEach(([symbol,z],i)=>{
      const x=width*(i+1)/(nuclei.length+1);
      drawing+=`<circle cx="${x}" cy="60" r="28" fill="var(--panel)" stroke="var(--ink2)" stroke-width="2"/><text x="${x}" y="57" text-anchor="middle" fill="var(--ink)" font-size="17">${symbol}</text><text x="${x}" y="76" text-anchor="middle" fill="var(--ink2)" font-size="12">Z = ${z}</text>`;
    });
    drawing+='<text x="180" y="120" text-anchor="middle" fill="var(--ink)" font-size="15">양성자 합 '+protons+' · 전하 '+(charge>0?'+':'')+charge+'</text>';
    drawing+='<text x="180" y="160" text-anchor="middle" fill="var(--ink)" font-size="15">'+(valid?'전자 '+electrons+'개':'음의 전자 수는 허용되지 않음')+'</text>';
    if(valid) for(let i=0;i<electrons;i++)drawing+=`<circle cx="${57+(i%8)*35}" cy="${190+Math.floor(i/8)*25}" r="8" fill="var(--n)"/><text x="${57+(i%8)*35}" y="${194+Math.floor(i/8)*25}" text-anchor="middle" fill="var(--panel)" font-size="11">−</text>`;
    svg.innerHTML=drawing;
    root.querySelectorAll('[data-count-example]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.countExample===$('#count-species').value+','+charge)));
  }
  root.querySelectorAll('[data-count-example]').forEach(button=>button.addEventListener('click',()=>{
    const [name,charge]=button.dataset.countExample.split(',');$('#count-species').value=name;$('#count-charge').value=charge;render();
  },{signal:context.signal}));
  controls(root,context.signal,render);
}
