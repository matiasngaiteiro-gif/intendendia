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
  contact: {nombre: 'Contactos', prefijo: 'C', columnas: ['Código', 'Nombre', 'Teléfono', 'Correo', 'Para qué sirve']},
  item: {nombre: 'Inventario', prefijo: 'I', columnas: ['Código', 'Categoría', 'Elemento', 'Detalle / variante', 'Cantidad', 'Unidad', 'Estado', 'Ubicación', 'Observaciones', 'Actualizado']}
};

// Versión del código, para que la aplicación avise si hay que actualizarlo.
const VERSION = 4;

function doPost(e) {
  let pedido;
  try {
    pedido = JSON.parse(e.postData.contents);
  } catch (err) {
    return responder({ok: false, error: 'formato'});
  }
  return responder(atender(pedido));
}

// Al abrir la dirección en el navegador se abre la aplicación (archivo App.html de este proyecto).
// Si App.html todavía no se agregó, solo confirma que la planilla anda.
function doGet() {
  try {
    return HtmlService.createHtmlOutputFromFile('App')
      .setTitle('Intendencia · Pedidos de trabajo')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    return ContentService.createTextOutput('La planilla de Intendencia está conectada y funcionando.');
  }
}

// La aplicación abierta desde Google habla con la planilla por acá (mismos pedidos y misma clave).
function desdeApp(texto) {
  let pedido;
  try { pedido = JSON.parse(texto); } catch (err) { return JSON.stringify({ok: false, error: 'formato'}); }
  return JSON.stringify(atender(pedido));
}

// Contador de cambios: cada vez que alguien guarda algo, sube en uno.
// Las computadoras preguntan «¿cambió algo desde el número X?» y, si no cambió,
// la respuesta sale al instante sin leer la planilla.
function revision() {
  return Number(PropertiesService.getScriptProperties().getProperty('rev') || 0);
}
// Además del número general, guarda el último cambio de cada pestaña (rev_order, rev_item…):
// así, si solo cambió un pedido, no se vuelve a mandar todo el inventario.
function nuevaRevision(tipos) {
  const props = PropertiesService.getScriptProperties();
  const r = revision() + 1;
  const cambios = {rev: String(r)};
  tipos.forEach(t => { cambios['rev_' + t] = String(r); });
  props.setProperties(cambios);
  return r;
}
const LISTAS = {order: 'orders', tool: 'tools', contact: 'contacts', item: 'items'};

