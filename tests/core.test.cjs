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

test('datos de la versión anterior: oficios en lugar de nombres, sin perder secciones ocultas', () => {
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
  assert.equal(s.tools[0].holder, 'Ayudante');
  assert.equal(s.tools[1].toolStatus, 'Disponible');
  assert.equal(s.trades.Ayudante.phone, '1155551234');
  assert.equal(s.trades.Electricidad.phone, '');
  ['works', 'guides', 'reminders', 'services', 'supplies'].forEach(k => assert.ok(s[k], k));
  assert.ok(s.contacts.length >= 50, 'carga la guía PJN si no había contactos');
});

test('estado vacío arranca sin pedidos de ejemplo', () => {
  const s = C.normalizeState(null, CATALOG);
  assert.equal(s.orders.length, 0);
  assert.equal(s.tools.length, 0);
});

test('mensaje de WhatsApp sin nombres ni signos de apertura', () => {
  const o = {title: 'Cambio de tubo de luz', building: C.BUILDINGS[0].id, dependency: 'Juzgado N.º 5', location: '8º piso, oficina 803', priority: 'Urgente', description: 'Llevar escalera'};
  assert.equal(C.whatsappText(o), 'Hola, podés encargarte de cambio de tubo de luz?\nDiagonal, Juzgado N.º 5, 8º piso, oficina 803.\nLlevar escalera\nEs urgente, darle prioridad.\nAvisame cuando esté listo. Gracias!');
  const normal = C.whatsappText({...o, priority: 'Media', description: '', dependency: 'Otro lugar', location: ''});
  assert.ok(!/urgente/i.test(normal));
  assert.ok(normal.includes('Diagonal.'));
  assert.ok(!/[¿¡]/.test(normal));
  assert.ok(C.whatsappLink(o, '11 5555-1234').startsWith('https://wa.me/5491155551234?text='));
  assert.ok(C.whatsappLink(o, '').startsWith('https://wa.me/?text='));
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

console.log(`${n} pruebas de la prueba piloto: OK`);
