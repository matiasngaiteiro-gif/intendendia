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
    {key: 'Herrería', label: 'Herrero', icon: 'hammer', hint: 'Rejas, soldaduras, metal'},
    {key: 'Tapicería', label: 'Tapicero', icon: 'chair', hint: 'Sillas y asientos'},
    {key: 'Ayudante', label: 'Ayudante', icon: 'box', hint: 'Traslados, limpieza, carteles'},
    {key: 'Portería', label: 'Portería', icon: 'key', hint: 'Llaves, accesos, proveedores'},
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
    'Herrería': ['Reparación de reja', 'Reparación de puerta metálica', 'Soldadura', 'Reparación de baranda', 'Colocación de herraje', 'Reparación de estructura metálica'],
    'Portería': ['Abrir o cerrar una oficina', 'Entrega de llaves', 'Recibir a un proveedor', 'Acompañar a un servicio técnico', 'Traslado de correspondencia', 'Control de acceso'],
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
    return {orders: [], tools: [], items: [], contacts: structuredClone(catalog || []), people: []};
  }

  // Ordena y completa los datos, también los que vienen de versiones anteriores.
  // No borra información de secciones ocultas (obras, guías, insumos…): solo la deja guardada.
  function normalizeState(input, catalog) {
    const s = input && typeof input === 'object' ? input : emptyState(catalog);
    ['orders', 'tools', 'contacts', 'people', 'items'].forEach(k => { if (!Array.isArray(s[k])) s[k] = []; });

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

  // Nombres para sugerir al asignar una herramienta: los del personal anterior y los ya usados.
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


  // ---------- Copia semanal en Excel (viernes 12:00, hora de Argentina) ----------
  const EXCEL_KEY = 'intendencia-ultimo-excel';
  // Argentina no tiene horario de verano: UTC-3 todo el año.
  function lastFridayNoon(now = new Date()) {
    const ar = new Date(now.getTime() - 3 * 3600000);
    const back = (ar.getUTCDay() - 5 + 7) % 7;
    let t = Date.UTC(ar.getUTCFullYear(), ar.getUTCMonth(), ar.getUTCDate() - back, 12) + 3 * 3600000;
    if (t > now.getTime()) t -= 7 * 86400000;
    return new Date(t);
  }
  // Hay que guardar la copia si ya pasó el viernes 12:00 y desde entonces no se descargó el Excel.
  function weeklyExcelDue(lastExcel, now = new Date()) {
    const last = lastExcel ? new Date(lastExcel).getTime() : 0;
    return !(last >= lastFridayNoon(now).getTime());
  }

  // Columnas legibles de cada tipo de dato. Se usan en el Excel de los viernes y en la planilla de Google.
  const ORDER_COLUMNS = [
    {header: 'Número', width: 9}, {header: 'Fecha del pedido', width: 17}, {header: 'Trabajo', width: 26}, {header: 'Oficio', width: 13},
    {header: 'Edificio', width: 11}, {header: 'Dependencia', width: 15}, {header: 'Piso / oficina', width: 16}, {header: 'Urgente', width: 8},
    {header: 'Estado', width: 13}, {header: 'Terminado el', width: 17}, {header: 'Indicaciones', width: 30}];
  const TOOL_COLUMNS = [
    {header: 'Código', width: 9}, {header: 'Herramienta', width: 24}, {header: 'Marca y modelo', width: 22}, {header: 'N.º de inventario', width: 16},
    {header: 'Estado', width: 14}, {header: 'Asignada a', width: 22}, {header: 'Desde', width: 12}, {header: 'Nota', width: 32}];
  const CONTACT_COLUMNS = [
    {header: 'Código', width: 16}, {header: 'Nombre', width: 28}, {header: 'Teléfono', width: 18}, {header: 'Correo', width: 28}, {header: 'Para qué sirve', width: 32}];

  const orderRow = o => [
    o.id, fullDate(o.createdAt), o.title, tradeLabel(o.specialty), buildingShort(o.building),
    shortDependency(o.dependency), o.location || '', isUrgent(o) ? 'Sí' : '', statusInfo(o.status).label,
    isDone(o) && o.completedAt ? fullDate(o.completedAt) : '', o.description || ''
  ];
  const toolRow = t => [
    t.id, t.name, [t.brand, t.model].filter(Boolean).join(' '), t.serial || '',
    t.holder ? 'Asignada' : (t.toolStatus || 'Disponible'), t.holder || '',
    t.holder && t.assignedDate ? String(t.assignedDate).split('-').reverse().join('/') : '', t.notes || ''
  ];
  const contactRow = c => [c.id, c.name || '', c.phone || '', c.email || '', c.notes || ''];

  // ---------- Inventario ----------
  const ITEM_COLUMNS = [
    {header: 'Código', width: 9}, {header: 'Categoría', width: 22}, {header: 'Elemento', width: 26}, {header: 'Detalle / variante', width: 22},
    {header: 'Cantidad', width: 10}, {header: 'Unidad', width: 10}, {header: 'Estado', width: 16}, {header: 'Ubicación', width: 16},
    {header: 'Observaciones', width: 28}, {header: 'Actualizado', width: 17}];
  const qtyText = q => (q === null || q === undefined || q === '') ? 'Sin contar' : String(q);
  const itemRow = i => [i.id, i.category || '', i.name || '', i.detail || '', qtyText(i.quantity), i.unit || '', i.status || '', i.location || '', i.notes || '', fullDate(i.updatedAt)];

  // Cantidad: número entero o decimal; vacío o «S/D» = sin contar.
  function parseQuantity(v) {
    const t = String(v ?? '').trim().replace(',', '.');
    if (!t || /^s\/?d$|^sin/i.test(t)) return null;
    const n = Number(t);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }

  // Un mismo elemento puede figurar dos veces con distinto estado (por ejemplo, rollos nuevos y rollos en uso).
  const itemKey = i => normalizeText([i.category, i.name, i.detail, i.status].join('|'));

  // Convierte las filas de un Excel/CSV en ítems. Busca la fila de títulos (la que dice «Elemento»)
  // y reconoce las columnas por nombre, sin importar mayúsculas ni tildes.
  const HEADER_ALIASES = {
    category: ['categoria', 'rubro'], name: ['elemento', 'item', 'articulo', 'producto', 'nombre'],
    detail: ['detalle variante', 'detalle', 'variante', 'descripcion'], quantity: ['cantidad', 'stock'],
    unit: ['unidad', 'presentacion'], status: ['estado'], location: ['ubicacion', 'lugar', 'deposito'], notes: ['observaciones', 'notas', 'nota']
  };
  function rowsToItems(rows) {
    const clean = rows.map(r => (r || []).map(c => String(c ?? '').trim()));
    const h = clean.findIndex(r => r.some(c => HEADER_ALIASES.name.includes(normalizeText(c))));
    if (h < 0) return {items: [], error: 'No encontré la columna «Elemento». La primera fila con títulos tiene que tener una columna llamada Elemento.'};
    const head = clean[h].map(normalizeText);
    const col = {};
    Object.entries(HEADER_ALIASES).forEach(([field, names]) => {
      for (const n of names) { const i = head.indexOf(n); if (i >= 0) { col[field] = i; break; } }
    });
    const items = [];
    clean.slice(h + 1).forEach(r => {
      const get = f => col[f] === undefined ? '' : (r[col[f]] || '');
      const name = get('name');
      if (!name) return;
      items.push({
        category: get('category') || 'Sin categoría', name, detail: get('detail'), quantity: parseQuantity(get('quantity')),
        unit: get('unit'), status: get('status'), location: get('location'), notes: get('notes')
      });
    });
    return {items, error: items.length ? '' : 'El archivo no tiene filas con elementos debajo de los títulos.'};
  }

  // Une lo importado con lo existente: mismo elemento (categoría + nombre + detalle + estado) se actualiza, el resto se agrega.
  function mergeItems(existing, incoming) {
    const byKey = new Map(existing.map(i => [itemKey(i), i]));
    const added = [], updated = [];
    incoming.forEach(n => {
      const old = byKey.get(itemKey(n));
      if (old) {
        const merged = {...old};
        Object.entries(n).forEach(([k, v]) => { if (v !== '' && v !== null && v !== undefined) merged[k] = v; });
        if (n.quantity === null && old.quantity !== undefined) merged.quantity = old.quantity;
        updated.push(merged);
      } else {
        added.push(n);
        byKey.set(itemKey(n), n);
      }
    });
    return {added, updated};
  }

  // ---------- Unidades en singular y plural ----------
  // «1 rollo», «7 rollos», «1 unidad», «3 unidades». Solo cambia la primera palabra («caja x 50» → «cajas x 50»).
  function pluralWord(w) {
    if (!w || /s$/i.test(w)) return w;
    if (/z$/i.test(w)) return w.slice(0, -1) + (w === w.toUpperCase() ? 'CES' : 'ces');
    if (/[aeiouáéó]$/i.test(w)) return w + (w === w.toUpperCase() && w.length > 1 ? 'S' : 's');
    return w + (w === w.toUpperCase() && w.length > 1 ? 'ES' : 'es');
  }
  function unitText(unit, n) {
    const u = String(unit || '').trim().toLowerCase();
    if (!u) return '';
    if (Number(n) === 1) return u;
    const [first, ...rest] = u.split(' ');
    return [pluralWord(first), ...rest].join(' ');
  }
  // «7 rollos», «1 unidad». Sin unidad, solo el número.
  const qtyWithUnit = (n, unit) => [String(n), unitText(unit, n)].filter(Boolean).join(' ');
  // Unidades femeninas (caja, lata, bolsa, unidad…) para decir «¿Cuántas?» en lugar de «¿Cuántos?».
  function isFeminineUnit(unit) {
    const w = String(unit || '').trim().split(' ')[0].toLowerCase();
    if (['día', 'dia', 'mapa', 'metro'].includes(w)) return false;
    return /(a|as|dad|dades|ión|iones)$/.test(w);
  }
  // «Queda 1 rollo» / «Quedan 7 rollos».
  const remainingText = (n, unit) => `${Number(n) === 1 ? 'Queda' : 'Quedan'} ${qtyWithUnit(n, unit)}`;

  // ---------- Filtros del inventario ----------
  // stock: '' (todos), 'empty' (cantidad 0), 'uncounted' (sin contar), 'available' (hay al menos uno).
  const isUncounted = i => i.quantity === null || i.quantity === undefined || i.quantity === '';
  const STOCK_FILTERS = [
    {value: '', label: 'Todos', test: () => true},
    {value: 'available', label: 'Con stock', test: i => !isUncounted(i) && Number(i.quantity) > 0},
    {value: 'empty', label: 'Sin stock', test: i => !isUncounted(i) && Number(i.quantity) === 0},
    {value: 'uncounted', label: 'Sin contar', test: isUncounted}
  ];
  function filterItems(items, f = {}) {
    const words = normalizeText(f.q).split(' ').filter(Boolean);
    const stock = STOCK_FILTERS.find(x => x.value === (f.stock || '')) || STOCK_FILTERS[0];
    return items.filter(i =>
      (!f.category || i.category === f.category) &&
      (!f.status || (i.status || '') === f.status) &&
      (!f.location || (i.location || '') === f.location) &&
      stock.test(i) &&
      words.every(w => normalizeText([i.category, i.name, i.detail, i.status, i.location, i.notes].join(' ')).includes(w)));
  }

  // ---------- Movimientos de stock ----------
  // type: 'in' (entra), 'out' (sale) o 'count' (recuento: fija la cantidad exacta).
  // Se guardan los últimos 50 movimientos dentro de cada elemento.
  const MOVE_LABELS = {in: 'Entrada', out: 'Salida', count: 'Recuento'};
  // restock: una entrada registrada como reposición vuelve a fijar el stock inicial (lo que quedó) y su fecha de carga.
  function applyMovement(item, {type, amount, reason = '', at = new Date().toISOString(), restock = false}) {
    const n = Number(amount);
    if (!MOVE_LABELS[type] || !Number.isFinite(n) || n < 0 || (type !== 'count' && n === 0)) return {error: 'Escribí una cantidad mayor que cero.'};
    const current = item.quantity === null || item.quantity === undefined || item.quantity === '' ? null : Number(item.quantity);
    if (type === 'out' && current === null) return {error: 'Este elemento todavía no se contó. Primero usá «Contar» para cargar cuántos hay.'};
    if (type === 'out' && n > current) return {error: `No hay tantos: ${remainingText(current, item.unit).toLowerCase()}.`};
    const quantity = type === 'count' ? n : type === 'in' ? (current || 0) + n : current - n;
    const move = {at, type, amount: n, balance: quantity, reason: String(reason || '').trim()};
    const movements = [...(Array.isArray(item.movements) ? item.movements : []), move].slice(-50);
    const next = {...item, quantity, movements, updatedAt: at};
    if (restock && type === 'in') next.initial = {quantity, at, source: 'Reposición'};
    return {item: next};
  }
  // Stock inicial: lo que había cuando el elemento se cargó (desde el Excel o a mano).
  // Si el elemento es de antes de guardar ese dato, se reconstruye deshaciendo sus movimientos.
  function initialStock(item) {
    if (item.initial && 'quantity' in item.initial) return item.initial;
    const moves = Array.isArray(item.movements) ? item.movements : [];
    if (!moves.length) return {quantity: isUncounted(item) ? null : Number(item.quantity), at: item.createdAt || item.updatedAt || ''};
    const first = moves[0];
    if (first.type === 'count') return {quantity: null, at: ''};
    const before = first.balance + (first.type === 'in' ? -first.amount : first.amount);
    return {quantity: before, at: item.createdAt || ''};
  }

  function movementRows(items) {
    const rows = [];
    items.forEach(i => (i.movements || []).forEach(m => rows.push({i, m})));
    rows.sort((a, b) => String(b.m.at).localeCompare(String(a.m.at)));
    return rows.map(({i, m}) => [fullDate(m.at), i.name || '', i.detail || '', MOVE_LABELS[m.type] || m.type,
      m.type === 'count' ? String(m.amount) : (m.type === 'in' ? '+' : '−') + m.amount, String(m.balance), i.unit || '', m.reason || '']);
  }

  function parseCsv(text) {
    const rows = [];
    let row = [], cell = '', quoted = false;
    const sep = (text.split('\n')[0].match(/;/g) || []).length > (text.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (ch === '"') quoted = false;
        else cell += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === sep) { row.push(cell); cell = ''; }
      else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else if (ch !== '\r') cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }
  // Contactos propios: los que no salen de la guía oficial del PJN.
  const isCustomContact = c => !c.source;

  const itemSort = (a, b) => String(a.category).localeCompare(String(b.category), 'es') || String(a.name).localeCompare(String(b.name), 'es') || String(a.detail || '').localeCompare(String(b.detail || ''), 'es', {numeric: true});

  // ---------- Excel para descargar e imprimir ----------
  // Mismo formato que el Excel de inventario de Intendencia: columna N°, títulos en ese orden,
  // Arial, blanco y negro, apaisado y ajustado al ancho de la hoja.
  const shortDate = v => {
    if (!v) return '';
    const d = /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(v + 'T12:00:00-03:00') : new Date(v);
    return Number.isNaN(d.getTime()) ? '' : new Intl.DateTimeFormat('es-AR', {timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric'}).format(d);
  };
  const byDate = (a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
  const EXPORTS = {
    orders: {name: 'Pedidos', label: 'Pedidos de trabajo', columns: ORDER_COLUMNS, sort: byDate, row: orderRow},
    items: {name: 'Inventario', label: 'Inventario', sort: itemSort, columns: [
      {header: 'N°', width: 6}, {header: 'Categoría', width: 24}, {header: 'Elemento', width: 28}, {header: 'Detalle / variante', width: 24},
      {header: 'Stock inicial', width: 10}, {header: 'Cantidad actual', width: 10}, {header: 'Unidad', width: 10}, {header: 'Estado', width: 18},
      {header: 'Ubicación', width: 16}, {header: 'Observaciones', width: 30}, {header: 'Fecha de carga', width: 12}],
      row: (i, n) => {
        const ini = initialStock(i);
        return [n, i.category || '', i.name || '', i.detail || '', ini.quantity === null ? 'S/D' : Number(ini.quantity), isUncounted(i) ? 'S/D' : Number(i.quantity),
          i.unit || '', i.status || '', i.location || '', i.notes || '', shortDate(ini.at || i.createdAt || i.updatedAt)];
      }},
    tools: {name: 'Herramientas', label: 'Herramientas', sort: (a, b) => String(a.name).localeCompare(String(b.name), 'es'), columns: [
      {header: 'N°', width: 6}, {header: 'Herramienta', width: 26}, {header: 'Marca', width: 16}, {header: 'Modelo', width: 16}, {header: 'N.º de inventario', width: 16},
      {header: 'Estado', width: 16}, {header: 'Asignada a', width: 22}, {header: 'Desde', width: 12}, {header: 'Observaciones', width: 30}],
      row: (t, n) => [n, t.name || '', t.brand || '', t.model || '', t.serial || '', t.holder ? 'Asignada' : (t.toolStatus || 'Disponible'), t.holder || '', t.holder ? shortDate(t.assignedDate) : '', t.notes || '']},
    contacts: {name: 'Contactos', label: 'Contactos', sort: (a, b) => String(a.name).localeCompare(String(b.name), 'es', {numeric: true}), columns: [
      {header: 'N°', width: 6}, {header: 'Nombre', width: 34}, {header: 'Dirección', width: 34}, {header: 'Teléfono', width: 20}, {header: 'Correo', width: 32}, {header: 'Notas', width: 30}],
      row: (c, n) => [n, c.name || '', c.building || '', c.phone || '', c.email || '', c.source ? '' : (c.notes || '')]}
  };
  // Una hoja con la lista que se ve en una sección. «note» se agrega al título (por ejemplo, el filtro aplicado).
  function sectionSheet(kind, list, {now = new Date(), note = '', title} = {}) {
    const e = EXPORTS[kind];
    const rows = list.slice().sort(e.sort).map((x, i) => e.row(x, i + 1));
    return {name: e.name, columns: e.columns, rows, title: title || `Intendencia · ${e.label} · ${shortDate(now.toISOString())}${note ? ' · ' + note : ''}`};
  }

  function excelSheets(state, now = new Date()) {
    const stamp = fullDate(now.toISOString());
    const copy = label => `Intendencia · ${label} · copia del ${stamp}`;
    return [
      sectionSheet('orders', state.orders, {title: copy('Pedidos de trabajo')}),
      sectionSheet('tools', state.tools, {title: copy('Herramientas')}),
      sectionSheet('items', state.items || [], {title: copy('Inventario')}),
      {name: 'Movimientos', title: copy('Movimientos de stock'), rows: movementRows(state.items || []), columns: [
        {header: 'Fecha', width: 17}, {header: 'Elemento', width: 26}, {header: 'Detalle', width: 20}, {header: 'Movimiento', width: 12},
        {header: 'Cantidad', width: 10}, {header: 'Quedó', width: 9}, {header: 'Unidad', width: 10}, {header: 'Motivo', width: 30}]}
    ];
  }

  const Core = {
    STORAGE_KEY, BACKUP_KEY, BUILDINGS, TRADES, TASKS, STATUSES, DONE,
    trade, tradeLabel, building, buildingShort, statusInfo, isDone, isUrgent,
    normalizeText, buildingForAddress, shortDependency, dependenciesForBuilding,
    emptyState, normalizeState, nextId, orderPlace, peopleNames,
    searchOrders, sortOrders, searchContacts, when, fullDate, daysSince,
    EXCEL_KEY, lastFridayNoon, weeklyExcelDue, excelSheets,
    ORDER_COLUMNS, TOOL_COLUMNS, CONTACT_COLUMNS, orderRow, toolRow, contactRow, isCustomContact,
    ITEM_COLUMNS, itemRow, qtyText, parseQuantity, itemKey, rowsToItems, mergeItems, parseCsv, itemSort,
    MOVE_LABELS, applyMovement, movementRows, STOCK_FILTERS, filterItems, isUncounted,
    unitText, qtyWithUnit, isFeminineUnit, remainingText, sectionSheet, shortDate, initialStock
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Core;
  else root.Core = Core;
})(typeof window !== 'undefined' ? window : globalThis);