function atender(pedido) {
  if (CLAVE === 'CAMBIAR-ESTA-CLAVE') return {ok: false, error: 'sin-clave'};
  if (!pedido || pedido.key !== CLAVE) return {ok: false, error: 'clave'};
  try {
    if (pedido.action === 'load') {
      const rev = revision();
      const since = pedido.since === undefined ? NaN : Number(pedido.since);
      if (since === rev && rev > 0) return {ok: true, unchanged: true, rev: rev, version: VERSION};
      if (since > 0 && since < rev) {
        // Solo las pestañas que cambiaron después de lo que ya tiene esa computadora.
        const props = PropertiesService.getScriptProperties();
        const data = {version: VERSION, sheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl()};
        Object.keys(LISTAS).forEach(t => {
          if (Number(props.getProperty('rev_' + t) || 0) > since) data[LISTAS[t]] = leerHoja(t);
        });
        return {ok: true, rev: rev, partial: true, data: data};
      }
      return {ok: true, rev: rev, data: leerTodo()};
    }
    const candado = LockService.getScriptLock();
    candado.waitLock(25000); // si otra computadora está guardando, espera su turno
    try {
      let respuesta;
      if (pedido.action === 'create') respuesta = {ok: true, item: crear(pedido.kind, pedido.item, pedido.row)};
      else if (pedido.action === 'save') respuesta = {ok: true, item: guardar(pedido.kind, pedido.item, pedido.row)};
      else if (pedido.action === 'delete') { borrar(pedido.kind, pedido.id); respuesta = {ok: true}; }
      else if (pedido.action === 'import') { const creados = importar(pedido.items || []); respuesta = {ok: true, count: creados.length, items: creados}; }
      else return {ok: false, error: 'accion'};
      const tipos = pedido.action === 'import'
        ? (pedido.items || []).map(x => x && x.kind).filter((t, i, a) => HOJAS[t] && a.indexOf(t) === i)
        : (HOJAS[pedido.kind] ? [pedido.kind] : []);
      respuesta.rev = nuevaRevision(tipos);
      return respuesta;
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
    items: leerHoja('item'),
    version: VERSION,
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

// Carga varios registros juntos (copias de seguridad, inventario desde Excel).
// Los que traen código lo conservan; los nuevos reciben el siguiente número.
// Lee cada pestaña una sola vez y la escribe en un solo bloque: mucho más rápido que fila por fila.
function importar(items) {
  const creados = [];
  const porTipo = {};
  items.forEach(x => {
    if (!x || !x.item || !HOJAS[x.kind]) return;
    (porTipo[x.kind] = porTipo[x.kind] || []).push(x);
  });
  Object.keys(porTipo).forEach(tipo => {
    const h = hoja(tipo);
    const ancho = columnaDatos(tipo);
    const filas = Math.max(0, h.getLastRow() - 1);
    const valores = filas ? h.getRange(2, 1, filas, ancho).getValues().map(f => f.map(v => String(v))) : [];
    const indice = {};
    let max = 0;
    valores.forEach((f, i) => {
      indice[f[0]] = i;
      const n = Number(String(f[0]).split('-')[1]);
      if (n > max) max = n;
    });
    porTipo[tipo].forEach(x => {
      if (!x.item.id) {
        max += 1;
        x.item.id = HOJAS[tipo].prefijo + '-' + String(max).padStart(4, '0');
      }
      const fila = (x.row || []).slice(0, HOJAS[tipo].columnas.length);
      while (fila.length < HOJAS[tipo].columnas.length) fila.push('');
      fila[0] = x.item.id;
      const linea = fila.map(v => v === null || v === undefined ? '' : String(v)).concat([JSON.stringify(x.item)]);
      if (indice[x.item.id] !== undefined) valores[indice[x.item.id]] = linea;
      else { indice[x.item.id] = valores.length; valores.push(linea); }
      creados.push(x.item);
    });
    if (valores.length) h.getRange(2, 1, valores.length, ancho).setNumberFormat('@').setValues(valores);
  });
  return creados;
}

// Opcional: ejecutar una vez desde el editor para crear las pestañas antes de usar la aplicación.
function prepararPlanilla() {
  Object.keys(HOJAS).forEach(hoja);
}

// ── Copia de seguridad semanal ──────────────────────────────────────────────
// Todos los viernes guarda una copia completa de esta planilla en la carpeta «Intendencia»
// de tu Drive (la crea si no existe). Guarda las últimas 12 copias (unos tres meses);
// las más viejas van a la papelera de Drive, de donde se pueden recuperar durante 30 días.
// Para activarla: elegí «activarCopiaSemanal» arriba en el editor y tocá «Ejecutar» una sola vez.
const CARPETA_COPIAS = 'Intendencia';
const COPIAS_A_GUARDAR = 12;
const PREFIJO_COPIA = 'Copia Intendencia ';

function copiaDeSeguridad() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const carpetas = DriveApp.getFoldersByName(CARPETA_COPIAS);
  const carpeta = carpetas.hasNext() ? carpetas.next() : DriveApp.createFolder(CARPETA_COPIAS);
  const nombre = PREFIJO_COPIA + Utilities.formatDate(new Date(), 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd HH.mm');
  DriveApp.getFileById(libro.getId()).makeCopy(nombre, carpeta);

  const copias = [];
  const archivos = carpeta.getFiles();
  while (archivos.hasNext()) {
    const f = archivos.next();
    if (f.getName().indexOf(PREFIJO_COPIA) === 0) copias.push(f);
  }
  copias.sort((a, b) => b.getDateCreated() - a.getDateCreated());
  copias.slice(COPIAS_A_GUARDAR).forEach(f => f.setTrashed(true));
  return nombre + ' guardada en «' + CARPETA_COPIAS + '»';
}

function activarCopiaSemanal() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'copiaDeSeguridad')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('copiaDeSeguridad')
    .timeBased().onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(14)
    .inTimezone('America/Argentina/Buenos_Aires').create();
  const hecho = copiaDeSeguridad();
  console.log('Copia semanal activada (viernes a las 14). Primera copia: ' + hecho);
  return hecho;
}
