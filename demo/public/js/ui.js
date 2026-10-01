(function(root){
  'use strict';
  const paths={
    dashboard:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    box:'<path d="m3 7 9-5 9 5v10l-9 5-9-5Z"/><path d="m3 7 9 5 9-5M12 12v10M7.5 4.5l9 5"/>',
    inventory:'<rect x="3" y="3" width="18" height="5" rx="1"/><path d="M5 8v13h14V8M9 13h6"/>',
    orders:'<path d="M6 3h12l2 18H4L6 3Z"/><path d="M9 7V5a3 3 0 0 1 6 0v2M9 12h6M9 16h4"/>',
    finance:'<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9h.01M18 15h.01"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18M8 15h2M14 15h2"/>',
    users:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v2"/>',
    settings:'<path d="m9 3-1 3-3 1-1 3 2 2-1 3 2 2 3-1 2 2 3-1 1-3 3-1 1-3-2-2 1-3-2-2-3 1-2-2-3 1Z"/><circle cx="12" cy="11" r="3"/>',
    logout:'<path d="M9 21H4V3h5M14 7l5 5-5 5M8 12h11"/>',
    chat:'<path d="M21 11a9 9 0 0 1-9 9H4l-3 2 1-6a9 9 0 1 1 19-5Z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/>',
    spark:'<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3ZM20 2v4M18 4h4"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    search:'<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    arrow:'<path d="M4 12h16M14 6l6 6-6 6"/>',
    left:'<path d="m14 6-6 6 6 6"/>',
    right:'<path d="m10 6 6 6-6 6"/>',
    down:'<path d="m6 9 6 6 6-6"/>',
    up:'<path d="m5 14 6-6 4 4 5-7M15 5h5v5"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    edit:'<path d="m16 3 5 5-12 12-6 1 1-6L16 3ZM13 6l5 5"/>',
    trash:'<path d="M3 6h18M5 6l1 15h12l1-15M9 6V3h6v3M10 10v7M14 10v7"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    circleCheck:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    warning:'<path d="m12 3 10 18H2L12 3ZM12 9v5M12 18h.01"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    expand:'<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>',
    send:'<path d="m22 2-7 20-4-9L2 9l20-7ZM22 2 11 13"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    phone:'<path d="m5 3 4 1 1 5-3 2a12 12 0 0 0 6 6l2-3 5 1 1 4c-2 4-7 3-12-2S1 5 5 3Z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1"/>',
    moon:'<path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/>',
    refresh:'<path d="M3 11a9 9 0 0 1 15-6l3 3M21 3v5h-5M21 13A9 9 0 0 1 6 19l-3-3M3 21v-5h5"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    coffee:'<path d="M4 8h12v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8ZM16 9h3a3 3 0 0 1 0 6h-3M7 2v3M11 2v3M3 22h15"/>',
    grain:'<path d="M6 21 18 3M11 14c-8 2-9-4-6-6 4-1 7 2 6 6ZM15 9c-5-1-6-6-3-7 4 0 5 3 3 7ZM11 14c1-5 6-7 9-3 0 5-5 7-9 3Z"/>',
    honey:'<path d="M6 8h12l2 5v7H4v-7l2-5ZM7 4h10v4H7V4ZM8 15h8M10 18h4"/>',
    jar:'<path d="M6 7h12v14H6V7ZM5 3h14v4H5V3ZM6 13h12"/>',
    cheese:'<path d="m3 13 15-8 3 8v7H3v-7ZM3 13h18M8 16h.01M16 17h.01"/>',
    bottle:'<path d="M9 2h6v6l3 5v9H6v-9l3-5V2ZM9 5h6M6 15h12"/>',
    bread:'<path d="M6 7a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4 4 4 0 0 1 0 8v6H6v-6a4 4 0 0 1 0-8ZM10 9v3M14 9v3"/>',
    leaf:'<path d="M20 3c0 11-3 18-10 18C1 21 1 10 8 7l12-4ZM4 21 17 7"/>',
    chocolate:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M12 3v12M5 9h14M5 15h14M8 18h8"/>',
    location:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 4H4v12"/>'
  };
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=(name,cls='')=>'<svg class="icon '+esc(cls)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.box)+'</svg>';
  const initials=name=>String(name).split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase();
  const date=(value,long=false)=>new Intl.DateTimeFormat('pt-BR',long?{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}:{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'}).format(new Date(value.slice(0,10)+'T12:00:00Z'));
  const badge=(text,kind='gray')=>'<span class="badge '+kind+'"><i class="dot"></i>'+esc(text)+'</span>';
  const picture=p=>'<span class="product-picture '+esc(p.category)+'">'+icon(p.visual||'box')+'</span>';
  const statusBadge=text=>badge(text,['Pago','Entregue','Concluído','Ativo','Normal'].includes(text)?'green':['Cancelado','Esgotado','Vencido'].includes(text)?'red':['Em preparo','Pendente','Estoque baixo','Alta'].includes(text)?'orange':'blue');
  function applyTheme(theme){let value=theme;if(value==='system')value=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=value;try{localStorage.setItem('stockzap:theme',theme);}catch{}}
  if(document.getElementById('app')){try{applyTheme(localStorage.getItem('stockzap:theme')||'light');}catch{document.documentElement.dataset.theme='light';}}else document.documentElement.dataset.theme='light';
  root.SZUI={esc,icon,initials,date,badge,picture,statusBadge,applyTheme};
  document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
    if(document.body.classList.contains('landing')){const state=root.SZDemo.seed();const sum=root.SZCore.summary(state);document.querySelectorAll('[data-demo]').forEach(el=>el.textContent=({sales:root.SZCore.money(sum.sales),products:sum.productCount,units:sum.stockUnits,low:sum.low.length})[el.dataset.demo]);}
    const form=document.getElementById('demo-login');if(form)form.addEventListener('submit',e=>{e.preventDefault();const b=form.querySelector('button[type=submit]');b.disabled=true;b.textContent='Entrando…';try{sessionStorage.setItem('stockzap:demo-session','1');}catch{}window.location.href='app.html#dashboard';});
  });
})(window);
