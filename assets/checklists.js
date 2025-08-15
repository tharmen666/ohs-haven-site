// assets/checklists.js  — NO-FETCH EDITION (self-contained)
(() => {
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const track=(n,p)=>window.plausible&&window.plausible(n,{props:p});
  const toast=msg=>{let t=q('#toast'); if(!t){ t=document.createElement('div'); t.id='toast'; document.body.appendChild(t); }
    t.textContent=msg; t.className='show'; setTimeout(()=>t.className='',2200);};

  // 🧰 Built-in checklist pack (edit here anytime)
  const CHECKS = {
    daily: [
      {id:"d1",text:"Spill kit stocked: absorbents, pads, PPE sized per shift",severity:"med",evidence:false},
      {id:"d2",text:"Fire exits clear, unlocked, signage visible",severity:"high",evidence:false},
      {id:"d3",text:"Fuel/chem containers labelled; no leaks or drips",severity:"high",evidence:true},
      {id:"d4",text:"Ladder condition check (feet, rungs, tags)",severity:"med",evidence:false},
      {id:"d5",text:"Near Loss Incidents (NLIs) logged since last shift",severity:"med",evidence:false}
    ],
    weekly: [
      {id:"w1",text:"First-aid box audit; contents within expiry",severity:"med",evidence:true},
      {id:"w2",text:"PPE inventory vs roster; missing items replaced",severity:"med",evidence:false},
      {id:"w3",text:"Electrical cords + plugs checked (no damage)",severity:"med",evidence:false}
    ],
    monthly: [
      {id:"m1",text:"Extinguishers: pressure, seal, tagging, access",severity:"high",evidence:true},
      {id:"m2",text:"Emergency drill or briefing recorded",severity:"high",evidence:true},
      {id:"m3",text:"HIRA spot review: new tasks/changes captured",severity:"high",evidence:true}
    ]
  };

  let activeType='daily';

  function init() {
    if (!q('#checklist-modal')) return; // modal not on this page
    buildTypeTabs(); loadChecklist('daily'); wireSubmit();
    // open trigger(s)
    qa('[data-open="checklist-modal"]').forEach(b=>b.addEventListener('click',()=>{
      q('#checklist-modal').hidden=false; track('Modal Open',{id:'checklist'});
    }));
  }

  function buildTypeTabs(){
    const tabs = q('#cl-types'); if(!tabs) return;
    tabs.innerHTML = '';
    ['daily','weekly','monthly'].forEach(t=>{
      const b=document.createElement('button');
      b.textContent=t[0].toUpperCase()+t.slice(1);
      b.className = 'tab' + (t==='daily'?' active':'');
      b.addEventListener('click',()=>{
        qa('.tab',tabs).forEach(x=>x.classList.remove('active'));
        b.classList.add('active'); loadChecklist(t); track('Checklist Type',{t});
      });
      tabs.appendChild(b);
    });
  }

  function loadChecklist(type){
    activeType=type;
    const box = q('#cl-items'); if(!box) return;
    box.innerHTML='';
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
    const bar = q('#cl-progress .bar'), label = q('#cl-progress + .label');
    if(bar) bar.style.width = pct+'%';
    if(label) label.textContent = `${pct}% • ${done}/${total}`;
  }

  function payload(){
    const org = q('#cl-org')?.value?.trim() || '';
    const site = q('#cl-site')?.value?.trim() || '';
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
    return { org, site, checklist_type: activeType, items, score, total, noncompliance, ua: navigator.userAgent, path: location.pathname };
  }

  function wireSubmit(){
    const btn = q('#cl-submit'); if(!btn) return;
    btn.addEventListener('click', async () => {
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
        console.error(e); toast('Save failed (backend not configured)');
      }
    });
  }

  // Close buttons + Esc close
  qa('[data-close],[data-close-modal]').forEach(x=>x.addEventListener('click',()=>{
    const m=x.closest('[role="dialog"]'); if(!m) return; const f=m.querySelector('iframe'); if(f) f.src=''; m.hidden=true;
  }));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){ qa('[role="dialog"]').forEach(m=>m.hidden=true); }
  });

  init();
})();
