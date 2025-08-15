// assets/checklists.js
(() => {
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const toast=msg=>{let t=q('#toast'); if(!t){ t=document.createElement('div'); t.id='toast'; document.body.appendChild(t); }
    t.textContent=msg; t.className='show'; setTimeout(()=>t.className='',2200);};
  const track=(n,p)=>window.plausible&&window.plausible(n,{props:p});

  let CHECKS={}, activeType='daily';

  async function init() {
    try {
      const res = await fetch('/assets/checklists.json?v=1'); CHECKS = await res.json();
      buildTypeTabs(); loadChecklist('daily'); wireSubmit();
    } catch (e) { console.error(e); toast('Checklist pack failed to load'); }
  }

  function buildTypeTabs(){
    const tabs = q('#cl-types'); tabs.innerHTML = '';
    ['daily','weekly','monthly'].forEach(t=>{
      const b=document.createElement('button'); b.textContent=t[0].toUpperCase()+t.slice(1);
      b.className = 'tab' + (t==='daily'?' active':'');
      b.addEventListener('click',()=>{ qa('.tab',tabs).forEach(x=>x.classList.remove('active')); b.classList.add('active'); loadChecklist(t); track('Checklist Type',{t}); });
      tabs.appendChild(b);
    });
  }

  function loadChecklist(type){
    activeType=type;
    const box = q('#cl-items'); box.innerHTML='';
    const items = CHECKS[type]||[];
    items.forEach(it=>{
      const row = document.createElement('label');
      row.className='cl-item';
      row.innerHTML = `
        <input type="checkbox" data-id="${it.id}">
        <span class="text">${it.text}</span>
        ${it.evidence?'<input type="text" class="ev" placeholder="Note / evidence URL">':''}
        <span class="sev ${it.severity}">${it.severity}</span>
      `;
      box.appendChild(row);
    });
    updateProgress();
    qa('#cl-items input[type="checkbox"]').forEach(cb=>cb.addEventListener('change',updateProgress));
  }

  function updateProgress(){
    const items = qa('#cl-items input[type="checkbox"]');
    const done = items.filter(i=>i.checked).length;
    const total = items.length;
    const pct = total? Math.round(100*done/total) : 0;
    q('#cl-progress .bar').style.width = pct+'%';
    q('#cl-progress .label').textContent = `${pct}% • ${done}/${total}`;
  }

  function payload(){
    const org = q('#cl-org').value.trim();
    const site = q('#cl-site').value.trim();
    const items = qa('#cl-items .cl-item').map(row=>{
      const id = row.querySelector('input[type="checkbox"]').dataset.id;
      const ok = row.querySelector('input[type="checkbox"]').checked;
      const ev = row.querySelector('.ev')?.value?.trim() || null;
      const text = row.querySelector('.text').textContent;
      const sev = row.querySelector('.sev').textContent;
      return { id, ok, evidence: ev, text, severity: sev };
    });
    const total = items.length;
    const score = items.filter(i=>i.ok).length;
    const noncompliance = items.filter(i=>!i.ok).length;
    return {
      org, site,
      checklist_type: activeType,
      items, score, total, noncompliance,
      ua: navigator.userAgent, path: location.pathname
    };
  }

  function wireSubmit(){
    q('#cl-submit').addEventListener('click', async () => {
      const body = payload();
      if(!body.org || !body.site){ toast('Add Org & Site'); return; }
      try{
        const res = await fetch('/.netlify/functions/checklist-submit', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify(body)
        });
        if(!res.ok) throw new Error(await res.text());
        toast('Checklist saved'); track('Checklist Submit',{type: body.checklist_type, noncomp: body.noncompliance});
        q('#checklist-modal').hidden = true;
      }catch(e){
        console.error(e); toast('Save failed');
      }
    });
  }

  // open modal from any trigger
  qa('[data-open="checklist-modal"]').forEach(b=>b.addEventListener('click',()=>{ q('#checklist-modal').hidden=false; track('Modal Open',{id:'checklist'});}))

  init();
})();
