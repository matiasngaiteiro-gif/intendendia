// Lógica de la aplicación (sin pantalla): catálogos, datos, búsquedas y mensajes.
// Se usa en el navegador (window.Core) y en las pruebas de Node (require).
(function (root) {
  'use strict';

  const STORAGE_KEY = 'intendencia-estado-v2';
  const BACKUP_KEY = 'intendencia-ultima-copia';

  // Los nombres largos se conservan tal cual para no romper los datos guardados.
  const BUILDINGS = [
    {id: 'Diagonal Roque Sáenz Peña 1211', short: 'Diagonal', address: 'Diagonal Norte 1211'},
    {id: 'Av. Callao 635', short: 'Callao', address: 'Av. Callao 635'},
    {id: 'Montevideo 546', short: 'Montevideo', address: 'Montevideo 546'}
  ];

  // En lugar de nombres de empleados se trabaja con oficios.
  // "key" es el valor que ya usaban las órdenes guardadas (especialidad).
  const TRADES = [
    {key: 'Electricidad', label: 'Electricista', icon: 'bolt', hint: 'Luces, enchufes, timbres'},
    {key: 'Plomería', label: 'Plomero', icon: 'drop', hint: 'Canillas, baños, pérdidas'},
    {key: 'Carpintería', label: 'Carpintero', icon: 'door', hint: 'Puertas, cerraduras, muebles'},
    {key: 'Aires Acondicionados', label: 'Técnico de aire', icon: 'snow', hint: 'Aire acondicionado'},
    {key: 'Pintura', label: 'Pintor', icon: 'roller', hint: 'Paredes, puertas, retoques'},
    {key: 'Albañilería', label: 'Albañil', icon: 'bricks', hint: 'Revoque, baldosas, filtraciones'},
    {key: 'Tapicería', label: 'Tapicero', icon: 'chair', hint: 'Sillas y asientos'},
    {key: 'Ayudante', label: 'Ayudante', icon: 'box', hint: 'Traslados, limpieza, carteles'},
    {key: 'Administrativo', label: 'Administrativo', icon: 'clipboard', hint: 'Papeles, pedidos, proveedores'}
  ];

  const TASKS = {
    'Electricidad': ['Cambio de tubo de luz', 'Cambio de lámpara LED', 'Reparación o cambio de enchufe', 'Cambio de interruptor', 'Revisión de artefacto de iluminación', 'Revisión de luz de emergencia', 'Reparación de timbre', 'Registrar falla de ascensor', 'Control de señalización de evacuación'],
    'Plomería': ['Pérdida en canilla', 'Destapar desagote', 'Cambio de flexible', 'Reparación de descarga de inodoro', 'Cambio de grifería', 'Reparación de sifón', 'Revisión de pérdida de agua'],
    'Carpintería': ['Cambio de cerradura', 'Ajuste de puerta', 'Ajuste de bisagras', 'Cambio de picaporte', 'Reparación de cajón', 'Reparación de escritorio', 'Colocación de estante'],
    'Aires Acondicionados': ['Revisión de aire acondicionado', 'Limpieza de filtros de aire', 'Revisión de desagote de aire'],
    'Pintura': ['Retoque de pintura', 'Pintura de pared', 'Pintura de puerta'],
    'Albañilería': ['Reparación de revoque', 'Reposición de baldosa', 'Sellado de filtración'],
    'Tapicería': ['Reparación de silla', 'Retapizado de asiento'],
    'Ayudante': ['Movimiento de mobiliario', 'Retiro de materiales', 'Limpieza extraordinaria', 'Colocación de cartelería'],
    'Administrativo': ['Preparación de pedido de insumos', 'Seguimiento de proveedor', 'Control de inventario', 'Carga de documentación']
  };

  // Estados guardados → cómo se muestran. Se mantienen los valores que ya existían.
  const STATUSES = [
    {value: 'Pendiente', label: 'Pendiente', icon: 'clock'},
    {value: 'En proceso', label: 'En curso', icon: 'wrench'},
    {value: 'Faltan insumos', label: 'Faltan materiales', icon: 'alert'},
    {value: 'Resuelto', label: 'Terminado', icon: 'check'}
  ];
  const DONE = 'Resuelto';

  const trade = key => TRADES.find(t => t.key === key);
  const tradeLabel = key => trade(key)?.label || 'Sin oficio';
  const building = id => BUILDINGS.find(b => b.id === id);
  const buildingShort = id => building(id)?.short || String(id || '');
  const statusInfo = value => STATUSES.find(s => s.value === value) || STATUSES[0];
  const isDone = o => o.status === DONE;
  const isUrgent = o => o.priority === 'Urgente';

  function normalizeText(value) {
    return String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9@]+/g, ' ').trim();
  }

  // ---------- Dependencias por edificio (desde la guía PJN de contacts-data.js) ----------
  function buildingForAddress(address) {
    const s = String(address || '');
    if (/(?:Roque|Diagonal).*1211/i.test(s)) return BUILDINGS[0].id;
    if (/Callao\s+635/i.test(s)) return BUILDINGS[1].id;
    if (/Montevideo\s+546/i.test(s)) return BUILDINGS[2].id;
    return '';
  }

  function floorFromAddress(address) {
    const parts = String(address || '').split(',').slice(1).map(p => p.trim()).filter(Boolean);
    return parts.join(', ');
  }

  function shortDependency(value) {
    const text = String(value || '');
    const match = text.match(/juzgado.*?(?:N\.?\s*[.º°]*\s*|número\s*)(\d+)/i) || text.match(/juzgado\s+(\d+)/i);
    return match ? `Juzgado N.º ${match[1]}` : text;
  }

  function dependencyName(contact) {
    if (/^PJN-COM-J\d+$/.test(contact.id)) return `Juzgado N.º ${contact.id.match(/\d+$/)[0]}`;
    if (contact.id.startsWith('PJN-COM-SALA-')) return `Sala ${contact.id.slice(-1)}`;
    if (contact.id === 'PJN-COM-MESA-DIAGONAL') return null; // duplica Mesa General de Entradas
    if (contact.id === 'PJN-COM-AUXILIARES') return 'Auxiliares de Justicia';
    if (contact.id === 'PJN-COM-CAMARA') return 'Cámara (Presidencia)';
    return contact.name;
  }

  // Devuelve [{name, floor}] ordenado: juzgados por número, luego salas, luego el resto.
  function dependenciesForBuilding(buildingId, catalog) {
    if (!building(buildingId)) return [];
    const seen = new Set();
    const list = [];
    (catalog || []).forEach(c => {
      if (buildingForAddress(c.building) !== buildingId) return;
      const name = dependencyName(c);
      if (!name || seen.has(name)) return;
      seen.add(name);
      list.push({name, floor: floorFromAddress(c.building)});
    });
    const rank = d => /^Juzgado/.test(d.name) ? 0 : /^Sala/.test(d.name) ? 1 : 2;
    list.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, 'es', {numeric: true}));
    list.push({name: 'Portería', floor: 'Planta baja'}, {name: 'Otro lugar', floor: ''});
    return list;
  }

  // ---------- Datos guardados ----------
  function emptyState(catalog) {
    return {orders: [], tools: [], contacts: structuredClone(catalog || []), people: []};
  }

  // Ordena y completa los datos, también los que vienen de versiones anteriores.
  // No borra información de secciones ocultas (obras, guías, insumos…): solo la deja guardada.
  function normalizeState(input, catalog) {
    const s = input && typeof input === 'object' ? input : emptyState(catalog);
    ['orders', 'tools', 'contacts', 'people'].forEach(k => { if (!Array.isArray(s[k])) s[k] = []; });

    const roleMap = {'Mantenimiento general': 'Ayudante', 'Servicios y traslados': 'Ayudante', 'Patrimonio': 'Carpintería', 'Sanitarios': 'Plomería', 'Aire acondicionado': 'Aires Acondicionados'};
    const roleOf = id => {
      const p = s.people.find(x => x.id === id);
      return p ? (roleMap[p.role] || p.role) : '';
    };

    const categoryTrade = {'Carpintería': 'Carpintería', 'Aire acondicionado': 'Aires Acondicionados', 'Electricidad': 'Electricidad', 'Sanitarios': 'Plomería', 'Pintura': 'Pintura', 'Albañilería': 'Albañilería', 'Tapicería': 'Tapicería', 'Administrativo': 'Administrativo', 'Ascensores': 'Electricidad', 'Seguridad': 'Electricidad'};
    s.orders.forEach(o => {
      if (!trade(o.specialty)) o.specialty = roleOf(o.assignee) || categoryTrade[o.category] || 'Ayudante';
      if (!STATUSES.some(x => x.value === o.status)) o.status = 'Pendiente';
      if (!o.priority) o.priority = 'Media';
    });

    // Herramientas: "entregada a" se guarda como el nombre de la persona.
    // En la versión anterior era el código de un empleado (p1, p2…): se reemplaza por su nombre.
    s.tools.forEach(t => {
      const p = t.holder && s.people.find(x => x.id === t.holder);
      if (p) t.holder = String(p.name || '').trim();
      t.holder = String(t.holder || '').trim();
      if (t.holder) t.toolStatus = 'Entregada';
      else if (!t.toolStatus || t.toolStatus === 'Entregada') t.toolStatus = 'Disponible';
    });

    if (!s.contacts.length && catalog) s.contacts = structuredClone(catalog);
    return s;
  }

  function nextId(list, prefix) {
    const n = Math.max(0, ...list.map(x => Number(String(x.id || '').split('-')[1]) || 0)) + 1;
    return `${prefix}-${String(n).padStart(4, '0')}`;
  }

  // ---------- Pedidos ----------
  function orderPlace(o) {
    return [buildingShort(o.building), shortDependency(o.dependency), o.location].filter(Boolean).join(' · ');
  }

  // Nombres para sugerir al prestar una herramienta: los del personal anterior y los ya usados.
  function peopleNames(state) {
    const names = [...(state.people || []).map(p => p.name), ...(state.tools || []).flatMap(t => [t.holder, ...(t.returns || []).map(r => r.holderName)])];
    return [...new Set(names.map(n => String(n || '').trim()).filter(n => n && !/^p\d+$/.test(n)))].sort((a, b) => a.localeCompare(b, 'es'));
  }

  function searchOrders(orders, q) {
    const query = normalizeText(q);
    if (!query) return orders.slice();
    const words = query.split(' ');
    return orders.filter(o => {
      const text = normalizeText([o.id, o.title, o.description, o.dependency, shortDependency(o.dependency), buildingShort(o.building), o.location, tradeLabel(o.specialty), o.specialty].join(' '));
      return words.every(w => text.includes(w));
    });
  }

  // Abiertos: urgentes primero y después los más viejos (los que esperan hace más tiempo).
  // Terminados: los más recientes primero.
  function sortOrders(list, done) {
    return list.slice().sort((a, b) => {
      if (done) return String(b.completedAt || b.updatedAt || '').localeCompare(String(a.completedAt || a.updatedAt || ''));
      return (isUrgent(b) - isUrgent(a)) || String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
    });
  }

  // ---------- Contactos ----------
  function courtNumber(c) { return /juzgado.*?(\d+)/i.exec(c.name || '')?.[1] || ''; }
  function searchContacts(contacts, q) {
    const query = normalizeText(q);
    const numeric = /^(?:juzgados?\s+)?(\d+)$/.exec(query);
    const matches = c => {
      if (numeric) return courtNumber(c).includes(numeric[1]);
      const text = normalizeText([c.name, c.organization, c.role, c.building, c.phone, c.email].join(' '));
      return query.split(' ').filter(Boolean).every(w => text.includes(w));
    };
    const score = c => numeric ? (courtNumber(c).startsWith(numeric[1]) ? 0 : 1) : (normalizeText(c.name).startsWith(query) ? 0 : 1);
    return contacts.filter(matches).sort((a, b) => score(a) - score(b) ||
      (numeric ? Number(courtNumber(a)) - Number(courtNumber(b)) : String(a.name || '').localeCompare(String(b.name || ''), 'es', {numeric: true, sensitivity: 'base'})));
  }

  // ---------- Fechas ----------
  const TZ = 'America/Argentina/Buenos_Aires';
  function dayKey(date) {
    return new Intl.DateTimeFormat('en-CA', {timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit'}).format(date);
  }
  function when(value, now = new Date()) {
    if (!value) return 'Fecha no registrada';
    const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + 'T12:00:00-03:00') : new Date(value);
    if (Number.isNaN(date.getTime())) return 'Fecha no registrada';
    const hasTime = !/^\d{4}-\d{2}-\d{2}$/.test(value);
    const time = hasTime ? ' a las ' + new Intl.DateTimeFormat('es-AR', {timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23'}).format(date) : '';
    const diff = Math.round((new Date(dayKey(now)) - new Date(dayKey(date))) / 86400000);
    if (diff === 0) return 'Hoy' + time;
    if (diff === 1) return 'Ayer' + time;
    if (diff > 1 && diff < 7) return `Hace ${diff} días`;
    return new Intl.DateTimeFormat('es-AR', {timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric'}).format(date);
  }
  function fullDate(value) {
    if (!value) return 'No registrada';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'No registrada';
    return new Intl.DateTimeFormat('es-AR', {timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'}).format(date) + ' h';
  }
  function daysSince(value, now = new Date()) {
    if (!value) return Infinity;
    const t = new Date(value).getTime();
    return Number.isNaN(t) ? Infinity : (now.getTime() - t) / 86400000;
  }

  const Core = {
    STORAGE_KEY, BACKUP_KEY, BUILDINGS, TRADES, TASKS, STATUSES, DONE,
    trade, tradeLabel, building, buildingShort, statusInfo, isDone, isUrgent,
    normalizeText, buildingForAddress, shortDependency, dependenciesForBuilding,
    emptyState, normalizeState, nextId, orderPlace, peopleNames,
    searchOrders, sortOrders, searchContacts, when, fullDate, daysSince
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Core;
  else root.Core = Core;
})(typeof window !== 'undefined' ? window : globalThis);
