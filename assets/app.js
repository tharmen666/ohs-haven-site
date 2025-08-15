// assets/app.js
(() => {
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const track=(name,props)=>window.plausible&&window.plausible(name,{props});
  const toast=msg=>{let t=q('#toast'); if(!t){ t=document.createElement('div'); t.id='toast'; document.body.appendChild(t); }
    t.textContent=msg; t.className='show'; setTimeout(()=>t.className='',2000);};

  // Cache-bust thanks redirect from Netlify Forms
  if (location.search.includes('thanks=1')) toast("Thanks — we’ll email you shortly.");

  // Smooth scroll
  qa('[data-scroll], a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const id=a.dataset.scroll||a.getAttribute('href'); if(!id||id==='#') return;
      if(id.startsWith('#')){ e.preventDefault(); q(id)?.scrollIntoView({behavior:'smooth',block:'start'}); track('Scroll',{target:id}); }
    });
  });

  // Generic modal open/close
  qa('[data-open]').forEach(btn=>btn.addEventListener('click',e=>{
    e.preventDefault(); const id=btn.dataset.open; const m=q('#'+id); if(m){ m.hidden=false; track('Modal Open',{id}); }
  }));
  qa('[data-close],[data-close-modal]').forEach(x=>x.addEventListener('click',()=>{
    const m=x.closest('[role="dialog"]'); if(!m) return; const f=m.querySelector('iframe'); if(f) f.src=''; m.hidden=true;
  }));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){ qa('[role="dialog"]').forEach(m=>m.hidden=true); }
  });

  // Video modal
  qa('[data-video]').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.preventDefault();
      const src=btn.dataset.video; const m=q('#video-modal'); if(!m) return window.open(src,'_blank');
      const f=q('iframe',m); if(f) f.src=src; m.hidden=false; track('Video Open',{src});
    });
  });

  // Mail
  qa('[data-mail]').forEach(el=>el.addEventListener('click',()=>{
    const to=el.dataset.mail||'hello@ohshaven.com'; location.href=`mailto:${to}`; track('Mail Click',{to});
  }));

  // WhatsApp (prefill with page)
  qa('[data-whatsapp]').forEach(el=>el.addEventListener('click',()=>{
    const phone=(el.dataset.whatsapp||'27700000000').replace(/[^0-9]/g,'');
    const text=encodeURIComponent(el.dataset.text || `Hi, I need OHS help. (From ${location.pathname})`);
    window.open(`https://wa.me/${phone}?text=${text}`,'_blank'); track('WhatsApp Click',{phone});
  }));

  // Downloads
  qa('[data-download]').forEach(el=>el.addEventListener('click',()=>{
    const url=el.dataset.download; if(url) window.open(url,'_blank'); track('Download',{url});
  }));

  // Blocked / coming soon
  qa('[data-disabled]').forEach(el=>el.addEventListener('click',e=>{
    e.preventDefault(); toast(el.dataset.disabled||'Coming soon'); track('Blocked Click',{label:el.textContent.trim()});
  }));

  // Outbound tracking
  qa('a[href^="http"]').forEach(a=>{
    try{const u=new URL(a.href); if(u.host!==location.host){a.addEventListener('click',()=>track('Outbound',{href:a.href}));}}catch{}
  });
})();
