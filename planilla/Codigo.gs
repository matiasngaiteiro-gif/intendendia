/**
 * Intendencia · conexión con la planilla de Google.
 *
 * Este código se pega en la planilla (Extensiones > Apps Script) y se implementa como
 * "Aplicación web". La aplicación de pedidos le envía cada cambio y la planilla lo guarda
 * en una fila: una pestaña para Pedidos, otra para Herramientas y otra para Contactos.
 *
 * La última columna de cada pestaña ("datos") está oculta y guarda el registro completo
 * que usa la aplicación. Las otras columnas son para leer, filtrar e imprimir.
 * No cambies los títulos ni el orden de las columnas.
 */

// 1) Cambiá esta clave por una propia (letras y números, sin espacios) antes de implementar.
//    La misma clave se escribe una vez en Ajustes de la aplicación, en cada computadora.
const CLAVE = 'CAMBIAR-ESTA-CLAVE';

const HOJAS = {
  order: {nombre: 'Pedidos', prefijo: 'OT', columnas: ['Número', 'Fecha del pedido', 'Trabajo', 'Oficio', 'Edificio', 'Dependencia', 'Piso / oficina', 'Urgente', 'Estado', 'Terminado el', 'Indicaciones']},
  tool: {nombre: 'Herramientas', prefijo: 'H', columnas: ['Código', 'Herramienta', 'Marca y modelo', 'N.º de inventario', 'Estado', 'La tiene', 'Desde', 'Nota']},
  contact: {nombre: 'Contactos', prefijo: 'C', columnas: ['Código', 'Nombre', 'Teléfono', 'Correo', 'Para qué sirve']}
};

function doPost(e) {
  let pedido;
  try {
    pedido = JSON.parse(e.postData.contents);
  } catch (err) {
    return responder({ok: false, error: 'formato'});
  }
  return responder(atender(pedido));
}

// También responde si se abre la dirección en el navegador, para comprobar que está andando.
function doGet() {
  return ContentService.createTextOutput('La planilla de Intendencia está conectada y funcionando.');
}

function atender(pedido) {
  if (CLAVE === 'CAMBIAR-ESTA-CLAVE') return {ok: false, error: 'sin-clave'};
  if (!pedido || pedido.key !== CLAVE) return {ok: false, error: 'clave'};
  try {
    if (pedido.action === 'load') return {ok: true, data: leerTodo()};
    const candado = LockService.getScriptLock();
    candado.waitLock(25000); // si otra computadora está guardando, espera su turno
    try {
      if (pedido.action === 'create') return {ok: true, item: crear(pedido.kind, pedido.item, pedido.row)};
      if (pedido.action === 'save') return {ok: true, item: guardar(pedido.kind, pedido.item, pedido.row)};
      if (pedido.action === 'delete') { borrar(pedido.kind, pedido.id); return {ok: true}; }
      if (pedido.action === 'import') return {ok: true, count: importar(pedido.items || [])};
      return {ok: false, error: 'accion'};
    } finally {
      candado.releaseLock();
    }
  } catch (err) {
    return {ok: false, error: String(err && err.message || err)};
  }
}

function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}

function hoja(tipo) {
  const def = HOJAS[tipo];
  if (!def) throw new Error('Tipo desconocido: ' + tipo);
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let h = libro.getSheetByName(def.nombre);
  const encabezado = def.columnas.concat(['datos']);
  if (!h) {
    h = libro.insertSheet(def.nombre);
    h.getRange(1, 1, 1, encabezado.length).setValues([encabezado]).setFontWeight('bold');
    h.setFrozenRows(1);
    h.hideColumns(encabezado.length);
  }
  return h;
}

function columnaDatos(tipo) { return HOJAS[tipo].columnas.length + 1; }

function leerHoja(tipo) {
  const h = hoja(tipo);
  const filas = h.getLastRow() - 1;
  if (filas < 1) return [];
  const valores = h.getRange(2, columnaDatos(tipo), filas, 1).getValues();
  const items = [];
  valores.forEach(v => {
    if (!v[0]) return;
    try { items.push(JSON.parse(v[0])); } catch (err) { /* fila editada a mano: se ignora */ }
  });
  return items;
}

function leerTodo() {
  return {
    orders: leerHoja('order'),
    tools: leerHoja('tool'),
    contacts: leerHoja('contact'),
    sheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl()
  };
}

function filaDe(tipo, id) {
  const h = hoja(tipo);
  const filas = h.getLastRow() - 1;
  if (filas < 1) return 0;
  const ids = h.getRange(2, 1, filas, 1).getValues();
  for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return i + 2;
  return 0;
}

function siguienteId(tipo) {
  const def = HOJAS[tipo];
  const h = hoja(tipo);
  const filas = h.getLastRow() - 1;
  let max = 0;
  if (filas > 0) {
    h.getRange(2, 1, filas, 1).getValues().forEach(v => {
      const n = Number(String(v[0]).split('-')[1]);
      if (n > max) max = n;
    });
  }
  return def.prefijo + '-' + String(max + 1).padStart(4, '0');
}

function escribir(tipo, item, fila) {
  const h = hoja(tipo);
  const valores = (fila || []).slice(0, HOJAS[tipo].columnas.length);
  while (valores.length < HOJAS[tipo].columnas.length) valores.push('');
  valores[0] = item.id; // la primera columna siempre es el código
  // Texto tal cual: evita que la planilla convierta fechas o números a su manera.
  const linea = valores.map(v => v === null || v === undefined ? '' : String(v)).concat([JSON.stringify(item)]);
  let n = filaDe(tipo, item.id);
  if (!n) n = h.getLastRow() + 1;
  h.getRange(n, 1, 1, linea.length).setNumberFormat('@').setValues([linea]);
}

// Pedidos y herramientas nuevos reciben el número acá, para que dos computadoras no usen el mismo.
function crear(tipo, item, fila) {
  item.id = siguienteId(tipo);
  if (fila && fila.length) fila[0] = item.id;
  escribir(tipo, item, fila);
  return item;
}

function guardar(tipo, item, fila) {
  if (!item || !item.id) throw new Error('Falta el código');
  escribir(tipo, item, fila);
  return item;
}

function borrar(tipo, id) {
  const n = filaDe(tipo, id);
  if (n) hoja(tipo).deleteRow(n);
}

// Primera carga: sube lo que ya estaba guardado en una computadora. Conserva los números existentes.
function importar(items) {
  items.forEach(x => {
    if (!x || !x.item || !x.item.id) return;
    escribir(x.kind, x.item, x.row);
  });
  return items.length;
}

// Opcional: ejecutar una vez desde el editor para crear las pestañas antes de usar la aplicación.
function prepararPlanilla() {
  Object.keys(HOJAS).forEach(hoja);
}
