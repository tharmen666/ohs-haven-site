(() => {
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const box = q('#mellyBox');
  const fab = q('#mellyFab');

  function openBox(){
    if(!box) return;
    box.innerHTML = `
      <div class="melly-head">
        <img src="assets/avatar.jpg" alt="Melly">
        <div>
          <div class="name">Melly</div>
          <div style="font-size:.9rem;color:#9fb4c9">Your safety assistant</div>
        </div>
        <button class="close" aria-label="Close">✕</button>
      </div>
      <div class="melly-body">
        <div class="faq">
          <a href="#daily">Run today’s OHS checklist</a>
          <a href="/ergo/">Ergonomics: desk setup & stretch breaks</a>
          <a href="#downloads">Download safety posters</a>
          <a href="#contact">Ask a question / request a quote</a>
        </div>
        <div style="color:#9fb4c9;font-size:.9rem;">Psst… I’ll email a copy of your submissions automatically.</div>
      </div>`;
    box.classList.add('open');
    box.querySelector('.close')?.addEventListener('click', ()=> box.classList.remove('open'));
    qa('.faq a', box).forEach(a=>a.addEventListener('click', ()=> box.classList.remove('open')));
  }

  // FAB toggle
  fab?.addEventListener('click', openBox);

  // Little welcome bubble once per session
  if (!sessionStorage.getItem('mellyWelcome') && fab) {
    const tip = document.createElement('div');
    tip.className='welcome-bubble';
    tip.textContent='Hi, I’m Melly — need a checklist, posters or ergo tips?';
    document.body.appendChild(tip);
    setTimeout(()=>{ tip.remove(); sessionStorage.setItem('mellyWelcome','1'); }, 3800);
  }
})();
