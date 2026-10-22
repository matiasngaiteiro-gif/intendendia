// Pantallas de la prueba piloto. Toda la lógica de datos está en core.js.
(() => {
  'use strict';
  const C = window.Core;
  const CATALOG = typeof OFFICIAL_CONTACTS === 'undefined' ? [] : OFFICIAL_CONTACTS;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const main = $('#main');

  // Íconos de línea, simples y en un solo color (toman el color del texto).
  const ICON_PATHS = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    list: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3.5h6v3H9z"/><path d="M9 11h6M9 15h6"/>',
    toolbox: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V5h6v3M3 13h18M10 13v2h4v-2"/>',
    phone: '<path d="M5 4h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 6.1 6.1l1.4-2.3L20 15.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    printer: '<path d="M7 9V4h10v5"/><rect x="3.5" y="9" width="17" height="8" rx="1.5"/><path d="M7 14h10v6H7z"/>',
    pencil: '<path d="M4 20l4.5-1 10.3-10.3a2 2 0 0 0-3.5-3.5L5 15.5z"/><path d="M14 6.5l3.5 3.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.3 5.3L4 17l3 3 5.4-5.4a4 4 0 0 0 5.3-5.3l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    alert: '<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.2v.3"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    save: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14"/>',
    hand: '<path d="M5 12h4l3-3h4a2 2 0 0 1 0 4h-3M5 18h9l5-4a1.5 1.5 0 0 0-2-2.2L14 13"/><path d="M2 11v8"/>',
    bolt: '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
    drop: '<path d="M12 3.5s6 6.8 6 11a6 6 0 0 1-12 0c0-4.2 6-11 6-11z"/>',
    door: '<rect x="6" y="3" width="12" height="18" rx="1"/><path d="M3.5 21h17"/><circle cx="14.5" cy="12" r=".9" fill="currentColor"/>',
    snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5"/>',
    roller: '<rect x="4" y="4" width="13" height="5" rx="1"/><path d="M17 6.5h3v5h-8v3"/><rect x="10.5" y="14.5" width="3" height="6" rx="1"/>',
    bricks: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 9.7v4.6M9 14.3V19"/>',
    chair: '<path d="M7 3v18M17 13v8M7 13h10M7 3h7a3 3 0 0 1 3 3v3H7"/>',
    box: '<path d="M3.5 7.5L12 3.5l8.5 4v9L12 20.5l-8.5-4z"/><path d="M3.5 7.5L12 11.5l8.5-4M12 11.5v9"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3.5h6v3H9z"/><path d="M9 12h6M9 16h4"/>',
    building: '<path d="M4 21V5l8-2v18M12 8h8v13M8 8v.01M8 12v.01M8 16v.01M16 12v.01M16 16v.01M2.5 21h19"/>'
  };
  const icon = (name, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON_PATHS[name] || ICON_PATHS.wrench}</svg>`;
  $$('[data-nav-icon]').forEach(el => { el.innerHTML = icon(el.dataset.navIcon); });

  // ---------- Guardado en este navegador ----------
  let state, revision = 0;
  function readStored() {
    try { return JSON.parse(localStorage.getItem(C.STORAGE_KEY)) || null; } catch { return null; }
  }
  function load() {
    const row = readStored();
    revision = Number(row?.revision || 0);
    state = C.normalizeState(row?.data || null, CATALOG);
  }
  function save() {
    const row = {data: state, revision: revision + 1, updated_at: new Date().toISOString()};
    try {
      localStorage.setItem(C.STORAGE_KEY, JSON.stringify(row));
      revision = row.revision;
      return true;
    } catch {
      toast('No se pudo guardar: el navegador no tiene espacio. Descargá una copia en Ajustes.');
      return false;
    }
  }
  // Si se cambió algo en otra pestaña, se muestra lo último.
  window.addEventListener('storage', e => { if (e.key === C.STORAGE_KEY) { load(); render(); } });

  // ---------- Preferencias de este equipo ----------
  const PREF_KEY = 'intendencia-preferencias';
  const prefs = (() => { try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; } catch { return {}; } })();
  const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch {} };
  const applyTextSize = () => { document.documentElement.dataset.textSize = prefs.size || 'normal'; };
  applyTextSize();

  // ---------- Avisos ----------
  let toastTimer;
  function toast(message, undo) {
    const t = $('#toast');
    t.innerHTML = `<span>${esc(message)}</span>${undo ? '<button type="button" class="toast-undo">Deshacer</button>' : ''}`;
    t.hidden = false;
    if (undo) $('.toast-undo', t).onclick = () => { undo(); hideToast(); };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, undo ? 7000 : 3500);
  }
  function hideToast() { $('#toast').hidden = true; }

  // ---------- Ventanas (diálogos) ----------
  const dialog = $('#dialog');
  function openDialog(html, onReady) {
    $('#dialogBody').innerHTML = html;
    $$('[data-close]', dialog).forEach(b => b.onclick = () => dialog.close());
    if (onReady) onReady($('#dialogBody'));
    if (!dialog.open) dialog.showModal();
  }
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

  function confirmBox({title, text, yes, danger}) {
    return new Promise(resolve => {
      let answer = false;
      openDialog(`<div class="dlg"><h2 id="dialogTitle">${esc(title)}</h2>${text ? `<p>${esc(text)}</p>` : ''}
        <div class="dlg-actions"><button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-yes>${esc(yes)}</button>
        <button type="button" class="btn btn-ghost" data-close>No, volver</button></div></div>`, body => {
        $('[data-yes]', body).onclick = () => { answer = true; dialog.close(); };
      });
      dialog.addEventListener('close', () => resolve(answer), {once: true});
    });
  }

  // ---------- Navegación (usa la barra de direcciones: el botón Atrás funciona) ----------
  function go(path, replace) {
    const hash = '#/' + path;
    if (replace) { history.replaceState(null, '', hash); render(); }
    else if (location.hash === hash) render();
    else location.hash = hash;
  }
  window.addEventListener('hashchange', render);

  function route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    return {name: parts[0] || 'pedidos', parts};
  }

  function render() {
    if (dialog.open) dialog.close();
    const r = route();
    const tab = ['herramientas', 'contactos', 'ajustes'].includes(r.name) ? r.name : 'pedidos';
    $$('.tabs a').forEach(a => a.classList.toggle('active', a.dataset.tab === tab));
    document.body.dataset.screen = r.name;
    if (r.name === 'nuevo') renderWizard('new', null, r.parts[1]);
    else if (r.name === 'editar') renderWizard('edit', r.parts[1], r.parts[2]);
    else if (r.name === 'pedido') renderOrder(r.parts[1]);
    else if (r.name === 'herramientas') renderTools();
    else if (r.name === 'contactos') renderContacts();
    else if (r.name === 'ajustes') renderSettings();
    else renderOrders(r.parts[1] === 'terminados');
    window.scrollTo(0, 0);
  }

  // ==================== PEDIDOS ====================
  const listView = {q: '', building: ''};
  const statusClass = v => ({'Pendiente': 'pending', 'En proceso': 'progress', 'Faltan insumos': 'missing', 'Resuelto': 'done'}[v] || 'pending');

  function orderCard(o) {
    const s = C.statusInfo(o.status);
    const t = C.trade(o.specialty);
    const urgentOpen = C.isUrgent(o) && !C.isDone(o);
    return `<a class="card order-card${urgentOpen ? ' is-urgent' : ''}" href="#/pedido/${encodeURIComponent(o.id)}">
      <span class="card-icon">${icon(t?.icon)}</span>
      <span class="card-main">
        <span class="card-title">${esc(o.title)}</span>
        <span class="card-sub">${esc(C.orderPlace(o))}</span>
        <span class="card-meta">${esc(C.tradeLabel(o.specialty))} · ${esc(C.isDone(o) ? 'Terminado ' + C.when(o.completedAt || o.updatedAt).toLowerCase() : 'Pedido ' + C.when(o.createdAt).toLowerCase())}</span>
      </span>
      <span class="card-side">${urgentOpen ? '<span class="pill pill-urgent">Urgente</span>' : ''}${C.isDone(o) ? '' : `<span class="pill pill-${statusClass(o.status)}">${esc(s.label)}</span>`}</span>
    </a>`;
  }

  function lastBackup() { try { return localStorage.getItem(C.BACKUP_KEY); } catch { return null; } }

  // Recordatorio de copia: si nunca se hizo, recién aparece cuando hay pedidos de hace 2 días o más.
  function backupReminder() {
    if (!state.orders.length) return '';
    const last = lastBackup();
    if (last ? C.daysSince(last) < 7 : !state.orders.some(o => C.daysSince(o.createdAt) >= 2)) return '';
    return `<div class="notice">${icon('save', 'notice-ico')}<div><strong>${last ? 'Hace más de una semana que no guardás una copia.' : 'Todavía no guardaste una copia de los pedidos.'}</strong>
      <p>Los pedidos quedan en esta computadora. Una copia sirve por si se borran.</p></div><button type="button" class="btn btn-small btn-secondary" data-backup>Guardar copia</button></div>`;
  }

  function renderOrders(showDone) {
    const open = state.orders.filter(o => !C.isDone(o));
    const done = state.orders.filter(C.isDone);
    const urgent = open.filter(C.isUrgent).length;
    const base = showDone ? done : open;
    const filtered = C.sortOrders(C.searchOrders(base, listView.q).filter(o => !listView.building || o.building === listView.building), showDone);
    const filtering = listView.q || listView.building;

    main.innerHTML = `
      <button type="button" class="btn btn-primary btn-hero" data-new-order>${icon('plus')} Nuevo pedido</button>
      ${backupReminder()}
      <div class="segmented" role="tablist" aria-label="Qué pedidos ver">
        <a role="tab" href="#/pedidos" aria-selected="${!showDone}" class="${showDone ? '' : 'active'}">Por hacer <b>${open.length}</b></a>
        <a role="tab" href="#/pedidos/terminados" aria-selected="${showDone}" class="${showDone ? 'active' : ''}">Terminados <b>${done.length}</b></a>
      </div>
      ${!showDone && urgent ? `<p class="summary-line"><span class="pill pill-urgent">${urgent} urgente${urgent === 1 ? '' : 's'}</span> aparece${urgent === 1 ? '' : 'n'} primero.</p>` : ''}
      ${base.length > 4 || filtering ? `<div class="filters">
        <label class="search"><span class="sr-only">Buscar pedidos</span>${icon('search')}<input type="search" id="orderSearch" placeholder="Buscar: luz, juzgado 5, plomero…" value="${esc(listView.q)}" autocomplete="off"></label>
        <div class="chips" role="group" aria-label="Edificio">
          <button type="button" class="chip${listView.building ? '' : ' active'}" data-building="">Todos</button>
          ${C.BUILDINGS.map(b => `<button type="button" class="chip${listView.building === b.id ? ' active' : ''}" data-building="${esc(b.id)}">${esc(b.short)}</button>`).join('')}
        </div></div>` : ''}
      <div class="list" id="orderList">${listHtml()}</div>`;

    function listHtml() {
      if (filtered.length) return filtered.map(orderCard).join('');
      if (filtering) return `<div class="empty"><p>No hay pedidos que coincidan.</p><button type="button" class="btn btn-ghost" data-clear>Ver todos</button></div>`;
      return showDone
        ? `<div class="empty"><p>Todavía no hay pedidos terminados.</p></div>`
        : `<div class="empty"><p><strong>No hay nada pendiente.</strong></p><p>Cuando haya un trabajo para hacer, tocá «Nuevo pedido».</p></div>`;
    }

    const search = $('#orderSearch');
    if (search) {
      search.oninput = () => {
        listView.q = search.value;
        const pos = search.selectionStart;
        renderOrders(showDone);
        const again = $('#orderSearch');
        again.focus();
        again.setSelectionRange(pos, pos);
      };
    }
    $$('[data-building]').forEach(b => b.onclick = () => { listView.building = b.dataset.building; renderOrders(showDone); });
    $$('[data-clear]').forEach(b => b.onclick = () => { listView.q = ''; listView.building = ''; renderOrders(showDone); });
    $('[data-new-order]').onclick = startNewOrder;
    bindBackup();
  }

  function renderOrder(id) {
    const o = state.orders.find(x => x.id === id);
    if (!o) {
      main.innerHTML = `<div class="empty"><p>Ese pedido no existe o fue borrado.</p><a class="btn btn-primary" href="#/pedidos">Volver a pedidos</a></div>`;
      return;
    }
    const t = C.trade(o.specialty);
    main.innerHTML = `
      <a class="back" href="#/pedidos${C.isDone(o) ? '/terminados' : ''}">${icon('back')} Volver a pedidos</a>
      <article class="detail">
        <div class="detail-head">
          <span class="card-icon big">${icon(t?.icon)}</span>
          <div><p class="eyebrow">Pedido ${esc(o.id)}</p><h1>${esc(o.title)}</h1>
          ${C.isUrgent(o) ? '<span class="pill pill-urgent">Urgente</span>' : ''}</div>
        </div>
        <dl class="facts">
          <div><dt>Dónde</dt><dd>${esc(C.orderPlace(o) || 'Sin indicar')}</dd></div>
          <div><dt>Quién lo hace</dt><dd>${esc(C.tradeLabel(o.specialty))}</dd></div>
          ${o.description ? `<div><dt>Nota</dt><dd>${esc(o.description)}</dd></div>` : ''}
          <div><dt>Pedido</dt><dd>${esc(C.when(o.createdAt))}</dd></div>
          ${C.isDone(o) && o.completedAt ? `<div><dt>Terminado</dt><dd>${esc(C.when(o.completedAt))}</dd></div>` : ''}
        </dl>
        <h2 class="section-title">¿Cómo está este trabajo?</h2>
        <div class="status-grid" role="group" aria-label="Estado del pedido">
          ${C.STATUSES.map(s => `<button type="button" class="status-btn status-${statusClass(s.value)}${o.status === s.value ? ' active' : ''}" data-status="${esc(s.value)}" aria-pressed="${o.status === s.value}">${icon(s.icon)}${esc(s.label)}</button>`).join('')}
        </div>
        <div class="action-stack">
          <div class="action-row">
            <button type="button" class="btn btn-primary" data-print>${icon('printer')} Imprimir</button>
            <button type="button" class="btn btn-secondary" data-edit>${icon('pencil')} Modificar</button>
          </div>
          <button type="button" class="btn btn-link-danger" data-delete>Borrar este pedido</button>
        </div>
      </article>`;

    $$('[data-status]').forEach(b => b.onclick = () => setStatus(o, b.dataset.status));
    $('[data-print]').onclick = () => printOrder(o);
    $('[data-delete]').onclick = () => deleteOrder(o);
    $('[data-edit]').onclick = () => { wizardClosed = false; draft = null; go(`editar/${encodeURIComponent(o.id)}/resumen`); };
  }

  function setStatus(o, value) {
    if (o.status === value) return;
    const before = {status: o.status, completedAt: o.completedAt, updatedAt: o.updatedAt};
    o.status = value;
    o.updatedAt = new Date().toISOString();
    if (value === C.DONE) o.completedAt = o.updatedAt; else delete o.completedAt;
    if (!save()) return;
    if (value === C.DONE) {
      go('pedidos');
      toast(`Listo: «${o.title}» quedó como terminado.`, () => {
        Object.assign(o, before);
        if (!before.completedAt) delete o.completedAt;
        save();
        render();
      });
    } else {
      render();
      toast(`Estado: ${C.statusInfo(value).label}.`);
    }
  }

  async function deleteOrder(o) {
    const ok = await confirmBox({title: '¿Borrar este pedido?', text: `«${o.title}» se va a borrar. Si fue un error, vas a poder deshacerlo enseguida.`, yes: 'Sí, borrar', danger: true});
    if (!ok) return;
    const index = state.orders.indexOf(o);
    state.orders.splice(index, 1);
    save();
    go('pedidos', true);
    toast('Pedido borrado.', () => { state.orders.splice(index, 0, o); save(); render(); });
  }

  function printOrder(o) {
    $('#printSheet').innerHTML = `
      <header class="ps-head"><div><h1>ORDEN DE TRABAJO</h1><p>Intendencia — Cámara Nacional de Apelaciones en lo Comercial</p></div>
      <div class="ps-num"><span>Número</span><strong>${esc(o.id)}</strong><span>Emitida: ${esc(C.fullDate(o.createdAt))}</span></div></header>
      <table class="ps-table">
        <tr><th>Trabajo</th><td colspan="3"><strong>${esc(o.title)}</strong>${C.isUrgent(o) ? ' — URGENTE' : ''}</td></tr>
        <tr><th>Edificio</th><td>${esc(C.building(o.building)?.address || o.building)}</td><th>Dependencia</th><td>${esc(C.shortDependency(o.dependency) || '—')}</td></tr>
        <tr><th>Piso / oficina</th><td colspan="3">${esc(o.location || '—')}</td></tr>
        <tr><th>Oficio</th><td>${esc(C.tradeLabel(o.specialty))}</td><th>Estado</th><td>${esc(C.statusInfo(o.status).label)}</td></tr>
        <tr><th>Indicaciones</th><td colspan="3" class="ps-tall">${esc(o.description || '')}</td></tr>
      </table>
      <section class="ps-lines"><h2>Registro del trabajo</h2>
        <p>Fecha y hora de inicio:</p><p>Fecha y hora de finalización:</p><p>Materiales utilizados:</p><p>Observaciones:</p></section>
      <footer class="ps-sign"><p>Firma de quien hizo el trabajo</p><p>Conformidad de la dependencia</p></footer>`;
    window.print();
  }

  // ==================== NUEVO PEDIDO (paso a paso) ====================
  let draft = null;
  // Al guardar o cancelar, si se vuelve con el botón Atrás a pasos ya cerrados, se siguen salteando.
  let wizardClosed = false;
  const STEPS = {oficio: 1, tarea: 1, lugar: 2, urgencia: 3, resumen: 4};

  function startNewOrder() {
    wizardClosed = false;
    draft = startDraft('new');
    go('nuevo/oficio');
  }

  function startDraft(mode, id) {
    if (mode === 'edit') {
      const o = state.orders.find(x => x.id === id);
      if (!o) return null;
      return {
        mode, id, specialty: o.specialty, title: o.title, custom: !(C.TASKS[o.specialty] || []).includes(o.title),
        building: o.building, dependency: C.shortDependency(o.dependency), location: o.location || '',
        priority: C.isUrgent(o) ? 'Urgente' : 'Media', description: o.description || ''
      };
    }
    return {mode, specialty: '', title: '', custom: false, building: '', dependency: '', location: '', priority: '', description: ''};
  }

  function wizardPath(step) {
    return draft.mode === 'edit' ? `editar/${encodeURIComponent(draft.id)}/${step}` : `nuevo/${step}`;
  }

  function renderWizard(mode, id, step) {
    if (!draft || draft.mode !== mode || (mode === 'edit' && draft.id !== id)) {
      if (wizardClosed) { history.back(); return; }
      draft = startDraft(mode, id);
      if (!draft) { go('pedidos', true); return; }
      if (mode === 'new' && step && step !== 'oficio') { go('nuevo/oficio', true); return; }
    }
    step = STEPS[step] ? step : (mode === 'edit' ? 'resumen' : 'oficio');
    // No se puede saltar pasos sin completar los anteriores.
    if (step !== 'oficio' && !draft.specialty) return go(wizardPath('oficio'), true);
    if (STEPS[step] >= 2 && !draft.title) return go(wizardPath('tarea'), true);
    if (STEPS[step] >= 3 && (!draft.building || !draft.dependency)) return go(wizardPath('lugar'), true);
    if (STEPS[step] >= 4 && !draft.priority) return go(wizardPath('urgencia'), true);

    const n = STEPS[step];
    const head = `<div class="wizard-head">
      <button type="button" class="back" data-cancel>${icon('x')} ${draft.mode === 'edit' ? 'Cancelar cambios' : 'Cancelar'}</button>
      ${n < 4 ? `<p class="step-count">Paso ${n} de 3</p><div class="progress" aria-hidden="true"><span style="width:${n / 3 * 100}%"></span></div>` : ''}</div>`;
    const back = prev => `<button type="button" class="btn btn-ghost btn-back" data-step="${prev}">${icon('back')} Atrás</button>`;
    let body = '';

    if (step === 'oficio') {
      body = `<h1 class="q">¿Quién tiene que hacer el trabajo?</h1>
        <div class="tiles">${C.TRADES.map(t => `<button type="button" class="tile${draft.specialty === t.key ? ' selected' : ''}" data-trade="${esc(t.key)}">${icon(t.icon, 'tile-icon')}<span class="tile-label">${esc(t.label)}</span><span class="tile-hint">${esc(t.hint)}</span></button>`).join('')}</div>`;
    } else if (step === 'tarea') {
      const tasks = C.TASKS[draft.specialty] || [];
      const t = C.trade(draft.specialty);
      body = `<p class="crumb">${icon(t.icon)} ${esc(t.label)}</p><h1 class="q">¿Qué hay que hacer?</h1>
        <div class="options">${tasks.map(name => `<button type="button" class="option${!draft.custom && draft.title === name ? ' selected' : ''}" data-task="${esc(name)}">${esc(name)}</button>`).join('')}
        <button type="button" class="option option-other${draft.custom ? ' selected' : ''}" data-other>${icon('pencil')} Otra cosa (escribirla)</button></div>
        <div class="custom-task" ${draft.custom ? '' : 'hidden'}>
          <label for="customTask" class="field-label">Escribí qué hay que hacer</label>
          <input id="customTask" maxlength="90" value="${draft.custom ? esc(draft.title) : ''}" placeholder="Ej.: cambiar el vidrio de la ventana">
          <button type="button" class="btn btn-primary btn-block" data-custom-ok>Continuar</button>
        </div>
        ${back('oficio')}`;
    } else if (step === 'lugar') {
      const deps = draft.building ? C.dependenciesForBuilding(draft.building, CATALOG) : [];
      const groups = [
        ['Juzgados', deps.filter(d => /^Juzgado/.test(d.name))],
        ['Salas', deps.filter(d => /^Sala/.test(d.name))],
        ['Otras oficinas', deps.filter(d => !/^(Juzgado|Sala)/.test(d.name))]
      ].filter(g => g[1].length);
      const depButton = d => `<button type="button" class="option${draft.dependency === d.name ? ' selected' : ''}" data-dep="${esc(d.name)}" data-floor="${esc(d.floor)}"><span>${esc(d.name.replace('Juzgado N.º ', 'Juzgado '))}</span>${d.floor ? `<small>${esc(d.floor)}</small>` : ''}</button>`;
      body = `<h1 class="q">¿Dónde hay que hacerlo?</h1>
        <h2 class="sub-q">Edificio</h2>
        <div class="tiles tiles-3">${C.BUILDINGS.map(b => `<button type="button" class="tile tile-building${draft.building === b.id ? ' selected' : ''}" data-bld="${esc(b.id)}"><span class="tile-label">${esc(b.short)}</span><span class="tile-hint">${esc(b.address)}</span></button>`).join('')}</div>
        ${draft.building ? `<h2 class="sub-q" id="depTitle">Oficina o dependencia</h2>
          ${groups.map(([title, list]) => `<p class="group-label">${esc(title)}</p><div class="options options-grid">${list.map(depButton).join('')}</div>`).join('')}
          ${draft.dependency && !deps.some(d => d.name === draft.dependency) ? `<p class="hint">Antes se había cargado: <strong>${esc(draft.dependency)}</strong>. Elegí una de la lista para cambiarla.</p>` : ''}` : ''}
        ${draft.dependency ? `<div class="field" id="locField">
          <label for="locInput" class="field-label">Piso, oficina o detalle <span class="optional">(si sabés)</span></label>
          <input id="locInput" value="${esc(draft.location)}" maxlength="120" placeholder="Ej.: 5º piso, oficina 503, baño de hombres">
          <button type="button" class="btn btn-primary btn-block" data-loc-ok>Continuar</button></div>` : ''}
        ${back('tarea')}`;
    } else if (step === 'urgencia') {
      body = `<h1 class="q">¿Es urgente?</h1>
        <div class="tiles tiles-2">
          <button type="button" class="tile${draft.priority === 'Media' ? ' selected' : ''}" data-prio="Media">${icon('clock', 'tile-icon')}<span class="tile-label">No, es normal</span><span class="tile-hint">Se hace en el orden de llegada</span></button>
          <button type="button" class="tile tile-urgent${draft.priority === 'Urgente' ? ' selected' : ''}" data-prio="Urgente">${icon('alert', 'tile-icon')}<span class="tile-label">Sí, es urgente</span><span class="tile-hint">Aparece primero en la lista</span></button>
        </div>
        <div class="field">
          <label for="noteInput" class="field-label">¿Algo más que tengan que saber? <span class="optional">(no es obligatorio)</span></label>
          <textarea id="noteInput" rows="3" maxlength="400" placeholder="Ej.: preguntar por Marta, llevar escalera">${esc(draft.description)}</textarea>
        </div>
        <button type="button" class="btn btn-primary btn-block" data-review ${draft.priority ? '' : 'disabled'}>Revisar el pedido →</button>
        ${back('lugar')}`;
    } else {
      draft.reviewed = true;
      const t = C.trade(draft.specialty);
      const row = (label, value, stepName) => `<div class="review-row"><div><dt>${label}</dt><dd>${value}</dd></div><button type="button" class="btn btn-small btn-ghost" data-step="${stepName}">Cambiar</button></div>`;
      body = `<h1 class="q">${draft.mode === 'edit' ? 'Modificar pedido' : '¿Está todo bien?'}</h1>
        <dl class="review">
          ${row('Quién lo hace', esc(t.label), 'oficio')}
          ${row('Qué hay que hacer', esc(draft.title), 'tarea')}
          ${row('Dónde', esc(C.orderPlace(draft)), 'lugar')}
          ${row('Urgencia', draft.priority === 'Urgente' ? '<span class="pill pill-urgent">Urgente</span>' : 'Normal', 'urgencia')}
          ${draft.description ? row('Nota', esc(draft.description), 'urgencia') : ''}
        </dl>
        <div class="action-stack">
          ${draft.mode === 'edit'
            ? `<button type="button" class="btn btn-primary btn-block" data-save>Guardar cambios</button>`
            : `<button type="button" class="btn btn-primary btn-block" data-save="print">${icon('printer')} Guardar e imprimir</button>
               <button type="button" class="btn btn-secondary btn-block" data-save>Guardar sin imprimir</button>`}
        </div>`;
    }

    main.innerHTML = `<section class="wizard">${head}${body}</section>`;

    // Después de revisar, cada cambio vuelve directo al resumen.
    const next = s => go(wizardPath(draft.reviewed ? 'resumen' : s));
    $('[data-cancel]').onclick = cancelWizard;
    $$('[data-step]').forEach(b => b.onclick = () => go(wizardPath(b.dataset.step)));

    $$('[data-trade]').forEach(b => b.onclick = () => {
      if (draft.specialty !== b.dataset.trade) { draft.specialty = b.dataset.trade; draft.title = ''; draft.custom = false; }
      go(wizardPath('tarea'));
    });
    $$('[data-task]').forEach(b => b.onclick = () => { draft.title = b.dataset.task; draft.custom = false; next('lugar'); });
    const other = $('[data-other]');
    if (other) other.onclick = () => {
      $('.custom-task').hidden = false;
      $$('.option').forEach(x => x.classList.remove('selected'));
      other.classList.add('selected');
      $('#customTask').focus();
    };
    const okCustom = () => {
      const v = $('#customTask').value.trim();
      if (!v) { $('#customTask').focus(); toast('Escribí qué hay que hacer.'); return; }
      draft.title = v.charAt(0).toUpperCase() + v.slice(1);
      draft.custom = true;
      next('lugar');
    };
    if ($('[data-custom-ok]')) {
      $('[data-custom-ok]').onclick = okCustom;
      $('#customTask').onkeydown = e => { if (e.key === 'Enter') okCustom(); };
    }

    $$('[data-bld]').forEach(b => b.onclick = () => {
      if (draft.building !== b.dataset.bld) { draft.building = b.dataset.bld; draft.dependency = ''; draft.location = ''; }
      renderWizard(mode, id, 'lugar');
      $('#depTitle')?.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
    $$('[data-dep]').forEach(b => b.onclick = () => {
      if (draft.dependency !== b.dataset.dep) {
        draft.dependency = b.dataset.dep;
        draft.location = b.dataset.floor || ''; // el piso de la guía ya queda escrito
      }
      renderWizard(mode, id, 'lugar');
      $('#locField')?.scrollIntoView({behavior: 'smooth', block: 'center'});
      const input = $('#locInput');
      if (input) { input.focus({preventScroll: true}); input.setSelectionRange(input.value.length, input.value.length); }
    });
    const okLoc = () => { draft.location = $('#locInput').value.trim(); next('urgencia'); };
    if ($('[data-loc-ok]')) {
      $('[data-loc-ok]').onclick = okLoc;
      $('#locInput').onkeydown = e => { if (e.key === 'Enter') okLoc(); };
    }

    const note = $('#noteInput');
    if (note) note.oninput = () => { draft.description = note.value; };
    $$('[data-prio]').forEach(b => b.onclick = () => {
      draft.priority = b.dataset.prio;
      $$('[data-prio]').forEach(x => x.classList.toggle('selected', x === b));
      $('[data-review]').disabled = false;
    });
    if ($('[data-review]')) $('[data-review]').onclick = () => { draft.description = note.value.trim(); go(wizardPath('resumen')); };

    $$('[data-save]').forEach(b => b.onclick = () => saveDraft(b.dataset.save === 'print'));
  }

  async function cancelWizard() {
    if (draft && (draft.mode === 'edit' || draft.specialty)) {
      const ok = await confirmBox({
        title: draft.mode === 'edit' ? '¿Salir sin guardar los cambios?' : '¿Cancelar el pedido?',
        text: 'Lo que cargaste hasta ahora no se va a guardar.', yes: 'Sí, salir', danger: true
      });
      if (!ok) return;
    }
    const target = draft?.mode === 'edit' ? `pedido/${encodeURIComponent(draft.id)}` : 'pedidos';
    draft = null;
    wizardClosed = true;
    go(target, true);
  }

  function saveDraft(andPrint) {
    const now = new Date().toISOString();
    const data = {
      title: draft.title, specialty: draft.specialty, building: draft.building, dependency: draft.dependency,
      location: draft.location, priority: draft.priority, description: draft.description.trim()
    };
    let order;
    if (draft.mode === 'edit') {
      order = state.orders.find(o => o.id === draft.id);
      if (!order) { toast('Ese pedido ya no existe.'); go('pedidos', true); return; }
      // Prioridades viejas (Alta, Baja) se conservan si no se marcó urgente.
      const keepOld = !['Media', 'Urgente'].includes(order.priority) && data.priority === 'Media';
      Object.assign(order, data, keepOld ? {priority: order.priority} : {}, {updatedAt: now});
    } else {
      order = {id: C.nextId(state.orders, 'OT'), ...data, status: 'Pendiente', createdAt: now, updatedAt: now};
      state.orders.push(order);
    }
    if (!save()) return;
    const wasEdit = draft.mode === 'edit';
    draft = null;
    wizardClosed = true;
    go(`pedido/${encodeURIComponent(order.id)}`, true);
    toast(wasEdit ? 'Cambios guardados.' : 'Pedido guardado.');
    if (andPrint) setTimeout(() => printOrder(order), 150);
  }

  // ==================== HERRAMIENTAS ====================
  const toolView = {q: ''};
  function renderTools() {
    const q = C.normalizeText(toolView.q);
    const list = state.tools
      .filter(t => !q || C.normalizeText([t.name, t.brand, t.model, t.serial, t.holder].join(' ')).includes(q))
      .sort((a, b) => String(a.name).localeCompare(String(b.name), 'es'));
    const out = state.tools.filter(t => t.holder).length;
    const pill = t => t.holder ? `<span class="pill pill-progress">La tiene: ${esc(t.holder)}</span>`
      : t.toolStatus === 'En reparación' ? '<span class="pill pill-missing">En reparación</span>'
      : t.toolStatus === 'Fuera de servicio' ? '<span class="pill">Fuera de servicio</span>'
      : '<span class="pill pill-done">Disponible</span>';
    main.innerHTML = `
      <h1 class="page-title">Herramientas</h1>
      <p class="lead">${state.tools.length ? `${state.tools.length} herramienta${state.tools.length === 1 ? '' : 's'} · ${out} prestada${out === 1 ? '' : 's'}` : 'Anotá acá qué herramientas hay y a quién se prestan.'}</p>
      <button type="button" class="btn btn-primary btn-block" data-new-tool>${icon('plus')} Agregar herramienta</button>
      ${state.tools.length > 5 ? `<label class="search"><span class="sr-only">Buscar herramientas</span>${icon('search')}<input type="search" id="toolSearch" placeholder="Buscar herramienta" value="${esc(toolView.q)}" autocomplete="off"></label>` : ''}
      <div class="list">${list.length ? list.map(t => `<button type="button" class="card tool-card" data-tool="${esc(t.id)}">
        <span class="card-main"><span class="card-title">${esc(t.name)}</span>
        <span class="card-sub">${esc([t.brand, t.model].filter(Boolean).join(' ') || 'Sin marca')}${t.serial ? ' · N.º ' + esc(t.serial) : ''}</span></span>
        <span class="card-side">${pill(t)}</span></button>`).join('')
        : `<div class="empty"><p>${q ? 'No se encontró esa herramienta.' : 'Todavía no hay herramientas cargadas.'}</p></div>`}</div>`;
    $('[data-new-tool]').onclick = () => toolForm();
    $$('[data-tool]').forEach(b => b.onclick = () => toolSheet(state.tools.find(t => t.id === b.dataset.tool)));
    const s = $('#toolSearch');
    if (s) s.oninput = () => {
      toolView.q = s.value;
      const p = s.selectionStart;
      renderTools();
      const a = $('#toolSearch');
      a.focus();
      a.setSelectionRange(p, p);
    };
  }

  function toolSheet(t) {
    if (!t) return;
    const history = (t.returns || []).slice(-3).reverse();
    openDialog(`<div class="dlg"><button type="button" class="dlg-x" data-close aria-label="Cerrar">${icon('x')}</button>
      <h2 id="dialogTitle">${esc(t.name)}</h2>
      <p class="muted">${esc([t.brand, t.model].filter(Boolean).join(' '))}${t.serial ? ' · N.º ' + esc(t.serial) : ''}</p>
      ${t.holder ? `<p class="big-status">La tiene <strong>${esc(t.holder)}</strong>${t.assignedDate ? ` desde ${esc(C.when(t.assignedDate).toLowerCase())}` : ''}.</p>
        <button type="button" class="btn btn-primary btn-block" data-return>${icon('check')} Ya la devolvió</button>`
        : `<p class="big-status">${t.toolStatus === 'Disponible' ? 'Está disponible.' : esc(t.toolStatus) + '.'}</p>
        <h3 class="sub-q">¿A quién se la prestás?</h3>
        <form class="lend" id="lendForm">
          <label class="field-label" for="lendName">Nombre de la persona</label>
          <input id="lendName" list="peopleList" maxlength="60" autocomplete="off" placeholder="Ej.: Carlos Benítez">
          <datalist id="peopleList">${C.peopleNames(state).map(n => `<option value="${esc(n)}"></option>`).join('')}</datalist>
          <button type="submit" class="btn btn-primary btn-block">${icon('hand')} Prestar</button>
        </form>`}
      ${t.notes ? `<p class="muted">Nota: ${esc(t.notes)}</p>` : ''}
      ${history.length ? `<p class="muted small">Últimas devoluciones: ${history.map(h => esc(`${h.holderName && !C.trade(h.holder) ? h.holderName + ', ' : ''}${C.when(h.returnedAt).toLowerCase()}`)).join(' · ')}</p>` : ''}
      <div class="dlg-actions"><button type="button" class="btn btn-secondary" data-edit>${icon('pencil')} Modificar</button><button type="button" class="btn btn-link-danger" data-del>Borrar</button></div></div>`, body => {
      const now = new Date().toISOString();
      $('[data-return]', body)?.addEventListener('click', () => {
        t.returns = Array.isArray(t.returns) ? t.returns : [];
        t.returns.push({holder: t.holder, holderName: t.holder, assignedDate: t.assignedDate || '', returnedAt: now});
        Object.assign(t, {holder: '', assignedDate: '', toolStatus: 'Disponible', returnedAt: now, updatedAt: now});
        save(); dialog.close(); renderTools(); toast('Devolución anotada.');
      });
      const lend = $('#lendForm', body);
      if (lend) lend.onsubmit = e => {
        e.preventDefault();
        const name = $('#lendName', body).value.trim();
        if (!name) { $('#lendName', body).focus(); toast('Escribí el nombre de quien se la lleva.'); return; }
        Object.assign(t, {holder: name, assignedDate: now.slice(0, 10), toolStatus: 'Entregada', updatedAt: now});
        save(); dialog.close(); renderTools(); toast(`Prestada a ${name}.`);
      };
      $('[data-edit]', body).onclick = () => toolForm(t);
      $('[data-del]', body).onclick = async () => {
        if (!await confirmBox({title: '¿Borrar esta herramienta?', text: `«${t.name}» se va a quitar de la lista.`, yes: 'Sí, borrar', danger: true})) return;
        const i = state.tools.indexOf(t);
        state.tools.splice(i, 1);
        save(); renderTools();
        toast('Herramienta borrada.', () => { state.tools.splice(i, 0, t); save(); renderTools(); });
      };
    });
  }

  function toolForm(t) {
    openDialog(`<form class="dlg" id="toolForm"><button type="button" class="dlg-x" data-close aria-label="Cerrar">${icon('x')}</button>
      <h2 id="dialogTitle">${t ? 'Modificar herramienta' : 'Agregar herramienta'}</h2>
      <label class="field-label" for="tName">Qué herramienta es</label><input id="tName" name="name" required maxlength="80" placeholder="Ej.: Taladro" value="${esc(t?.name)}">
      <label class="field-label" for="tBrand">Marca <span class="optional">(si sabés)</span></label><input id="tBrand" name="brand" maxlength="60" placeholder="Ej.: Bosch" value="${esc(t?.brand)}">
      <label class="field-label" for="tModel">Modelo <span class="optional">(si sabés)</span></label><input id="tModel" name="model" maxlength="60" value="${esc(t?.model)}">
      <label class="field-label" for="tSerial">Número de inventario <span class="optional">(si tiene)</span></label><input id="tSerial" name="serial" maxlength="40" value="${esc(t?.serial)}">
      ${t && !t.holder ? `<label class="field-label" for="tState">Estado</label><select id="tState" name="toolStatus">${['Disponible', 'En reparación', 'Fuera de servicio'].map(s => `<option${t.toolStatus === s ? ' selected' : ''}>${s}</option>`).join('')}</select>` : ''}
      <label class="field-label" for="tNotes">Nota <span class="optional">(opcional)</span></label><textarea id="tNotes" name="notes" rows="2" maxlength="300">${esc(t?.notes)}</textarea>
      <div class="dlg-actions"><button class="btn btn-primary" type="submit">Guardar</button><button type="button" class="btn btn-ghost" data-close>Cancelar</button></div></form>`, body => {
      $('#tName', body).focus();
      $('#toolForm', body).onsubmit = e => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(e.target));
        const now = new Date().toISOString();
        f.name = f.name.trim();
        if (!f.name) return;
        if (t) {
          Object.assign(t, f, {toolStatus: t.holder ? 'Entregada' : (f.toolStatus || t.toolStatus), updatedAt: now});
        } else {
          state.tools.push({id: C.nextId(state.tools, 'H'), ...f, toolStatus: 'Disponible', holder: '', assignedDate: '', createdAt: now, updatedAt: now});
        }
        save(); dialog.close(); renderTools(); toast('Herramienta guardada.');
      };
    });
  }

  // ==================== CONTACTOS ====================
  const contactView = {q: ''};
  function renderContacts() {
    const list = C.searchContacts(state.contacts, contactView.q);
    main.innerHTML = `
      <h1 class="page-title">Contactos</h1>
      <label class="search"><span class="sr-only">Buscar contactos</span>${icon('search')}<input type="search" id="contactSearch" placeholder="Buscar: juzgado 5, sala B, biblioteca…" value="${esc(contactView.q)}" autocomplete="off"></label>
      <div class="list">${list.length ? list.map(c => `<article class="card contact-card">
        <div class="card-main"><span class="card-title">${esc(c.name)}</span><span class="card-sub">${esc(c.building || '')}</span>
        ${c.notes && !c.source ? `<span class="card-meta">${esc(c.notes)}</span>` : ''}</div>
        <div class="contact-actions">
          ${c.phone ? `<a class="btn btn-small btn-secondary" href="tel:${esc(telNumber(c.phone))}">${icon('phone')} ${esc(c.phone)}</a>` : ''}
          ${c.email ? `<a class="btn btn-small btn-ghost" href="mailto:${esc(c.email)}">${icon('mail')} Correo</a>` : ''}
          ${c.source ? '' : `<button type="button" class="btn btn-small btn-ghost" data-contact="${esc(c.id)}">${icon('pencil')} Modificar</button>`}
        </div></article>`).join('') : '<div class="empty"><p>No se encontró ningún contacto.</p></div>'}</div>
      <button type="button" class="btn btn-secondary btn-block" data-new-contact>${icon('plus')} Agregar un contacto</button>
      <p class="muted small">Los datos de juzgados y salas salen de la Guía Judicial del PJN (consultada el 16/09/2026).</p>`;
    const s = $('#contactSearch');
    s.oninput = () => {
      contactView.q = s.value;
      const p = s.selectionStart;
      renderContacts();
      const a = $('#contactSearch');
      a.focus();
      a.setSelectionRange(p, p);
    };
    $('[data-new-contact]').onclick = () => contactForm();
    $$('[data-contact]').forEach(b => b.onclick = () => contactForm(state.contacts.find(c => c.id === b.dataset.contact)));
  }
  // Primer número del teléfono; si tiene 8 cifras se le agrega el 011.
  function telNumber(phone) {
    const first = String(phone).split(/\/| y /)[0].replace(/\D/g, '');
    return first.length === 8 ? '011' + first : first;
  }

  function contactForm(c) {
    openDialog(`<form class="dlg" id="contactForm"><button type="button" class="dlg-x" data-close aria-label="Cerrar">${icon('x')}</button>
      <h2 id="dialogTitle">${c ? 'Modificar contacto' : 'Agregar contacto'}</h2>
      <label class="field-label" for="cName">Nombre</label><input id="cName" name="name" required maxlength="80" placeholder="Ej.: Ferretería Pérez" value="${esc(c?.name)}">
      <label class="field-label" for="cPhone">Teléfono</label><input id="cPhone" name="phone" inputmode="tel" maxlength="40" value="${esc(c?.phone)}">
      <label class="field-label" for="cMail">Correo <span class="optional">(opcional)</span></label><input id="cMail" name="email" type="email" maxlength="80" value="${esc(c?.email)}">
      <label class="field-label" for="cNotes">Para qué sirve <span class="optional">(opcional)</span></label><input id="cNotes" name="notes" maxlength="120" placeholder="Ej.: vende repuestos de canillas" value="${esc(c?.notes)}">
      <div class="dlg-actions"><button class="btn btn-primary" type="submit">Guardar</button><button type="button" class="btn btn-ghost" data-close>Cancelar</button>
      ${c ? '<button type="button" class="btn btn-link-danger" data-del>Borrar contacto</button>' : ''}</div></form>`, body => {
      $('#cName', body).focus();
      $('#contactForm', body).onsubmit = e => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(e.target));
        if (!f.name.trim()) return;
        if (c) Object.assign(c, f, {role: c.role || 'Contacto'});
        else state.contacts.push({id: 'C-' + Date.now(), ...f, role: 'Contacto', organization: '', building: ''});
        save(); dialog.close(); renderContacts(); toast('Contacto guardado.');
      };
      $('[data-del]', body)?.addEventListener('click', async () => {
        if (!await confirmBox({title: '¿Borrar este contacto?', text: c.name, yes: 'Sí, borrar', danger: true})) return;
        const i = state.contacts.indexOf(c);
        state.contacts.splice(i, 1);
        save(); renderContacts();
        toast('Contacto borrado.', () => { state.contacts.splice(i, 0, c); save(); renderContacts(); });
      });
    });
  }

  // ==================== AJUSTES ====================
  function renderSettings() {
    const last = lastBackup();
    const size = prefs.size || 'normal';
    main.innerHTML = `
      <h1 class="page-title">Ajustes</h1>
      <section class="panel">
        <h2>Tamaño de la letra</h2>
        <div class="segmented segmented-3" role="group" aria-label="Tamaño de la letra">
          ${[['normal', 'Normal'], ['grande', 'Grande'], ['muy-grande', 'Muy grande']].map(([v, l]) => `<button type="button" data-size="${v}" class="${size === v ? 'active' : ''}" aria-pressed="${size === v}">${l}</button>`).join('')}
        </div>
      </section>
      <section class="panel">
        <h2>Copia de seguridad</h2>
        <p class="muted">Los pedidos se guardan solo en esta computadora. Guardá una copia de vez en cuando (por ejemplo, los viernes).</p>
        <p><strong>Última copia:</strong> ${last ? esc(C.when(last)) : 'nunca'}</p>
        <button type="button" class="btn btn-primary btn-block" data-backup>${icon('save')} Guardar una copia</button>
        <button type="button" class="btn btn-ghost btn-block" data-restore>Recuperar desde una copia</button>
        <input type="file" id="restoreFile" accept="application/json,.json" hidden>
      </section>`;
    $$('[data-size]', main).forEach(b => b.onclick = () => { prefs.size = b.dataset.size; savePrefs(); applyTextSize(); renderSettings(); });
    bindBackup();
    $('[data-restore]').onclick = () => $('#restoreFile').click();
    $('#restoreFile').onchange = restoreBackup;
  }

  function bindBackup() { $$('[data-backup]').forEach(b => b.onclick = downloadBackup); }
  function downloadBackup() {
    const stamp = new Date().toISOString();
    const blob = new Blob([JSON.stringify({app: 'intendencia', version: 'piloto-1', exportedAt: stamp, data: state}, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intendencia-copia-${stamp.slice(0, 10)}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    try { localStorage.setItem(C.BACKUP_KEY, stamp); } catch {}
    render();
    toast('Copia descargada. Queda en la carpeta Descargas.');
  }
  async function restoreBackup(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    let data;
    try {
      const parsed = JSON.parse(await file.text());
      data = parsed && parsed.app === 'intendencia' ? parsed.data : parsed;
      if (!data || typeof data !== 'object' || !Array.isArray(data.orders)) throw new Error();
    } catch { toast('Ese archivo no es una copia de Intendencia.'); return; }
    const ok = await confirmBox({title: '¿Recuperar esta copia?', text: `Se van a reemplazar los datos de esta computadora por los de «${file.name}» (${data.orders.length} pedidos).`, yes: 'Sí, recuperar', danger: true});
    if (!ok) return;
    state = C.normalizeState(data, CATALOG);
    save();
    go('pedidos', true);
    toast('Copia recuperada.');
  }

  // ---------- Inicio ----------
  load();
  if (!readStored()) save();
  render();
})();
