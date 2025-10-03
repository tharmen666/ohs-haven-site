<!-- ===== JS (Melly + Stretch, mobile smart) ===== -->
<script>
  // --- tiny helpers
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const box = $('#mellyBox');
  const fab = $('#mellyFab');
  const topChip = $('#mellyToggle');
  const txt = $('#mellyTxt');

  const isMobile = () => window.matchMedia('(max-width: 767px)').matches
                        || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  function setMellyText(message){ if (txt) txt.textContent = message; }
  function openMelly(){ if (box) box.style.display = 'flex'; }
  function closeMelly(){ if (box) box.style.display = 'none'; }
  function toggleMelly(){ if (!box) return; box.style.display = (box.style.display==='flex')?'none':'flex'; }

  // UI wires
  if (fab) fab.addEventListener('click', toggleMelly);
  if (topChip) topChip.addEventListener('click', toggleMelly);

  // close on outside click / Esc
  document.addEventListener('click', (e)=>{
    const inside = box && (box.contains(e.target) || e.target === fab || e.target === topChip);
    if (!inside) closeMelly();
  });
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeMelly(); });

  // greet once per browser (switch to sessionStorage for per-tab)
  function greetOnce(){
    const KEY='melly_greeted_v2';
    try{
      if (!localStorage.getItem(KEY)){
        setMellyText("Hi 👋 I’m Melly. Need posters, the kit link, help with the daily checklist, or a quick OHS answer?");
        const delay = isMobile() ? 2000 : 800; // phones wait 2s so we don't cover content immediately
        setTimeout(()=> openMelly(), delay);
        localStorage.setItem(KEY,'1');
      }
    }catch(_){ // storage blocked
      setMellyText("Hi 👋 I’m Melly. How can I help today?");
      setTimeout(()=> openMelly(), isMobile()?2000:800);
    }
  }

  // quick action buttons in the chat card
  (function wireActions(){
    if (!box) return;
    box.querySelectorAll('.melly-actions button').forEach(b=>{
      b.addEventListener('click', ()=>{
        const q=b.dataset.q;
        if(q==='posters'){ location.hash='#downloads'; closeMelly(); }
        else if(q==='kit'){ setMellyText("Training Kit link goes live with Gumroad—pop your email in Contact and we’ll send it."); }
        else if(q==='checklist'){ location.hash='#daily'; closeMelly(); }
        else if(q==='contact'){ location.hash='#contact'; closeMelly(); }
        else if(q==='ergo'){ location.href='/ergo/'; }
      });
    });
  })();

  // Stretch reminder (serverless)
  const stretchBtn = document.getElementById('stretchBtn');
  const stretchTip = document.getElementById('stretchTip');
  if(stretchBtn){
    stretchBtn.addEventListener('click', async ()=>{
      try{
        const r = await fetch('/.netlify/functions/stretch');
        const j = await r.json();
        stretchTip.textContent = j.message || 'Time to take a quick break!';
      }catch(_){
        stretchTip.textContent = 'Time to take a quick break!';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', greetOnce);
</script>
