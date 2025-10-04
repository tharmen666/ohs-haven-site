// assets/melly-faq.js
(() => {
  const $ = (s,c=document)=>c.querySelector(s);
  const qa = (s,c=document)=>Array.from(c.querySelectorAll(s));
  const state = { data: null };

  // Basic sanitizer
  const esc = s => String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  // Build/ensure widget structure (so you don't have to edit HTML again)
  function ensureWidget(){
    const box = $('#mellyBox');
    if (!box) return null;
    if (!box.dataset.enhanced){
      box.innerHTML = `
        <div class="melly-head">Melly — Your Safety Assistant</div>
        <div class="melly-body">
          <div class="pic"><img src="assets/avatar.jpg" alt="" style="width:100%;height:100%;object-fit:cover"></div>
          <div class="txt" id="mellyTxt">Hi 👋 Need posters, the training kit, a daily checklist, or a quick OHS answer?</div>
        </div>
        <div class="melly-actions">
          <button data-q="posters">Show posters</button>
          <button data-q="checklist">Run daily checklist</button>
          <button data-q="ergo">Ergonomics</button>
          <button data-q="contact">Contact</button>
          <button data-q="faq">Ask a question</button>
        </div>
        <div class="melly-chat">
          <div id="mellyMsgs"></div>
          <div class="melly-input">
            <input id="mellyInput" placeholder="Ask about spills, evacuation, PPE, ergonomics..." />
            <button class="btn blue" id="mellySend" type="button">Send</button>
          </div>
        </div>`;
      box.dataset.enhanced = '1';
    }
    return box;
  }

  // Open/close
  function openM(){ const b=$('#mellyBox'); if(b) b.style.display='block'; }
  function closeM(){ const b=$('#mellyBox'); if(b) b.style.display='none'; }
  function toggleM(){ const b=$('#mellyBox'); if(!b) return; b.style.display=(b.style.display==='block')?'none':'block'; }

  // Greeting once per browser
  function greetOnce(){
    const KEY='melly_greet_v4';
    try{
      if(!localStorage.getItem(KEY)){
        setTimeout(()=> openM(), (isMobile()?1800:800));
        localStorage.setItem(KEY,'1');
      }
    }catch(_){
      setTimeout(()=> openM(), (isMobile()?1800:800));
    }
  }
  const isMobile=()=> window.matchMedia('(max-width:767px)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // FAQ search — simple keyword scoring
  function findAnswer(q){
    if(!state.data?.faqs) return null;
    const query = (q||'').toLowerCase();
    let best = null, bestScore = 0;
    for (const item of state.data.faqs){
      const keys = (item.keywords||[]).map(k=>String(k).toLowerCase());
      let score = 0;
      keys.forEach(k=>{ if(query.includes(k)) score += 1; });
      // small boost for title match
      if (item.q && query.includes(item.q.toLowerCase().split(' ')[0])) score += 1;
      if (score > bestScore){ best = item; bestScore = score; }
    }
    return bestScore > 0 ? best : null;
  }

  // Messaging
  function pushMsg(who, text){
    const msgs = $('#mellyMsgs'); if(!msgs) return;
    const p = document.createElement('p');
    p.className = 'msg';
    p.innerHTML = `<b>${who}:</b> <span class="${who==='Melly'?'bot':'user'}">${esc(text)}</span>`;
    msgs.appendChild(p);
    msgs.scrollTop = msgs.scrollHeight;
  }

  async function onSend(){
    const input = $('#mellyInput'); if(!input) return;
    const q = input.value.trim(); if(!q) return;
    input.value = '';
    pushMsg('You', q);
    // search
    const hit = findAnswer(q);
    if (hit){
      pushMsg('Melly', hit.a);
    } else {
      pushMsg('Melly', "I couldn't find that in my quick guide. Want me to escalate to a human? Email info@ohshaven.com or use Contact below.");
    }
  }

  // Wire quick actions
  function wireActions(){
    const box = $('#mellyBox'); if(!box) return;
    box.querySelectorAll('.melly-actions button').forEach(b=>{
      b.addEventListener('click', ()=>{
        const q=b.dataset.q;
        if(q==='posters'){ location.hash='#downloads'; closeM(); }
        else if(q==='checklist'){ location.hash='#daily'; closeM(); }
        else if(q==='ergo'){ location.href='/ergo/'; }
        else if(q==='contact'){ location.hash='#contact'; closeM(); }
        else if(q==='faq'){ openM(); $('#mellyInput')?.focus(); }
      });
    });
  }

  // Load FAQ JSON
  async function loadFaq(){
    try{
      const res = await fetch('assets/faq.json', {cache:'no-store'});
      if(!res.ok) throw new Error(res.statusText);
      state.data = await res.json();
    }catch(e){
      console.warn('[MELLY] FAQ load failed:', e);
      state.data = { faqs: [] };
    }
  }

  // Init
  document.addEventListener('DOMContentLoaded', async ()=>{
    ensureWidget();
    // FAB + top avatar
    $('#mellyFab')?.addEventListener('click', toggleM);
    $('#mellyToggleTop')?.addEventListener('click', toggleM);
    document.addEventListener('click', (e)=>{
      const box = $('#mellyBox');
      const inside = box && (box.contains(e.target) || e.target === $('#mellyFab') || e.target === $('#mellyToggleTop'));
      if(!inside) closeM();
    });
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeM(); });

    // Chat handlers
    document.body.addEventListener('click', (e)=>{ if(e.target && e.target.id==='mellySend') onSend(); });
    document.body.addEventListener('keydown', (e)=>{ if(e.key==='Enter' && document.activeElement?.id==='mellyInput') onSend(); });

    await loadFaq();
    greetOnce();
  });
})();
