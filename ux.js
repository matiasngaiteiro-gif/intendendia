'use strict';
// Mejoras de experiencia de usuario: navegación agrupada con íconos, enlaces por URL,
// métricas accionables, filtros rápidos, accesibilidad por teclado y estado de sincronización.
(() => {
  const VIEW_TITLES = {dashboard:'Panel general',orders:'Órdenes de trabajo',people:'Personal',tools:'Herramientas',services:'Servicios',contacts:'Contactos de utilidad',works:'Obras',guides:'Guías',reminders:'Recordatorios',supplies:'Insumos'};
  const NAV_GROUPS = [
    ['Operación',['dashboard','orders','supplies','reminders']],
    ['Recursos',['people','tools','services','works']],
    ['Consulta',['guides','contacts']]
  ];
  const ICONS = {
    dashboard:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    orders:'<path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z"/><path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/><path d="m9 13 2 2 4-4"/>',
    supplies:'<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/>',
    reminders:'<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    people:'<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/><path d="M22 21a7 7 0 0 0-4-6.3"/>',
    tools:'<path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-2-2 1.3-1.3a4 4 0 0 1-5-5L3 9l3-3 3.7 3.7a4 4 0 0 1 5-3.4Z"/>',
    services:'<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 9h1M14 9h1M9 13h1M14 13h1M10 21v-4h4v4"/>',
    works:'<path d="M2 20h20"/><path d="M4 20V10l8-6 8 6v10"/><path d="M9 20v-6h6v6"/>',
    guides:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    contacts:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/>'
  };
  const icon = name => `<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]||''}</svg>`;
  const qs = s => document.querySelector(s);
  const qsa = s => [...document.querySelectorAll(s)];
  const fire = el => el && el.dispatchEvent(new Event('input',{bubbles:true}));

  /* ---------- Navegación ---------- */
  function enhanceNav(){
    const nav = qs('.sidebar nav');
    if(!nav || nav.dataset.enhanced) return;
    nav.dataset.enhanced = '1';
    nav.setAttribute('aria-label','Secciones');
    const buttons = Object.fromEntries(qsa('.sidebar .nav-item').map(b => [b.dataset.view,b]));
    const used = new Set();
    const fragment = document.createDocumentFragment();
    for(const [label,views] of NAV_GROUPS){
      const present = views.filter(v => buttons[v]);
      if(!present.length) continue;
      const heading = document.createElement('p');
      heading.className = 'nav-group';
      heading.textContent = label;
      fragment.append(heading);
      present.forEach(v => { used.add(v); fragment.append(buttons[v]); });
    }
    Object.keys(buttons).filter(v => !used.has(v)).forEach(v => fragment.append(buttons[v]));
    nav.replaceChildren(fragment);
    Object.entries(buttons).forEach(([view,b]) => {
      if(!b.querySelector('.nav-icon')) b.innerHTML = `${icon(view)}<span>${b.textContent.trim()}</span>`;
      b.type = 'button';
    });
  }

  function currentView(){ return qs('.view.active')?.id.replace(/View$/,'') || 'dashboard'; }

  function afterViewChange(name){
    qsa('.sidebar .nav-item').forEach(b => {
      if(b.dataset.view === name) b.setAttribute('aria-current','page');
      else b.removeAttribute('aria-current');
    });
    document.title = `${VIEW_TITLES[name]||'Intendencia'} | Intendencia`;
    const active = qs(`.sidebar .nav-item[data-view="${name}"]`);
    if(active && matchMedia('(max-width: 720px)').matches) active.scrollIntoView({block:'nearest',inline:'center'});
    if(location.hash.slice(1) !== name) history.pushState(null,'',`#${name}`);
  }

  function wrapShowView(){
    const original = window.showView;
    if(typeof original !== 'function' || original.wrapped) return;
    const wrapped = function(name){
      if(!qs(`#${name}View`)) name = 'dashboard';
      const changed = currentView() !== name;
      original(name);
      afterViewChange(name);
      if(changed) window.scrollTo({top:0});
    };
    wrapped.wrapped = true;
    window.showView = wrapped;
  }

  window.addEventListener('popstate',() => {
    const name = location.hash.slice(1);
    if(VIEW_TITLES[name] && name !== currentView() && typeof window.showView === 'function') window.showView(name);
  });

  /* ---------- Fecha de trabajo en el encabezado ---------- */
  function showToday(){
    const eyebrow = qs('.topbar .eyebrow');
    if(!eyebrow) return;
    const text = new Intl.DateTimeFormat('es-AR',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
    eyebrow.textContent = text;
    eyebrow.classList.add('today');
  }

  /* ---------- Métricas accionables ---------- */
  const ORDER_METRICS = {'Pendientes':'Pendiente','En proceso':'En proceso','Resueltos':'Resuelto','Sin asignar':'Sin asignar','Demorados':''};
  function goToOrders(status){
    window.showView('orders');
    const search = qs('#searchInput');
    ['#statusFilter','#buildingFilter','#specialtyFilter'].forEach(s => { const el = qs(s); if(el) el.value = ''; });
    if(search) search.value = '';
    const filter = qs('#statusFilter');
    if(filter && status) filter.value = status;
    fire(filter || search);
  }
  function goToTools(status){
    const filter = qs('#toolStatusFilter');
    if(filter){ filter.value = status; fire(filter); }
    qs('#toolsTable')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function metricAction(card){
    const label = card.querySelector('.metric-top span')?.textContent.trim();
    if(card.closest('#metrics') && label in ORDER_METRICS) return () => goToOrders(ORDER_METRICS[label]);
    if(card.closest('#toolMetrics')) return () => goToTools(label);
    return null;
  }

  /* ---------- Filas y tarjetas navegables con teclado ---------- */
  const CLICKABLE = 'tr[data-id],tr[data-tool-id],tr[data-contact-id],.priority-card[data-open],#metrics .metric,#toolMetrics .metric';
  function decorate(root){
    root.querySelectorAll?.(CLICKABLE).forEach(el => {
      if(el.hasAttribute('tabindex')) return;
      el.tabIndex = 0;
      el.setAttribute('role','button');
      if(el.classList.contains('metric')){
        const label = el.querySelector('.metric-top span')?.textContent.trim();
        const value = el.querySelector('b')?.textContent.trim();
        el.setAttribute('aria-label',`${label}: ${value}. Ver listado`);
        el.classList.add('is-action');
      }
    });
    root.querySelectorAll?.('.table-wrap table').forEach(table => {
      const labels = [...table.querySelectorAll('thead th')].map(th => th.textContent.trim());
      table.querySelectorAll('tbody tr').forEach(tr => [...tr.children].forEach((td,i) => {
        if(labels[i] && !td.dataset.label) td.dataset.label = labels[i];
      }));
    });
    root.querySelectorAll?.('#contactsTable td[data-label]').forEach(linkContactCell);
    root.querySelectorAll?.('.icon-btn:not([aria-label])').forEach(b => { b.setAttribute('aria-label','Cerrar'); b.title = 'Cerrar'; });
  }

  // Teléfonos y correos de la agenda se pueden tocar para llamar o escribir.
  function linkContactCell(td){
    if(td.querySelector('a')) return;
    const text = td.textContent.trim();
    if(!text || text === '—') return;
    let href = '';
    if(td.dataset.label === 'Correo' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) href = `mailto:${text}`;
    if(td.dataset.label === 'Teléfono'){
      const digits = text.split(/[\/,y]/)[0].replace(/\D/g,'');
      if(digits.length >= 8) href = `tel:${digits.length === 8 ? '+5411' + digits : digits}`;
    }
    if(!href) return;
    const a = document.createElement('a');
    a.href = href;
    a.className = 'contact-link';
    a.textContent = text;
    a.addEventListener('click',e => e.stopPropagation());
    td.replaceChildren(a);
  }

  document.addEventListener('click',e => {
    const card = e.target.closest('#metrics .metric,#toolMetrics .metric');
    if(card){ const action = metricAction(card); if(action) action(); }
  });
  document.addEventListener('keydown',e => {
    const el = e.target;
    if((e.key === 'Enter' || e.key === ' ') && el.matches?.(CLICKABLE)){ e.preventDefault(); el.click(); return; }
    if(e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    const typing = el.closest?.('input,select,textarea,[contenteditable]') || qs('dialog[open]') || !qs('#authScreen')?.classList.contains('hidden');
    if(typing) return;
    if(e.key === '/'){
      const search = qs('.view.active input[type=search]');
      if(search){ e.preventDefault(); search.focus(); search.select(); }
    } else if(e.key.toLowerCase() === 'n' && ['dashboard','orders'].includes(currentView())){
      e.preventDefault(); qs('#newOrderBtn')?.click();
    }
  });

  /* ---------- Limpiar filtros ---------- */
  function addClearFilters(toolbarSelector,fields){
    const toolbar = qs(toolbarSelector);
    if(!toolbar || toolbar.querySelector('.clear-filters')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'text-button clear-filters';
    button.textContent = 'Limpiar filtros';
    button.hidden = true;
    toolbar.append(button);
    const inputs = fields.map(qs).filter(Boolean);
    const update = () => { button.hidden = !inputs.some(i => i.value); toolbar.classList.toggle('has-filters',!button.hidden); };
    inputs.forEach(i => i.addEventListener('input',update));
    button.onclick = () => { inputs.forEach(i => { i.value = ''; }); fire(inputs[0]); update(); inputs[0]?.focus(); };
    update();
  }

  /* ---------- Diálogos ---------- */
  function enhanceDialogs(){
    qsa('dialog').forEach(dialog => {
      if(dialog.dataset.enhanced) return;
      dialog.dataset.enhanced = '1';
      const title = dialog.querySelector('.modal-head h2');
      if(title){ title.id ||= `${dialog.id}Title`; dialog.setAttribute('aria-labelledby',title.id); }
      // Solo los diálogos de lectura se cierran al tocar fuera: los formularios conservan lo escrito.
      if(!dialog.querySelector('form')) dialog.addEventListener('click',e => { if(e.target === dialog) dialog.close(); });
    });
  }

  /* ---------- Avisos ---------- */
  const ERROR_PATTERN = /^(No se|No hay|Seleccion|Elegí|Monto inválido|El fin no|Stock insuficiente|Ingresá|Completá)|inválid|insuficiente|error/i;
  let toastTimer;
  window.toast = function(message){
    const t = qs('#toast');
    if(!t) return;
    const isError = ERROR_PATTERN.test(String(message));
    t.textContent = message;
    t.classList.toggle('toast-error',isError);
    t.setAttribute('role',isError ? 'alert' : 'status');
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'),isError ? 4500 : 2600);
  };

  /* ---------- Estado de sincronización ---------- */
  function watchSync(){
    const footer = qs('.sidebar-footer');
    if(!footer || footer.dataset.enhanced) return;
    footer.dataset.enhanced = '1';
    footer.setAttribute('role','status');
    footer.innerHTML = '<span class="online-dot"></span><span class="sync-text">Datos sincronizados</span>';
    const text = footer.querySelector('.sync-text');
    let last = null;
    setInterval(() => {
      const pending = typeof savePending === 'number' && savePending > 0;
      const offline = !navigator.onLine;
      const next = offline ? 'offline' : pending ? 'saving' : 'ok';
      if(next === last) return;
      last = next;
      footer.dataset.state = next;
      text.textContent = offline ? 'Sin conexión: los cambios no se guardan' : pending ? 'Guardando cambios…' : 'Datos sincronizados';
    },400);
    window.addEventListener('beforeunload',e => {
      if(typeof savePending === 'number' && savePending > 0){ e.preventDefault(); e.returnValue = ''; }
    });
  }

  /* ---------- Acceso ---------- */
  function enhanceLogin(){
    const toggle = qs('#togglePassword');
    const input = qs('#loginForm [name=password]');
    if(toggle && input) toggle.onclick = () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      toggle.textContent = show ? 'Ocultar' : 'Mostrar';
      toggle.setAttribute('aria-pressed',String(show));
      input.focus();
    };
    if(input && !qs('#authScreen')?.classList.contains('hidden')) setTimeout(() => input.focus(),50);
  }

  /* ---------- Arranque ---------- */
  function afterInit(){
    enhanceNav();
    wrapShowView();
    showToday();
    addClearFilters('#ordersView .toolbar',['#searchInput','#statusFilter','#buildingFilter','#specialtyFilter']);
    addClearFilters('#toolsView .toolbar',['#toolSearch','#toolStatusFilter']);
    enhanceDialogs();
    watchSync();
    decorate(document);
    new MutationObserver(records => {
      for(const r of records) r.addedNodes.forEach(n => { if(n.nodeType === 1){ decorate(n.parentElement || n); if(n.matches?.('dialog')) enhanceDialogs(); } });
    }).observe(document.body,{childList:true,subtree:true});
    const initial = location.hash.slice(1);
    window.showView(VIEW_TITLES[initial] && qs(`#${initial}View`) ? initial : currentView());
    history.replaceState(null,'',`#${currentView()}`);
  }

  // La sesión puede haberse restaurado antes de que cargue este archivo.
  if(typeof appStarted !== 'undefined' && appStarted) afterInit();
  else if(typeof window.init === 'function'){
    const originalInit = window.init;
    window.init = function(){ const result = originalInit.apply(this,arguments); afterInit(); return result; };
  }
  wrapShowView();
  enhanceLogin();
})();
