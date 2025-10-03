<!-- ===== JS (Melly + Stretch) ===== -->
<script>
  // --- Helpers
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const box = $('#mellyBox');
  const fab = $('#mellyFab');
  const topChip = $('#mellyToggle');
  const txt = $('#mellyTxt');

  function setMellyText(message){
    if (txt) txt.textContent = message;
  }
  function openMelly(){
    if (!box) return;
    box.style.display = 'flex';
  }
  function closeMelly(){
    if (!box) return;
    box.style.display = 'none';
  }
  function toggleMelly(){
    if (!box) return;
    box.style.display = (box.style.display === 'flex') ? 'none' : 'flex';
  }

  // Wire UI
  if (fab) fab.addEventListener('click', toggleMelly);
  if (topChip) topChip.addEventListener('click', toggleMelly);

  // Close on outside click
  document.addEventListener('click', (e)=>{
    const clickInside = box && (box.contains(e.target) || e.target === fab || e.target === topChip);
    if (!clickInside) closeMelly();
  });
  // Close on Esc
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeMelly(); });

  // Greet once per browser (change to sessionStorage if you prefer "once per tab")
  function greetOnce(){
    try{
      const key = 'melly_greeted_v1';
      if (!localStorage.getItem(key)){
        setMellyText("Hi 👋 I’m Melly. Need posters, the kit link, help with the daily checklist, or a quick OHS answer?");
        // slight delay for a smoother feel
        setTimeout(()=> openMelly(), 800);
        localStorage.setItem(key, '1');
      }
    }catch(_e){
      // Fallback if storage blocked
      setMellyText("Hi 👋 I’m Melly. How can I help today?");
      setTimeout(()=> openMelly(), 800);
    }
  }

  // Suggested quick actions
  (function wireQuickActions(){
    if (!box) return;
    box.querySelectorAll('.melly-actions button').forEach(b=>{
      b.addEventListener('click', ()=>{
        const q = b.dataset.q;
        if(q==='posters'){ location.hash='#downloads'; closeMelly(); }
        else if(q==='kit'){ setMellyText("The Training Kit link will go live after we flip Gumroad. Drop your email in Contact and we’ll send it."); }
        else if(q==='checklist'){ location.hash='#daily'; closeMelly(); }
        else if(q==='contact'){ location.hash='#contact'; closeMelly(); }
        else if(q==='ergo'){ location.href='/ergo/'; }
      });
    });
  })();

  // Stretch reminder via Netlify Function
  const stretchBtn = document.getElementById('stretchBtn');
  const stretchTip = document.getElementById('stretchTip');
  if(stretchBtn){
    stretchBtn.addEventListener('click', async ()=>{
      try{
        const r = await fetch('/.netlify/functions/stretch');
        const j = await r.json();
        stretchTip.textContent = j.message || 'Time to take a quick break!';
      }catch(e){
        stretchTip.textContent = 'Time to take a quick break!';
      }
    });
  }

  // Fire the greeting after DOM is ready
  document.addEventListener('DOMContentLoaded', greetOnce);
</script>

