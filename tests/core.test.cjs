// Pruebas de la lógica del piloto: node tests/core.test.cjs
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const C = require('../core.js');

// Catálogo oficial (contacts-data.js define una constante global).
const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../contacts-data.js'), 'utf8') + ';this.CATALOG = OFFICIAL_CONTACTS;', ctx);
const CATALOG = ctx.CATALOG;

let n = 0;
const test = (name, fn) => { fn(); n++; };

test('cada oficio tiene tareas y una etiqueta de profesión', () => {
  C.TRADES.forEach(t => {
    assert.ok(C.TASKS[t.key].length > 0, t.key);
    assert.ok(t.label && t.icon);
  });
  assert.equal(C.tradeLabel('Electricidad'), 'Electricista');
  assert.equal(C.tradeLabel('Plomería'), 'Plomero');
});

test('dependencias por edificio, con piso y ordenadas', () => {
  const diag = C.dependenciesForBuilding(C.BUILDINGS[0].id, CATALOG);
  const names = diag.map(d => d.name);
  assert.deepEqual(names.filter(x => x.startsWith('Juzgado')), ['Juzgado N.º 1', 'Juzgado N.º 4', 'Juzgado N.º 5', 'Juzgado N.º 6', 'Juzgado N.º 7', 'Juzgado N.º 8']);
  assert.ok(names.includes('Sala A') && names.includes('Sala F'));
  assert.ok(!names.includes('Mesa Receptora Diagonal'));
  assert.equal(diag.find(d => d.name === 'Juzgado N.º 5').floor, '8º piso');
  assert.deepEqual(names.slice(-2), ['Portería', 'Otro lugar']);
  const callao = C.dependenciesForBuilding(C.BUILDINGS[1].id, CATALOG).map(d => d.name);
  assert.ok(callao.includes('Juzgado N.º 10') && !callao.includes('Juzgado N.º 2'));
  const mvd = C.dependenciesForBuilding(C.BUILDINGS[2].id, CATALOG).map(d => d.name);
  assert.deepEqual(mvd.filter(x => x.startsWith('Juzgado')), ['Juzgado N.º 27', 'Juzgado N.º 28', 'Juzgado N.º 29', 'Juzgado N.º 30', 'Juzgado N.º 31']);
});

test('datos de la versión anterior: pedidos por oficio, herramientas por persona, sin perder secciones ocultas', () => {
  const old = {
    people: [{id: 'p1', name: 'Carlos Benítez', role: 'Ayudante', phone: '1155551234'}, {id: 'p4', name: 'Laura Gómez', role: 'Electricidad'}],
    orders: [
      {id: 'OT-0001', title: 'Cambio de tubo de luz', assignee: 'p4', category: 'Electricidad', status: 'Sin asignar', priority: 'Alta', building: C.BUILDINGS[0].id},
      {id: 'OT-0002', title: 'Algo', category: 'Sanitarios', status: 'Faltan insumos', priority: 'Urgente'}
    ],
    tools: [{id: 'H-0001', name: 'Taladro', holder: 'p1', toolStatus: 'Entregada'}, {id: 'H-0002', name: 'Tester', holder: '', toolStatus: 'Entregada'}],
    works: [{id: 'W1'}], guides: [{id: 'G1'}], reminders: [{id: 'R1'}], services: [{id: 'S1'}], supplies: {depots: []}
  };
  const s = C.normalizeState(old, CATALOG);
  assert.equal(s.orders[0].specialty, 'Electricidad');
  assert.equal(s.orders[0].status, 'Pendiente');
  assert.equal(s.orders[1].specialty, 'Plomería');
  assert.equal(s.orders[1].status, 'Faltan insumos');
  assert.equal(s.tools[0].holder, 'Carlos Benítez');
  assert.equal(s.tools[1].toolStatus, 'Disponible');
  assert.deepEqual(C.peopleNames(s), ['Carlos Benítez', 'Laura Gómez']);
  ['works', 'guides', 'reminders', 'services', 'supplies'].forEach(k => assert.ok(s[k], k));
  assert.ok(s.contacts.length >= 50, 'carga la guía PJN si no había contactos');
});

test('estado vacío arranca sin pedidos de ejemplo', () => {
  const s = C.normalizeState(null, CATALOG);
  assert.equal(s.orders.length, 0);
  assert.equal(s.tools.length, 0);
});

test('búsqueda sin tildes y por oficio; urgentes primero', () => {
  const orders = [
    {id: 'OT-0001', title: 'Pérdida en canilla', specialty: 'Plomería', dependency: 'Juzgado N.º 5', createdAt: '2026-10-01T10:00:00Z'},
    {id: 'OT-0002', title: 'Cambio de tubo de luz', specialty: 'Electricidad', priority: 'Urgente', createdAt: '2026-10-05T10:00:00Z'},
    {id: 'OT-0003', title: 'Pintura de pared', specialty: 'Pintura', createdAt: '2026-09-20T10:00:00Z'}
  ];
  assert.deepEqual(C.searchOrders(orders, 'perdida').map(o => o.id), ['OT-0001']);
  assert.deepEqual(C.searchOrders(orders, 'electricista').map(o => o.id), ['OT-0002']);
  assert.deepEqual(C.searchOrders(orders, 'juzgado 5').map(o => o.id), ['OT-0001']);
  assert.deepEqual(C.sortOrders(orders, false).map(o => o.id), ['OT-0002', 'OT-0003', 'OT-0001']);
});

