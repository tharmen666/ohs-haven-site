// assets/app.js
(() => {
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const scrollToId=id=>{const el=q(id.startsWith('#')?id:'#'+id); if(el) el.scrollIntoView({behavior:'smooth', block:'start'});};
  const track=(name,props)=>window.plausible&&window.plausible(name,{props});

  // Smooth scroll for anchors & [data-scroll]
  qa('[data-scroll], a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const id=a.dataset.scroll||a.getAttribute('href'); if(!id||id==='#') return;
      if(id.startsWith('#')){ e.preventDefault(); scrollToId(id); track('Scroll',{target:id}); }
    });
  });

  // Video modal
  qa('[data-video]').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.preventDefault();
      const src=btn.dataset.video;
      const m=q('#video-modal'); if(!m) return window.open(src,'_blank');
      const f=q('iframe',m); if(f) f.src=src; m.hidden=false; track('Video Open',{src});
    });
  });
  qa('[data-close-modal]').forEach(x=>x.addEventListener('click',()=>{
    const m=x.closest('[role="dialog"]'); if(!m) return; const f=m.querySelector('iframe'); if(f) f.src=''; m.hidden=true;
  }));

  // Mail
  qa('[data-mail]').forEach(el=>el.addEventListener('click',()=>{
    const to=el.dataset.mail||'hello@ohshaven.com'; location.href=`mailto:${to}`; track('Mail Click',{to});
  }));

  // WhatsApp
  qa('[data-whatsapp]').forEach(el=>el.addEventListener('click',()=>{
    const phone=(el.dataset.whatsapp||'27700000000').replace(/[^0-9]/g,'');
    const text=encodeURIComponent(el.dataset.text||'Hi, I need OHS help.'); window.open(`https://wa.me/${phone}?text=${text}`,'_blank');
    track('WhatsApp Click',{phone});
  }));

  // Downloads
  qa('[data-download]').forEach(el=>el.addEventListener('click',()=>{
    const url=el.dataset.download; if(url) window.open(url,'_blank'); track('Download',{url});
  }));

  // Coming soon / disabled
  qa('[data-disabled]').forEach(el=>el.addEventListener('click',e=>{
    e.preventDefault(); toast(el.dataset.disabled||'Coming soon'); track('Blocked Click',{label:el.textContent.trim()});
  }));

  // Outbound link autotrack
  qa('a[href^="http"]').forEach(a=>{
    try{const u=new URL(a.href); if(u.host!==location.host){a.addEventListener('click',()=>track('Outbound',{href:a.href}));}}catch{}
  });

  function toast(msg){
    let t=q('#toast'); if(!t){ t=document.createElement('div'); t.id='toast'; document.body.appendChild(t); }
    t.textContent=msg; t.className='show'; setTimeout(()=>t.className='',2000);
  }
})();
