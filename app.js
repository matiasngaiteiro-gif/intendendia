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
    building: '<path d="M4 21V5l8-2v18M12 8h8v13M8 8v.01M8 12v.01M8 16v.01M16 12v.01M16 16v.01M2.5 21h19"/>',
    shelf: '<path d="M4 3v18M20 3v18M4 10h16M4 17h16"/><rect x="6.5" y="5.5" width="4" height="4.5"/><rect x="12" y="12.5" width="5.5" height="4.5"/>',
    minus: '<path d="M5 12h14"/>',
    hammer: '<path d="M14.5 4.5l5 5-2.5 2.5-5-5z"/><path d="M12 7l-2-2 2.5-2.5 2 2M13.5 10.5L4 20"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l2.5 2.5M18.5 4.5L21 7"/>',
    upload: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 20h14"/>'
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

  // ---------- Planilla compartida de Google (opcional) ----------
  // Sin planilla, todo queda en esta computadora. Con planilla, cada cambio se envía y
  // cada 30 segundos se trae lo que cargaron las demás computadoras.
  const REMOTE_KEY = 'intendencia-planilla';
  const OUTBOX_KEY = 'intendencia-pendientes';
  const readJSON = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } };
  const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  let remote = readJSON(REMOTE_KEY, null);
  let outbox = readJSON(OUTBOX_KEY, []);
  const connected = () => !!(remote && remote.url && remote.key);
  const sync = {busy: 0, error: '', lastOk: null};
  const LIST = {order: 'orders', tool: 'tools', contact: 'contacts', item: 'items'};
  const ROW = {order: C.orderRow, tool: C.toolRow, contact: C.contactRow, item: C.itemRow};
  const PREFIX = {order: 'OT', tool: 'H', contact: 'C', item: 'I'};

  const ERRORS = {
    clave: 'La clave no coincide con la de la planilla.',
    'sin-clave': 'Falta cambiar la clave en el código de la planilla (línea CLAVE).',
    red: 'No hay conexión con la planilla. Revisá internet.',
    'codigo-viejo': 'Falta actualizar el código de la planilla para usar el inventario (ver Ajustes).'
  };
  const errorText = err => ERRORS[err?.message] || ERRORS.red;

  async function api(action, payload = {}, conf = remote) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch(conf.url, {
        method: 'POST', redirect: 'follow', signal: ctrl.signal,
        headers: {'Content-Type': 'text/plain;charset=utf-8'}, // pedido simple: Google no exige permisos extra
        body: JSON.stringify({key: conf.key, action, ...payload})
      });
      if (!res.ok) throw new Error('red');
      const data = await res.json().catch(() => { throw new Error('red'); });
      if (!data.ok) throw new Error(/Tipo desconocido/.test(data.error || '') ? 'codigo-viejo' : (data.error || 'red'));
      return data;
    } catch (e) {
      throw new Error(ERRORS[e.message] ? e.message : 'red');
    } finally {
      clearTimeout(timer);
    }
  }

  function setSync(patch) { Object.assign(sync, patch); paintSync(); }
  function paintSync() {
    const el = $('#syncStatus');
    if (!el) return;
    if (!connected()) { el.hidden = true; return; }
    el.hidden = false;
    const pending = outbox.length;
    const [cls, text, long] = sync.busy ? ['busy', 'Guardando…', 'Guardando en la planilla']
      : sync.error ? ['error', 'Sin conexión', errorText({message: sync.error})]
      : pending ? ['error', `${pending} sin enviar`, `${pending} cambio${pending === 1 ? '' : 's'} esperando conexión`]
      : ['ok', 'Al día', 'La planilla está al día'];
    el.className = 'sync sync-' + cls;
    el.title = long;
    el.innerHTML = `<span class="sync-dot" aria-hidden="true"></span>${esc(text)}`;
  }

  function upsertLocal(kind, item) {
    const list = state[LIST[kind]];
    const i = list.findIndex(x => x.id === item.id);
    if (i >= 0) list[i] = item; else list.push(item);
  }

  // Alta de un registro nuevo. En la planilla el número lo asigna Google, así dos computadoras no repiten.
  async function createItem(kind, item) {
    if (!connected()) {
      item.id = C.nextId(state[LIST[kind]], PREFIX[kind]);
      upsertLocal(kind, item);
      return save() ? item : null;
    }
    setSync({busy: sync.busy + 1});
    try {
      const {item: saved} = await api('create', {kind, item, row: ROW[kind]({...item, id: ''})});
      upsertLocal(kind, saved);
      save();
      setSync({busy: sync.busy - 1, error: '', lastOk: new Date()});
      return saved;
    } catch (e) {
      setSync({busy: sync.busy - 1, error: e.message});
      toast(`No se guardó: ${errorText(e)} Probá de nuevo en un momento.`);
      return null;
    }
  }

  // Cambios y bajas: se aplican enseguida en pantalla. Si no hay conexión, quedan en espera y se reenvían solos.
  async function saveItem(kind, item) {
    upsertLocal(kind, item);
    save();
    if (connected()) await send({action: 'save', kind, item, row: ROW[kind](item)});
  }
  async function removeItem(kind, item) {
    const list = state[LIST[kind]];
    const i = list.findIndex(x => x.id === item.id);
    if (i >= 0) list.splice(i, 1);
    save();
    if (connected()) await send({action: 'delete', kind, id: item.id});
  }
  async function send(op) {
    setSync({busy: sync.busy + 1});
    try {
      await flushOutbox();
      await api(op.action, op);
      setSync({busy: sync.busy - 1, error: '', lastOk: new Date()});
    } catch (e) {
      // Solo se reintenta lo que falló por falta de conexión; otros errores no se arreglan reintentando.
      if (e.message === 'red') { outbox.push(op); writeJSON(OUTBOX_KEY, outbox); }
      setSync({busy: sync.busy - 1, error: e.message === 'red' ? e.message : ''});
      toast(e.message === 'red' ? 'Sin conexión: el cambio se envía a la planilla cuando vuelva internet.' : `No se guardó: ${errorText(e)}`);
    }
  }
  async function flushOutbox() {
    while (outbox.length) {
      try {
        await api(outbox[0].action, outbox[0]);
      } catch (e) {
        if (e.message === 'red') throw e;
      }
      outbox.shift();
      writeJSON(OUTBOX_KEY, outbox);
    }
  }

  // Trae lo último de la planilla. No interrumpe a quien está cargando algo.
  let refreshing = false;
  async function refresh({force} = {}) {
    if (!connected() || refreshing) return;
    refreshing = true;
    try {
      await flushOutbox();
      const {data} = await api('load');
      applyRemote(data);
      setSync({error: '', lastOk: new Date()});
      const typing = document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
      const r = route().name;
      if (force || (!dialog.open && !typing && r !== 'nuevo' && r !== 'editar')) render({keepScroll: true});
    } catch (e) {
      setSync({error: e.message});
    } finally {
      refreshing = false;
    }
  }
  function applyRemote(data) {
    const custom = (data.contacts || []).filter(C.isCustomContact);
    state = C.normalizeState({...state, orders: data.orders || [], tools: data.tools || [], items: data.items || [], contacts: [...structuredClone(CATALOG), ...custom]}, CATALOG);
    if (remote) { remote.sheetUrl = data.sheetUrl || remote.sheetUrl; remote.version = Number(data.version || 1); writeJSON(REMOTE_KEY, remote); }
    save();
  }
  setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 30000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh(); });
  window.addEventListener('online', () => refresh());

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

  function render({keepScroll} = {}) {
    if (dialog.open) dialog.close();
    const y = window.scrollY;
    // Sin planilla conectada no se muestra nada: solo la pantalla para conectar esta computadora.
    if (!connected()) {
      document.body.dataset.screen = 'conectar';
      renderConnect();
      window.scrollTo(0, 0);
      paintSync();
      return;
    }
    const r = route();
    const tab = ['inventario', 'herramientas', 'contactos', 'ajustes'].includes(r.name) ? r.name : 'pedidos';
    $$('.tabs a').forEach(a => a.classList.toggle('active', a.dataset.tab === tab));
    document.body.dataset.screen = r.name;
    if (r.name === 'nuevo') renderWizard('new', null, r.parts[1]);
    else if (r.name === 'editar') renderWizard('edit', r.parts[1], r.parts[2]);
    else if (r.name === 'pedido') renderOrder(r.parts[1]);
    else if (r.name === 'inventario') renderInventory();
    else if (r.name === 'herramientas') renderTools();
    else if (r.name === 'contactos') renderContacts();
    else if (r.name === 'ajustes') renderSettings();
    else renderOrders(r.parts[1] === 'terminados');
    window.scrollTo(0, keepScroll ? y : 0);
    paintSync();
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


  function lastExcel() { try { return localStorage.getItem(C.EXCEL_KEY); } catch { return null; } }

  // Recordatorio semanal: desde el viernes a las 12:00 hasta que se guarde la copia de esa semana.
  function backupReminder() {
    if (!state.orders.length && !state.tools.length) return '';
    if (!C.weeklyExcelDue(lastExcel())) return '';
    const isFriday = new Date(Date.now() - 3 * 3600000).getUTCDay() === 5;
    return `<div class="notice" role="status">${icon('save', 'notice-ico')}<div><strong>${isFriday ? 'Es viernes: hay que guardar la copia de la semana.' : 'Falta guardar la copia de esta semana.'}</strong>
      <p>Se descarga un Excel con todos los pedidos y herramientas para imprimir y archivar, y una copia para recuperar los datos si algo falla.</p></div>
      <button type="button" class="btn btn-small btn-primary" data-backup>Guardar copia</button></div>`;
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
      ${state.orders.length ? `<div class="section-tools"><button type="button" class="btn btn-small btn-secondary" data-download="orders">${icon('save')} Descargar Excel</button></div>` : ''}
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
    const before = structuredClone(o);
    const next = {...o, status: value, updatedAt: new Date().toISOString()};
    if (value === C.DONE) next.completedAt = next.updatedAt; else delete next.completedAt;
    saveItem('order', next);
    if (value === C.DONE) {
      go('pedidos');
      toast(`Listo: «${o.title}» quedó como terminado.`, () => { saveItem('order', before); render(); });
    } else {
      render();
      toast(`Estado: ${C.statusInfo(value).label}.`);
    }
  }

  async function deleteOrder(o) {
    const ok = await confirmBox({title: '¿Borrar este pedido?', text: `«${o.title}» se va a borrar. Si fue un error, vas a poder deshacerlo enseguida.`, yes: 'Sí, borrar', danger: true});
    if (!ok) return;
    removeItem('order', o);
    go('pedidos', true);
    toast('Pedido borrado.', () => { saveItem('order', o); render(); });
  }

  // Hoja informativa del pedido: dos copias iguales en una A4, con una línea punteada para cortar.
  // Sin estados ni controles: solo qué se pidió, dónde y cuándo.
  function printOrder(o) {
    const b = C.building(o.building);
    const row = (label, value) => value ? `<tr><th>${label}</th><td>${value}</td></tr>` : '';
    const copy = `<article class="ps-copy">
      <header class="ps-head">
        <div><h1>Orden de trabajo</h1><p>Intendencia · Cámara Nacional de Apelaciones en lo Comercial</p></div>
        <div class="ps-num"><strong>${esc(o.id)}</strong><span>${esc(C.fullDate(o.createdAt))}</span></div>
      </header>
      <p class="ps-task">${esc(o.title)}${C.isUrgent(o) ? '<span class="ps-urgent">Urgente</span>' : ''}</p>
      <table class="ps-table">
        ${row('Edificio', esc(b ? `${b.short} · ${b.address}` : o.building))}
        ${row('Dependencia', esc(C.shortDependency(o.dependency)))}
        ${row('Piso / oficina', esc(o.location))}
        ${row('Oficio', esc(C.tradeLabel(o.specialty)))}
        ${row('Indicaciones', esc(o.description))}
      </table>
      <div class="ps-sign"><span>Firma y sello de la dependencia</span></div>
    </article>`;
    $('#printSheet').innerHTML = `${copy}<div class="ps-cut" aria-hidden="true"><span>cortar por aquí</span></div>${copy}`;
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

  let savingDraft = false;
  async function saveDraft(andPrint) {
    if (savingDraft) return;
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
      order = {...order, ...data, ...(keepOld ? {priority: order.priority} : {}), updatedAt: now};
      saveItem('order', order);
    } else {
      savingDraft = true;
      $$('[data-save]').forEach(b => { b.disabled = true; });
      $('[data-save]').insertAdjacentHTML('beforebegin', '<p class="saving" role="status">Guardando el pedido…</p>');
      order = await createItem('order', {...data, status: 'Pendiente', createdAt: now, updatedAt: now});
      savingDraft = false;
      if (!order) {
        $$('[data-save]').forEach(b => { b.disabled = false; });
        $('.saving')?.remove();
        return;
      }
    }
    const wasEdit = draft.mode === 'edit';
    draft = null;
    wizardClosed = true;
    go(`pedido/${encodeURIComponent(order.id)}`, true);
    toast(wasEdit ? 'Cambios guardados.' : 'Pedido guardado.');
    if (andPrint) setTimeout(() => printOrder(order), 150);
  }

  // ==================== INVENTARIO ====================
  const invView = {q: '', category: '', status: '', location: '', stock: ''};
  const STATUS_SUGGESTIONS = ['Cerrado / nuevo', 'Abierto / en uso', 'Usado - buen estado', 'Antiguo', 'A revisar / testear', 'Sin especificar'];
  const datalist = (id, values) => `<datalist id="${id}">${[...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')).map(v => `<option value="${esc(v)}"></option>`).join('')}</datalist>`;
  const sheetOutdated = () => connected() && Number(remote.version || 1) < 2;

  function renderInventory() {
    const all = state.items.slice().sort(C.itemSort);
    const items = C.filterItems(all, invView);
    const filtering = !!(invView.q || invView.category || invView.status || invView.location || invView.stock);
    const options = key => [...new Set(state.items.map(i => i[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
    const select = (key, label, list, allLabel = 'Todas') => list.length > 1 ? `<label class="filter"><span>${label}</span>
      <select data-filter="${key}"><option value="">${allLabel}</option>${list.map(v => `<option${invView[key] === v ? ' selected' : ''}>${esc(v)}</option>`).join('')}</select></label>` : '';
    const stockCount = f => C.filterItems(all, {...invView, stock: f.value}).length;
    const groups = [];
    items.forEach(i => {
      const g = groups[groups.length - 1];
      if (g && g.name === i.category) g.items.push(i); else groups.push({name: i.category, items: [i]});
    });
    const categories = new Set(state.items.map(i => i.category)).size;
    main.innerHTML = `
      <div class="page-head"><h1 class="page-title">Inventario</h1><button type="button" class="btn btn-small btn-secondary" data-download="items">${icon('save')} Descargar Excel</button></div>
      <p class="lead">${state.items.length ? `${state.items.length} elemento${state.items.length === 1 ? '' : 's'} en ${categories} categoría${categories === 1 ? '' : 's'}` : 'Cargá los elementos desde un Excel o de a uno.'}</p>
      ${sheetOutdated() ? `<div class="notice">${icon('alert', 'notice-ico')}<div><strong>Falta actualizar el código de la planilla.</strong><p>Para guardar el inventario, la planilla necesita el código nuevo. Los pasos están en Ajustes.</p></div></div>` : ''}
      <div class="action-row inv-actions">
        <button type="button" class="btn btn-primary" data-new-item>${icon('plus')} Agregar elemento</button>
        <button type="button" class="btn btn-secondary" data-import-items>${icon('upload')} Cargar desde Excel</button>
      </div>
      <input type="file" id="importItems" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" hidden>
      ${state.items.length > 5 ? `<div class="inv-filters">
        <label class="search"><span class="sr-only">Buscar en el inventario</span>${icon('search')}<input type="search" id="invSearch" placeholder="Buscar: cable, pincel 20, silicona…" value="${esc(invView.q)}" autocomplete="off"></label>
        <div class="filter-row">
          ${select('category', 'Categoría', options('category'))}
          ${select('status', 'Estado', options('status'), 'Todos')}
          ${select('location', 'Ubicación', options('location'))}
        </div>
        <div class="chips" role="group" aria-label="Stock">
          ${C.STOCK_FILTERS.map(f => `<button type="button" class="chip${invView.stock === f.value ? ' active' : ''}" data-stock="${f.value}" aria-pressed="${invView.stock === f.value}">${esc(f.label)} <b>${stockCount(f)}</b></button>`).join('')}
        </div>
        ${filtering ? `<p class="filter-summary">Mostrando ${items.length} de ${all.length} <button type="button" class="btn btn-small btn-ghost" data-clear-filters>${icon('x')} Quitar filtros</button></p>` : ''}
      </div>` : ''}
      <div class="inv-list">${groups.length ? groups.map(g => `<section class="inv-group">
        <h2 class="group-label">${esc(g.name)} <span>${g.items.length}</span></h2>
        <div class="list">${g.items.map(itemCard).join('')}</div></section>`).join('')
        : `<div class="empty"><p>${filtering ? 'No hay elementos con esos filtros.' : 'Todavía no hay elementos en el inventario.'}</p>${filtering ? '<button type="button" class="btn btn-ghost" data-clear-filters>Ver todo el inventario</button>' : ''}</div>`}</div>`;

    $('[data-new-item]').onclick = () => itemForm();
    $('[data-import-items]').onclick = () => $('#importItems').click();
    $('#importItems').onchange = importItems;
    $$('[data-item]').forEach(b => b.onclick = () => itemForm(state.items.find(i => i.id === b.dataset.item)));
    $$('[data-qty]').forEach(b => b.onclick = () => changeQty(b.dataset.id, Number(b.dataset.qty)));
    $$('[data-move]').forEach(b => b.onclick = () => stockDialog(b.dataset.move));
    $$('[data-filter]').forEach(sel => sel.onchange = () => { invView[sel.dataset.filter] = sel.value; renderInventory(); });
    $$('[data-stock]').forEach(b => b.onclick = () => { invView.stock = b.dataset.stock; renderInventory(); });
    $$('[data-clear-filters]').forEach(b => b.onclick = () => { Object.assign(invView, {q: '', category: '', status: '', location: '', stock: ''}); renderInventory(); });
    const s = $('#invSearch');
    if (s) s.oninput = () => {
      invView.q = s.value;
      const p = s.selectionStart;
      renderInventory();
      const a = $('#invSearch');
      a.focus();
      a.setSelectionRange(p, p);
    };
  }

  function itemCard(i) {
    const meta = [i.status, i.location].filter(x => x && x !== 'Sin especificar').join(' · ');
    const ini = C.initialStock(i);
    const iniLine = ini.quantity === null || ini.quantity === undefined ? '' : `Stock inicial ${ini.quantity}${ini.at ? ` · ${C.shortDate(ini.at)}` : ''}`;
    const qty = i.quantity === null || i.quantity === undefined ? '—' : String(i.quantity);
    return `<div class="card item-card${i.quantity === 0 ? ' is-empty' : ''}">
      <button type="button" class="item-main" data-item="${esc(i.id)}">
        <span class="card-title">${esc(i.name)}</span>
        ${i.detail ? `<span class="card-sub">${esc(i.detail)}</span>` : ''}
        ${meta ? `<span class="card-meta">${esc(meta)}</span>` : ''}
        ${iniLine ? `<span class="card-initial">${esc(iniLine)}</span>` : ''}
      </button>
      <div class="qty" role="group" aria-label="Cantidad de ${esc(i.name)}">
        <button type="button" class="qty-btn" data-qty="-1" data-id="${esc(i.id)}" aria-label="Uno menos" ${i.quantity ? '' : 'disabled'}>${icon('minus')}</button>
        <button type="button" class="qty-value" data-move="${esc(i.id)}" aria-label="Registrar entrada o salida de ${esc(i.name)}"><b>${esc(qty)}</b><small>${esc(i.quantity === null || i.quantity === undefined ? 'sin contar' : C.unitText(i.unit, i.quantity))}</small></button>
        <button type="button" class="qty-btn" data-qty="1" data-id="${esc(i.id)}" aria-label="Uno más">${icon('plus')}</button>
      </div>
    </div>`;
  }

  // − y +: una unidad por toque. Los toques seguidos se juntan en un solo movimiento y se guardan una vez.
  const qtyTimers = {};
  function changeQty(id, delta) {
    const item = state.items.find(i => i.id === id);
    if (!item) return;
    const type = delta > 0 ? 'in' : 'out';
    const r = C.applyMovement(item, {type, amount: 1, reason: 'Ajuste rápido'});
    if (r.error) { toast(r.error); return; }
    const moves = r.item.movements;
    const prev = moves[moves.length - 2];
    if (prev && prev.quick && prev.type === type && Date.now() - new Date(prev.at).getTime() < 60000) {
      moves.pop();
      prev.amount += 1;
      prev.balance = r.item.quantity;
    } else {
      moves[moves.length - 1].quick = true;
    }
    upsertLocal('item', r.item);
    save();
    const y = window.scrollY;
    renderInventory();
    window.scrollTo(0, y);
    clearTimeout(qtyTimers[id]);
    qtyTimers[id] = setTimeout(() => saveItem('item', state.items.find(i => i.id === id)), 900);
  }

  // Entrada, salida o recuento de cualquier cantidad, con motivo e historial.
  function stockDialog(id, mode = 'out') {
    const item = state.items.find(i => i.id === id);
    if (!item) return;
    const counted = item.quantity !== null && item.quantity !== undefined && item.quantity !== '';
    if (!counted && mode === 'out') mode = 'count';
    const unit = item.unit || '';
    const recent = (item.movements || []).slice(-5).reverse();
    const openOrders = state.orders.filter(o => !C.isDone(o)).slice(-30).reverse().map(o => `${o.id} · ${o.title}`);
    const modes = [['out', 'Sale', 'minus'], ['in', 'Entra', 'plus'], ['count', 'Contar', 'list']];
    openDialog(`<form class="dlg" id="stockForm"><button type="button" class="dlg-x" data-close aria-label="Cerrar">${icon('x')}</button>
      <h2 id="dialogTitle">${esc(item.name)}</h2>
      ${item.detail ? `<p class="muted">${esc(item.detail)}</p>` : ''}
      <p class="big-status">Hay ahora: <strong>${counted ? esc(C.qtyWithUnit(item.quantity, unit)) : 'sin contar'}</strong></p>
      ${(() => { const ini = C.initialStock(item); return `<p class="muted initial-line">Stock inicial: <strong>${ini.quantity === null ? 'sin contar' : esc(C.qtyWithUnit(ini.quantity, unit))}</strong>${ini.at ? ` <small>· ${ini.source === 'Reposición' ? 'repuesto' : 'cargado'} el ${esc(C.shortDate(ini.at))}</small>` : ''}</p>`; })()}
      <div class="segmented segmented-3 stock-modes" role="group" aria-label="Qué querés registrar">
        ${modes.map(([m, label, ic]) => `<button type="button" data-mode="${m}" class="${mode === m ? 'active' : ''}" aria-pressed="${mode === m}" ${m === 'out' && !counted ? 'disabled' : ''}>${icon(ic)} ${label}</button>`).join('')}
      </div>
      <label class="field-label" for="moveAmount" id="moveLabel"></label>
      <div class="stepper">
        <button type="button" class="qty-btn" data-step-amount="-1" aria-label="Menos">${icon('minus')}</button>
        <input id="moveAmount" inputmode="decimal" autocomplete="off" value="${mode === 'count' && counted ? esc(item.quantity) : 1}">
        <button type="button" class="qty-btn" data-step-amount="1" aria-label="Más">${icon('plus')}</button>
      </div>
      <div class="chips" id="moveChips">${[5, 10, 20, 50].map(n => `<button type="button" class="chip" data-chip="${n}">${n}</button>`).join('')}</div>
      <label class="field-label" for="moveReason">Motivo <span class="optional">(opcional)</span></label>
      <input id="moveReason" list="reasonList" maxlength="80" autocomplete="off" placeholder="Ej.: compra, para el pedido OT-0004">
      ${datalist('reasonList', ['Compra', 'Reposición', 'Para un trabajo', 'Devolución', 'Corrección de conteo', ...openOrders])}
      <p class="move-preview" id="movePreview" role="status"></p>
      <div class="dlg-actions"><button class="btn btn-primary" type="submit" id="moveSave">Guardar</button><button type="button" class="btn btn-ghost" data-close>Cancelar</button></div>
      ${recent.length ? `<h3 class="sub-q">Últimos movimientos</h3><ul class="moves">${recent.map(m => `<li><span class="move-${m.type}">${esc(C.MOVE_LABELS[m.type])} ${m.type === 'count' ? esc(m.amount) : (m.type === 'in' ? '+' : '−') + esc(m.amount)}</span><span>${esc(C.when(m.at))}${m.reason && m.reason !== 'Ajuste rápido' ? ' · ' + esc(m.reason) : ''}</span><span>${Number(m.balance) === 1 ? 'quedó' : 'quedaron'} ${esc(C.qtyWithUnit(m.balance, unit))}</span></li>`).join('')}</ul>` : ''}
    </form>`, body => {
      const amount = $('#moveAmount', body);
      const update = () => {
        $$('[data-mode]', body).forEach(b => { b.classList.toggle('active', b.dataset.mode === mode); b.setAttribute('aria-pressed', String(b.dataset.mode === mode)); });
        const cuantos = C.isFeminineUnit(unit) ? '¿Cuántas' : '¿Cuántos';
        $('#moveLabel', body).textContent = mode === 'out' ? `${cuantos} salen?` : mode === 'in' ? `${cuantos} entran?` : `${cuantos} hay en total?`;
        $('#moveChips', body).hidden = mode === 'count';
        const r = C.applyMovement(item, {type: mode, amount: C.parseQuantity(amount.value) ?? NaN});
        $('#movePreview', body).textContent = r.error ? r.error : `${Number(r.item.quantity) === 1 ? 'Va a quedar' : 'Van a quedar'}: ${C.qtyWithUnit(r.item.quantity, unit)}${mode === 'in' ? '. Es una reposición: el stock inicial y la fecha de carga se actualizan.' : ''}`;
        $('#movePreview', body).classList.toggle('is-error', !!r.error);
        $('#moveSave', body).disabled = !!r.error;
      };
      $$('[data-mode]', body).forEach(b => b.onclick = () => {
        mode = b.dataset.mode;
        amount.value = mode === 'count' ? (counted ? item.quantity : 0) : 1;
        update();
        amount.focus();
        amount.select();
      });
      $$('[data-step-amount]', body).forEach(b => b.onclick = () => {
        amount.value = Math.max(0, (C.parseQuantity(amount.value) || 0) + Number(b.dataset.stepAmount));
        update();
      });
      $$('[data-chip]', body).forEach(b => b.onclick = () => { amount.value = b.dataset.chip; update(); });
      amount.oninput = update;
      update();
      amount.focus();
      amount.select();
      $('#stockForm', body).onsubmit = e => {
        e.preventDefault();
        const r = C.applyMovement(item, {type: mode, amount: C.parseQuantity(amount.value) ?? NaN, reason: $('#moveReason', body).value, restock: mode === 'in'});
        if (r.error) { toast(r.error); return; }
        saveItem('item', r.item);
        dialog.close();
        const y = window.scrollY;
        renderInventory();
        window.scrollTo(0, y);
        toast(`${C.MOVE_LABELS[mode]} guardada. ${C.remainingText(r.item.quantity, unit)}.`);
      };
    });
  }

  function itemForm(it) {
    openDialog(`<form class="dlg" id="itemForm"><button type="button" class="dlg-x" data-close aria-label="Cerrar">${icon('x')}</button>
      <h2 id="dialogTitle">${it ? 'Modificar elemento' : 'Agregar elemento'}</h2>
      <label class="field-label" for="iName">Elemento</label><input id="iName" name="name" required maxlength="80" placeholder="Ej.: Rollo de cable" value="${esc(it?.name)}">
      <label class="field-label" for="iDetail">Detalle o variante <span class="optional">(color, medida, marca)</span></label><input id="iDetail" name="detail" maxlength="80" placeholder="Ej.: Color celeste" value="${esc(it?.detail)}">
      <label class="field-label" for="iCat">Categoría</label><input id="iCat" name="category" list="catList" required maxlength="60" placeholder="Ej.: Electricidad - Cables" value="${esc(it?.category)}">
      ${datalist('catList', state.items.map(i => i.category))}
      <div class="form-two">
        <div><label class="field-label" for="iQty">Cantidad <span class="optional">(vacío = sin contar)</span></label><input id="iQty" name="quantity" inputmode="decimal" maxlength="10" value="${esc(it?.quantity ?? '')}"></div>
        <div><label class="field-label" for="iUnit">Unidad</label><input id="iUnit" name="unit" list="unitList" maxlength="20" placeholder="Ej.: Rollo" value="${esc(it?.unit)}">${datalist('unitList', ['Unidad', 'Caja', 'Rollo', 'Lata', 'Pomo', 'Bolsa', 'Tarro', ...state.items.map(i => i.unit)])}</div>
      </div>
      <label class="field-label" for="iStatus">Estado</label><input id="iStatus" name="status" list="statusList" maxlength="40" value="${esc(it?.status)}">${datalist('statusList', [...STATUS_SUGGESTIONS, ...state.items.map(i => i.status)])}
      <label class="field-label" for="iLoc">Ubicación <span class="optional">(opcional)</span></label><input id="iLoc" name="location" maxlength="60" placeholder="Ej.: Depósito Diagonal, estante 2" value="${esc(it?.location)}">
      <label class="field-label" for="iNotes">Observaciones <span class="optional">(opcional)</span></label><textarea id="iNotes" name="notes" rows="2" maxlength="300">${esc(it?.notes)}</textarea>
      <div class="dlg-actions"><button class="btn btn-primary" type="submit">Guardar</button><button type="button" class="btn btn-ghost" data-close>Cancelar</button>
      ${it ? '<button type="button" class="btn btn-link-danger" data-del>Borrar elemento</button>' : ''}</div></form>`, body => {
      if (!it) $('#iName', body).focus();
      $('#itemForm', body).onsubmit = async e => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(e.target));
        Object.keys(f).forEach(k => { f[k] = String(f[k]).trim(); });
        if (!f.name || !f.category) return;
        const data = {...f, quantity: C.parseQuantity(f.quantity), updatedAt: new Date().toISOString()};
        if (it) {
          saveItem('item', {...it, ...data});
        } else {
          const button = $('button[type=submit]', body);
          button.disabled = true;
          button.textContent = 'Guardando…';
          if (!await createItem('item', {...data, createdAt: data.updatedAt, initial: {quantity: data.quantity, at: data.updatedAt, source: 'Carga manual'}})) { button.disabled = false; button.textContent = 'Guardar'; return; }
        }
        dialog.close(); renderInventory(); toast('Elemento guardado.');
      };
      $('[data-del]', body)?.addEventListener('click', async () => {
        if (!await confirmBox({title: '¿Borrar este elemento?', text: [it.name, it.detail].filter(Boolean).join(' · '), yes: 'Sí, borrar', danger: true})) return;
        removeItem('item', it);
        renderInventory();
        toast('Elemento borrado.', () => { saveItem('item', it); renderInventory(); });
      });
    });
  }

  async function importItems(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    let rows;
    try {
      rows = /\.csv$/i.test(file.name) ? C.parseCsv(await file.text()) : await window.Xlsx.read(await file.arrayBuffer());
    } catch {
      toast('No se pudo leer el archivo. Tiene que ser un Excel (.xlsx) o un .csv.');
      return;
    }
    const {items, error} = C.rowsToItems(rows);
    if (error) { toast(error); return; }
    const now = new Date().toISOString();
    const {added, updated} = C.mergeItems(state.items, items.map(i => ({...i, updatedAt: now})));
    // Lo que entra por primera vez guarda su stock inicial, con la fecha y el archivo.
    added.forEach(i => { i.createdAt = now; i.initial = {quantity: i.quantity, at: now, source: file.name}; });
    const ok = await confirmBox({
      title: `Cargar «${file.name}»`,
      text: [added.length && `${added.length} elemento${added.length === 1 ? '' : 's'} nuevo${added.length === 1 ? '' : 's'}`, updated.length && `${updated.length} que ya estaba${updated.length === 1 ? '' : 'n'} se actualiza${updated.length === 1 ? '' : 'n'} con los datos del archivo`].filter(Boolean).join(' y ') + '.',
      yes: 'Sí, cargar'
    });
    if (!ok) return;
    toast('Cargando el inventario…');
    const payload = [...added, ...updated].map(item => ({kind: 'item', item, row: C.itemRow({...item, id: item.id || ''})}));
    setSync({busy: sync.busy + 1});
    try {
      const res = await api('import', {items: payload});
      // El código viejo de la planilla ignora el inventario sin avisar: se detecta porque no devuelve los elementos.
      if (!Array.isArray(res.items)) { if (remote) { remote.version = 1; writeJSON(REMOTE_KEY, remote); } throw new Error('codigo-viejo'); }
      res.items.forEach(i => upsertLocal('item', i));
      save();
      setSync({busy: sync.busy - 1, error: '', lastOk: new Date()});
      renderInventory();
      toast(`Listo: inventario cargado (${payload.length} elementos).`);
    } catch (err) {
      setSync({busy: sync.busy - 1, error: err.message === 'red' ? 'red' : ''});
      toast(`No se cargó: ${errorText(err)}`);
    }
  }

  // ==================== HERRAMIENTAS ====================
  const toolView = {q: ''};
  function renderTools() {
    const q = C.normalizeText(toolView.q);
    const list = state.tools
      .filter(t => !q || C.normalizeText([t.name, t.brand, t.model, t.serial, t.holder].join(' ')).includes(q))
      .sort((a, b) => String(a.name).localeCompare(String(b.name), 'es'));
    const out = state.tools.filter(t => t.holder).length;
    const pill = t => t.holder ? `<span class="pill pill-progress">Asignada a ${esc(t.holder)}</span>`
      : t.toolStatus === 'En reparación' ? '<span class="pill pill-missing">En reparación</span>'
      : t.toolStatus === 'Fuera de servicio' ? '<span class="pill">Fuera de servicio</span>'
      : '<span class="pill pill-done">Disponible</span>';
    main.innerHTML = `
      <div class="page-head"><h1 class="page-title">Herramientas</h1><button type="button" class="btn btn-small btn-secondary" data-download="tools">${icon('save')} Descargar Excel</button></div>
      <p class="lead">${state.tools.length ? `${state.tools.length} herramienta${state.tools.length === 1 ? '' : 's'} · ${out} asignada${out === 1 ? '' : 's'}` : 'Anotá acá qué herramientas hay y a quién están asignadas.'}</p>
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
      ${t.holder ? `<p class="big-status">Asignada a <strong>${esc(t.holder)}</strong>${t.assignedDate ? ` desde ${esc(C.when(t.assignedDate).toLowerCase())}` : ''}.</p>
        <button type="button" class="btn btn-primary btn-block" data-return>${icon('check')} Quitar la asignación</button>
        <p class="hint">La herramienta vuelve a figurar como disponible.</p>`
        : `<p class="big-status">${t.toolStatus === 'Disponible' ? 'Está disponible.' : esc(t.toolStatus) + '.'}</p>
        <h3 class="sub-q">¿A quién se la asignás?</h3>
        <form class="lend" id="lendForm">
          <label class="field-label" for="lendName">Nombre de la persona</label>
          <input id="lendName" list="peopleList" maxlength="60" autocomplete="off" placeholder="Ej.: Carlos Benítez">
          <datalist id="peopleList">${C.peopleNames(state).map(n => `<option value="${esc(n)}"></option>`).join('')}</datalist>
          <button type="submit" class="btn btn-primary btn-block">${icon('hand')} Asignar</button>
        </form>`}
      ${t.notes ? `<p class="muted">Nota: ${esc(t.notes)}</p>` : ''}
      ${history.length ? `<p class="muted small">Asignaciones anteriores: ${history.map(h => esc(`${h.holderName && !C.trade(h.holder) ? h.holderName + ', ' : ''}${C.when(h.returnedAt).toLowerCase()}`)).join(' · ')}</p>` : ''}
      <div class="dlg-actions"><button type="button" class="btn btn-secondary" data-edit>${icon('pencil')} Modificar</button><button type="button" class="btn btn-link-danger" data-del>Borrar</button></div></div>`, body => {
      const now = new Date().toISOString();
      $('[data-return]', body)?.addEventListener('click', () => {
        const returns = [...(Array.isArray(t.returns) ? t.returns : []), {holder: t.holder, holderName: t.holder, assignedDate: t.assignedDate || '', returnedAt: now}];
        saveItem('tool', {...t, returns, holder: '', assignedDate: '', toolStatus: 'Disponible', returnedAt: now, updatedAt: now});
        dialog.close(); renderTools(); toast('Asignación quitada: la herramienta está disponible.');
      });
      const lend = $('#lendForm', body);
      if (lend) lend.onsubmit = e => {
        e.preventDefault();
        const name = $('#lendName', body).value.trim();
        if (!name) { $('#lendName', body).focus(); toast('Escribí el nombre de la persona.'); return; }
        saveItem('tool', {...t, holder: name, assignedDate: now.slice(0, 10), toolStatus: 'Entregada', updatedAt: now});
        dialog.close(); renderTools(); toast(`Asignada a ${name}.`);
      };
      $('[data-edit]', body).onclick = () => toolForm(t);
      $('[data-del]', body).onclick = async () => {
        if (!await confirmBox({title: '¿Borrar esta herramienta?', text: `«${t.name}» se va a quitar de la lista.`, yes: 'Sí, borrar', danger: true})) return;
        removeItem('tool', t);
        renderTools();
        toast('Herramienta borrada.', () => { saveItem('tool', t); renderTools(); });
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
      $('#toolForm', body).onsubmit = async e => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(e.target));
        const now = new Date().toISOString();
        f.name = f.name.trim();
        if (!f.name) return;
        if (t) {
          saveItem('tool', {...t, ...f, toolStatus: t.holder ? 'Entregada' : (f.toolStatus || t.toolStatus), updatedAt: now});
        } else {
          const button = $('button[type=submit]', body);
          button.disabled = true;
          button.textContent = 'Guardando…';
          const created = await createItem('tool', {...f, toolStatus: 'Disponible', holder: '', assignedDate: '', createdAt: now, updatedAt: now});
          if (!created) { button.disabled = false; button.textContent = 'Guardar'; return; }
        }
        dialog.close(); renderTools(); toast('Herramienta guardada.');
      };
    });
  }

  // ==================== CONTACTOS ====================
  const contactView = {q: ''};
  function renderContacts() {
    const list = C.searchContacts(state.contacts, contactView.q);
    main.innerHTML = `
      <div class="page-head"><h1 class="page-title">Contactos</h1><button type="button" class="btn btn-small btn-secondary" data-download="contacts">${icon('save')} Descargar Excel</button></div>
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
      $('#contactForm', body).onsubmit = async e => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(e.target));
        if (!f.name.trim()) return;
        if (c) {
          saveItem('contact', {...c, ...f, role: c.role || 'Contacto'});
        } else {
          const button = $('button[type=submit]', body);
          button.disabled = true;
          button.textContent = 'Guardando…';
          const created = await createItem('contact', {...f, role: 'Contacto', organization: '', building: ''});
          if (!created) { button.disabled = false; button.textContent = 'Guardar'; return; }
        }
        dialog.close(); renderContacts(); toast('Contacto guardado.');
      };
      $('[data-del]', body)?.addEventListener('click', async () => {
        if (!await confirmBox({title: '¿Borrar este contacto?', text: c.name, yes: 'Sí, borrar', danger: true})) return;
        removeItem('contact', c);
        renderContacts();
        toast('Contacto borrado.', () => { saveItem('contact', c); renderContacts(); });
      });
    });
  }

  // ==================== AJUSTES ====================
  function renderSettings() {
    const size = prefs.size || 'normal';
    main.innerHTML = `
      <h1 class="page-title">Ajustes</h1>
      <section class="panel">
        <h2>Tamaño de la letra</h2>
        <div class="segmented segmented-3" role="group" aria-label="Tamaño de la letra">
          ${[['normal', 'Normal'], ['grande', 'Grande'], ['muy-grande', 'Muy grande']].map(([v, l]) => `<button type="button" data-size="${v}" class="${size === v ? 'active' : ''}" aria-pressed="${size === v}">${l}</button>`).join('')}
        </div>
      </section>
      ${sheetOutdated() ? `<section class="panel"><h2>Actualizar el código de la planilla</h2>
        <p class="muted">El inventario necesita una versión nueva del código. Se hace una sola vez, desde la computadora donde armaste la planilla:</p>
        <ol class="steps"><li>En la planilla, abrí <b>Extensiones › Apps Script</b>.</li><li>Borrá todo y pegá el código nuevo (<b>Codigo.gs</b>). Volvé a poner tu clave en la línea CLAVE.</li><li>Guardá con Ctrl+S.</li><li><b>Implementar › Administrar implementaciones</b> › lápiz › <b>Versión: nueva versión</b> › <b>Implementar</b>.</li><li>Acá, tocá <b>Actualizar ahora</b>.</li></ol></section>` : ''}
      ${sheetPanel()}
      <section class="panel">
        <h2>Copia de seguridad</h2>
        <p class="muted">Los pedidos están en la planilla de Google. Todos los viernes desde las 12:00 la aplicación pide guardar la copia de la semana para imprimir y archivar.</p>
        <p><strong>Última copia en Excel:</strong> ${lastExcel() ? esc(C.when(lastExcel())) : 'nunca'}</p>
        <button type="button" class="btn btn-primary btn-block" data-backup>${icon('save')} Guardar copia de la semana</button>
        <div class="action-row">
          <button type="button" class="btn btn-secondary" data-excel>Solo el Excel</button>
          <button type="button" class="btn btn-secondary" data-json>Solo la copia para recuperar</button>
        </div>
        <button type="button" class="btn btn-ghost btn-block" data-restore>Recuperar desde una copia</button>
        <input type="file" id="restoreFile" accept="application/json,.json" hidden>
      </section>`;
    $$('[data-size]', main).forEach(b => b.onclick = () => { prefs.size = b.dataset.size; savePrefs(); applyTextSize(); renderSettings(); });
    bindBackup();
    $('[data-excel]').onclick = () => { downloadExcel(); toast('Excel descargado.'); renderSettings(); };
    $('[data-json]').onclick = () => { downloadRestoreCopy(); toast('Copia para recuperar descargada.'); renderSettings(); };
    $('[data-restore]').onclick = () => $('#restoreFile').click();
    $('#restoreFile').onchange = restoreBackup;
    bindSheetPanel();
  }

  function sheetPanel() {
    if (connected()) {
      return `<section class="panel">
        <h2>Planilla compartida</h2>
        <p class="sheet-state">${icon('check')} Esta computadora usa la planilla de Google. Lo que se carga acá lo ven todas las computadoras conectadas.</p>
        <p class="muted">Última actualización: ${sync.lastOk ? esc(C.when(sync.lastOk.toISOString()).toLowerCase()) : 'todavía no'}${sync.error ? ` · ${esc(errorText({message: sync.error}))}` : ''}</p>
        ${remote.sheetUrl ? `<a class="btn btn-secondary btn-block" href="${esc(remote.sheetUrl)}" target="_blank" rel="noopener">Abrir la planilla</a>` : ''}
        <button type="button" class="btn btn-ghost btn-block" data-sheet-refresh>Actualizar ahora</button>
        <button type="button" class="btn btn-link-danger" data-sheet-off>Desconectar esta computadora</button>
      </section>`;
    }
    return '';
  }

  function renderConnect() {
    main.innerHTML = `<section class="connect">
      <h1 class="page-title">Conectá esta computadora</h1>
      <p class="lead">Los pedidos están en la planilla de Intendencia. Para verlos y cargarlos, escribí la dirección y la clave. Se hace una sola vez en cada computadora.</p>
      <form id="sheetForm" class="panel sheet-form">
        <label class="field-label" for="sheetUrl">Dirección de la aplicación web</label>
        <input id="sheetUrl" inputmode="url" autocomplete="off" placeholder="https://script.google.com/macros/s/…/exec">
        <label class="field-label" for="sheetKey">Clave</label>
        <input id="sheetKey" autocomplete="off" placeholder="La misma que escribiste en el código">
        <button type="submit" class="btn btn-primary btn-block">Conectar</button>
      </form>
      <p class="muted small">La dirección y la clave las tiene quien administra la planilla.</p>
    </section>`;
    $('#sheetForm').onsubmit = connectSheet;
  }

  function bindSheetPanel() {
    const form = $('#sheetForm');
    if (form) form.onsubmit = connectSheet;
    $('[data-sheet-refresh]')?.addEventListener('click', async e => {
      e.target.disabled = true;
      e.target.textContent = 'Actualizando…';
      await refresh({force: true});
      if (sync.error) toast(errorText({message: sync.error}));
      else toast('Planilla actualizada.');
    });
    $('[data-sheet-off]')?.addEventListener('click', async () => {
      const ok = await confirmBox({title: '¿Desconectar esta computadora?', text: 'Va a dejar de ver lo que cargan las otras computadoras. Los datos de la planilla no se borran.', yes: 'Sí, desconectar', danger: true});
      if (!ok) return;
      remote = null;
      outbox = [];
      try { localStorage.removeItem(REMOTE_KEY); localStorage.removeItem(OUTBOX_KEY); } catch {}
      // No queda ninguna copia de los pedidos en esta computadora.
      state = C.normalizeState({...state, orders: [], tools: [], items: [], contacts: structuredClone(CATALOG)}, CATALOG);
      save();
      go('pedidos', true);
      toast('Computadora desconectada de la planilla.');
    });
  }

  async function connectSheet(e) {
    e.preventDefault();
    const url = $('#sheetUrl').value.trim();
    const key = $('#sheetKey').value.trim();
    if (!/^https:\/\/script\.google(usercontent)?\.com\/.+/.test(url)) { toast('La dirección tiene que empezar con https://script.google.com/'); $('#sheetUrl').focus(); return; }
    if (!key) { toast('Escribí la clave.'); $('#sheetKey').focus(); return; }
    const button = $('#sheetForm button');
    button.disabled = true;
    button.textContent = 'Conectando…';
    const conf = {url, key};
    let data;
    try {
      ({data} = await api('load', {}, conf));
    } catch (err) {
      button.disabled = false;
      button.textContent = 'Conectar';
      toast(`No se pudo conectar: ${errorText(err)}`);
      return;
    }
    // Si esta computadora tenía pedidos cargados por su cuenta, se descarga una copia y se reemplazan por los de la planilla.
    const hasLocal = state.orders.length || state.tools.length || state.contacts.some(C.isCustomContact);
    if (hasLocal) downloadRestoreCopy();
    remote = conf;
    writeJSON(REMOTE_KEY, remote);
    applyRemote(data);
    setSync({error: '', lastOk: new Date()});
    go('pedidos', true);
    toast(hasLocal ? 'Conectada. Lo que había en esta computadora quedó en una copia en Descargas.' : 'Listo: esta computadora ya está conectada.');
  }

  function bindBackup() { $$('[data-backup]').forEach(b => b.onclick = weeklyBackup); }

  function downloadFile(bytes, name, type) {
    const url = URL.createObjectURL(new Blob([bytes], {type}));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  const fileDate = d => d.toISOString().slice(0, 10);

  // Los botones «Descargar Excel» de cada sección (un solo escuchador para todas las pantallas).
  main.addEventListener('click', e => {
    const b = e.target.closest('[data-download]');
    if (b) downloadSection(b.dataset.download);
  });

  // Excel de una sección (lo que se ve en pantalla), con el formato del inventario, para imprimir y guardar.
  function downloadSection(kind) {
    const now = new Date();
    let list, note = '';
    if (kind === 'items') {
      list = C.filterItems(state.items, invView);
      const parts = [invView.category, invView.status, invView.location, C.STOCK_FILTERS.find(f => f.value === invView.stock && f.value)?.label, invView.q && `«${invView.q}»`].filter(Boolean);
      note = parts.join(', ');
    } else if (kind === 'tools') list = state.tools;
    else if (kind === 'contacts') { list = C.searchContacts(state.contacts, contactView.q); note = contactView.q ? `«${contactView.q}»` : ''; }
    else list = state.orders;
    if (!list.length) { toast('No hay nada para descargar.'); return; }
    const sheet = C.sectionSheet(kind, list, {now, note});
    const names = {items: 'inventario', tools: 'herramientas', contacts: 'contactos', orders: 'pedidos'};
    downloadFile(window.Xlsx.workbook([sheet]), `intendencia-${names[kind]}-${fileDate(now)}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    toast(`Excel descargado (${list.length} ${list.length === 1 ? 'fila' : 'filas'}${note ? ', con los filtros aplicados' : ''}). Queda en Descargas.`);
  }

  // Excel para imprimir y archivar.
  function downloadExcel() {
    const now = new Date();
    downloadFile(window.Xlsx.workbook(C.excelSheets(state, now)), `intendencia-pedidos-${fileDate(now)}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    try { localStorage.setItem(C.EXCEL_KEY, now.toISOString()); } catch {}
  }
  // Copia completa para recuperar los datos en esta u otra computadora.
  function downloadRestoreCopy() {
    const now = new Date();
    downloadFile(JSON.stringify({app: 'intendencia', version: 'piloto', exportedAt: now.toISOString(), data: state}, null, 2), `intendencia-copia-${fileDate(now)}.json`, 'application/json');
    try { localStorage.setItem(C.BACKUP_KEY, now.toISOString()); } catch {}
  }
  function weeklyBackup() {
    downloadExcel();
    setTimeout(() => { downloadRestoreCopy(); render(); }, 700);
    toast('Copia guardada en la carpeta Descargas: el Excel y la copia para recuperar.');
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
    const ok = await confirmBox({title: '¿Recuperar esta copia?', text: connected() ? `Los ${data.orders.length} pedidos de «${file.name}» se van a cargar en la planilla. Los que tengan el mismo número se reemplazan.` : `Se van a reemplazar los datos de esta computadora por los de «${file.name}» (${data.orders.length} pedidos).`, yes: 'Sí, recuperar', danger: true});
    if (!ok) return;
    state = C.normalizeState(data, CATALOG);
    save();
    if (connected()) {
      const items = [
        ...state.orders.map(item => ({kind: 'order', item, row: C.orderRow(item)})),
        ...state.tools.map(item => ({kind: 'tool', item, row: C.toolRow(item)})),
        ...state.contacts.filter(C.isCustomContact).map(item => ({kind: 'contact', item, row: C.contactRow(item)}))
      ];
      try { await api('import', {items}); } catch (err) { toast(`La copia se recuperó en esta computadora, pero no se pudo subir a la planilla: ${errorText(err)}`); go('pedidos', true); return; }
    }
    go('pedidos', true);
    toast('Copia recuperada.');
  }

  // Si la lista está abierta cuando llega el viernes a las 12:00, el aviso aparece solo.
  let dueShown = C.weeklyExcelDue(lastExcel());
  setInterval(() => {
    const due = C.weeklyExcelDue(lastExcel());
    if (due !== dueShown) { dueShown = due; if (route().name === 'pedidos' && !dialog.open) renderOrders(route().parts[1] === 'terminados'); }
  }, 60000);

  // ---------- Inicio ----------
  load();
  if (!readStored()) save();
  render();
  refresh();
})();