test('numeración de pedidos y fechas en palabras', () => {
  assert.equal(C.nextId([{id: 'OT-0009'}, {id: 'OT-0002'}], 'OT'), 'OT-0010');
  assert.equal(C.nextId([], 'OT'), 'OT-0001');
  const now = new Date('2026-10-22T15:00:00-03:00');
  assert.equal(C.when('2026-10-22T10:05:00-03:00', now), 'Hoy a las 10:05');
  assert.equal(C.when('2026-10-21T18:30:00-03:00', now), 'Ayer a las 18:30');
  assert.equal(C.when('2026-10-19T09:00:00-03:00', now), 'Hace 3 días');
  assert.equal(C.when('2026-09-01T09:00:00-03:00', now), '1 de septiembre de 2026');
});

test('búsqueda de contactos por número de juzgado', () => {
  const r = C.searchContacts(CATALOG, '1').slice(0, 4).map(c => c.name);
  assert.deepEqual(r, ['Juzgado Comercial N.º 1', 'Juzgado Comercial N.º 10', 'Juzgado Comercial N.º 11', 'Juzgado Comercial N.º 12']);
  assert.equal(C.searchContacts(CATALOG, 'biblioteca')[0].name, 'Biblioteca');
});

test('recordatorio del viernes a las 12:00 (Argentina)', () => {
  const thu = new Date('2026-10-22T15:00:00-03:00');
  assert.equal(C.lastFridayNoon(thu).toISOString(), '2026-10-16T15:00:00.000Z');
  const friBefore = new Date('2026-10-23T11:59:00-03:00');
  assert.equal(C.lastFridayNoon(friBefore).toISOString(), '2026-10-16T15:00:00.000Z');
  const friAfter = new Date('2026-10-23T12:00:00-03:00');
  assert.equal(C.lastFridayNoon(friAfter).toISOString(), '2026-10-23T15:00:00.000Z');
  assert.equal(C.weeklyExcelDue('2026-10-20T10:00:00-03:00', thu), false, 'ya se guardó esta semana');
  assert.equal(C.weeklyExcelDue('2026-10-20T10:00:00-03:00', friBefore), false, 'antes de las 12 todavía no');
  assert.equal(C.weeklyExcelDue('2026-10-20T10:00:00-03:00', friAfter), true, 'desde las 12 del viernes pide la copia');
  assert.equal(C.weeklyExcelDue('2026-10-23T12:05:00-03:00', new Date('2026-10-26T09:00:00-03:00')), false);
  assert.equal(C.weeklyExcelDue(null, thu), true, 'nunca se guardó');
});

test('Excel válido con pedidos y herramientas', () => {
  const X = require('../xlsx.js');
  const s = C.normalizeState({orders: [{id: 'OT-0001', title: 'Pérdida en canilla <baño>', specialty: 'Plomería', building: C.BUILDINGS[1].id, dependency: 'Portería', priority: 'Urgente', status: 'Pendiente', createdAt: '2026-10-22T11:00:00Z', description: 'Línea 1\nLínea 2 & más'}], tools: [{name: 'Taladro', holder: 'Carlos Benítez', assignedDate: '2026-10-20'}]}, CATALOG);
  const sheets = C.excelSheets(s, new Date('2026-10-23T15:00:00Z'));
  assert.deepEqual(sheets[0].rows[0].slice(0, 5), ['OT-0001', '22/10/2026, 08:00 h', 'Pérdida en canilla <baño>', 'Plomero', 'Callao']);
  assert.equal(sheets[0].rows[0][7], 'Sí');
  assert.deepEqual(sheets[1].rows[0].slice(4, 7), ['Prestada', 'Carlos Benítez', '20/10/2026']);
  const bytes = X.workbook(sheets);
  fs.writeFileSync(path.join(require('os').tmpdir(), 'intendencia-test.xlsx'), bytes);
  assert.equal(Buffer.from(bytes.slice(0, 4)).toString('hex'), '504b0304');
  assert.equal(X.crc32(new TextEncoder().encode('123456789')), 0xCBF43926);
});

test('inventario: lee el Excel/CSV del inventario actual y une repetidos', () => {
  const csv = fs.readFileSync(path.join(__dirname, 'inventario-ejemplo.csv'), 'utf8');
  const {items, error} = C.rowsToItems(C.parseCsv(csv));
  assert.equal(error, '');
  assert.equal(items.length, 4);
  assert.deepEqual(items[0], {category: 'Electricidad - Cables', name: 'Rollo de cable', detail: 'Color celeste', quantity: 2, unit: 'Rollo', status: 'Cerrado / nuevo', location: '', notes: ''});
  assert.equal(items[2].quantity, null, 'S/D queda sin contar');
  assert.equal(items[3].notes, 'Verificar denominación (cargado como "porta termina")');
  const {added, updated} = C.mergeItems([{id: 'I-0001', ...items[0], quantity: 5}], items);
  assert.equal(added.length, 3);
  assert.equal(updated.length, 1);
  assert.equal(updated[0].id, 'I-0001');
  assert.equal(updated[0].quantity, 2);
  assert.equal(C.rowsToItems([['Nombre raro'], ['x']]).items.length, 0);
  assert.equal(C.parseQuantity('3,5'), 3.5);
  assert.equal(C.itemRow({id: 'I-0001', quantity: null})[4], 'Sin contar');
});

console.log(`${n} pruebas de la prueba piloto: OK`);
