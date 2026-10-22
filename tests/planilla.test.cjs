// Pruebas del código de la planilla (planilla/Codigo.gs) con Google simulado: node tests/planilla.test.cjs
const assert = require('assert');
const {loadScript} = require('./fake-google.cjs');
const C = require('../core.js');

let n = 0;
const test = (name, fn) => { fn(); n++; };

test('rechaza sin clave correcta y avisa si no se cambió la clave', () => {
  const g = loadScript('secreta');
  assert.deepEqual(g.handle({key: 'otra', action: 'load'}), {ok: false, error: 'clave'});
  const sinCambiar = loadScript('CAMBIAR-ESTA-CLAVE');
  assert.equal(sinCambiar.handle({key: 'CAMBIAR-ESTA-CLAVE', action: 'load'}).error, 'sin-clave');
});

test('crea pedidos con número propio, sin repetir entre computadoras', () => {
  const g = loadScript('k');
  const o = {title: 'Cambio de tubo de luz', specialty: 'Electricidad', building: C.BUILDINGS[0].id, dependency: 'Juzgado N.º 5', priority: 'Urgente', status: 'Pendiente', createdAt: '2026-10-22T11:00:00Z'};
  const a = g.handle({key: 'k', action: 'create', kind: 'order', item: {...o}, row: C.orderRow(o)});
  const b = g.handle({key: 'k', action: 'create', kind: 'order', item: {...o, title: 'Otro'}, row: C.orderRow(o)});
  assert.equal(a.item.id, 'OT-0001');
  assert.equal(b.item.id, 'OT-0002');
  const sheet = g.book.getSheetByName('Pedidos');
  assert.deepEqual(sheet.rows[0], ['Número', 'Fecha del pedido', 'Trabajo', 'Oficio', 'Edificio', 'Dependencia', 'Piso / oficina', 'Urgente', 'Estado', 'Terminado el', 'Indicaciones', 'datos']);
  assert.equal(sheet.rows[1][0], 'OT-0001');
  assert.equal(sheet.rows[1][3], 'Electricista');
  assert.equal(sheet.rows[1][7], 'Sí');
  assert.ok(sheet.hidden.has(12), 'la columna de datos queda oculta');
});

test('guardar actualiza la misma fila; borrar la quita; leer devuelve todo', () => {
  const g = loadScript('k');
  const o = {title: 'Pérdida en canilla', specialty: 'Plomería', status: 'Pendiente', createdAt: '2026-10-22T11:00:00Z'};
  const {item} = g.handle({key: 'k', action: 'create', kind: 'order', item: o, row: C.orderRow(o)});
  item.status = 'Resuelto';
  item.completedAt = '2026-10-22T15:00:00Z';
  g.handle({key: 'k', action: 'save', kind: 'order', item, row: C.orderRow(item)});
  const sheet = g.book.getSheetByName('Pedidos');
  assert.equal(sheet.rows.length, 2);
  assert.equal(sheet.rows[1][8], 'Terminado');
  const t = {name: 'Taladro', holder: 'Carlos', assignedDate: '2026-10-20', toolStatus: 'Entregada'};
  const tool = g.handle({key: 'k', action: 'create', kind: 'tool', item: t, row: C.toolRow(t)}).item;
  assert.equal(tool.id, 'H-0001');
  const loaded = g.handle({key: 'k', action: 'load'}).data;
  assert.equal(loaded.orders[0].status, 'Resuelto');
  assert.equal(loaded.tools[0].holder, 'Carlos');
  assert.ok(loaded.sheetUrl.startsWith('https://docs.google.com/'));
  g.handle({key: 'k', action: 'delete', kind: 'order', id: item.id});
  assert.equal(g.handle({key: 'k', action: 'load'}).data.orders.length, 0);
});

test('importar conserva los números y no duplica', () => {
  const g = loadScript('k');
  const items = [{id: 'OT-0007', title: 'A', specialty: 'Pintura', status: 'Pendiente'}, {id: 'OT-0003', title: 'B', specialty: 'Pintura', status: 'Pendiente'}]
    .map(item => ({kind: 'order', item, row: C.orderRow(item)}));
  assert.equal(g.handle({key: 'k', action: 'import', items}).count, 2);
  g.handle({key: 'k', action: 'import', items});
  assert.equal(g.handle({key: 'k', action: 'load'}).data.orders.length, 2);
  const nuevo = {title: 'C', specialty: 'Pintura', status: 'Pendiente'};
  assert.equal(g.handle({key: 'k', action: 'create', kind: 'order', item: nuevo, row: C.orderRow(nuevo)}).item.id, 'OT-0008');
});

test('una fila editada a mano en la columna de datos no rompe la lectura', () => {
  const g = loadScript('k');
  const o = {title: 'A', specialty: 'Pintura', status: 'Pendiente'};
  g.handle({key: 'k', action: 'create', kind: 'order', item: o, row: C.orderRow(o)});
  g.book.getSheetByName('Pedidos').rows.push(['OT-0099', '', 'escrito a mano', '', '', '', '', '', '', '', '', 'no es json']);
  assert.equal(g.handle({key: 'k', action: 'load'}).data.orders.length, 1);
});

test('inventario: importar asigna códigos a los nuevos y lee la pestaña Inventario', () => {
  const g = loadScript('k');
  const nuevos = [{category: 'Pinturas', name: 'Silicona', quantity: 8, unit: 'Pomo'}, {category: 'Pinturas', name: 'Látex', quantity: null}]
    .map(item => ({kind: 'item', item, row: C.itemRow({...item, id: ''})}));
  const r = g.handle({key: 'k', action: 'import', items: nuevos});
  assert.equal(r.count, 2);
  assert.deepEqual(r.items.map(i => i.id), ['I-0001', 'I-0002']);
  const hoja = g.book.getSheetByName('Inventario');
  assert.equal(hoja.rows[0][1], 'Categoría');
  assert.equal(hoja.rows[2][4], 'Sin contar');
  const data = g.handle({key: 'k', action: 'load'}).data;
  assert.equal(data.items.length, 2);
  assert.equal(data.version, 2);
});

console.log(`${n} pruebas de la planilla: OK`);
