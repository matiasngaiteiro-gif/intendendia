// Simulación mínima de Google Sheets y Apps Script para probar planilla/Codigo.gs sin Google.
// Uso en pruebas: const g = loadScript('CLAVE'); g.handle({...})
// Uso como servidor: node tests/fake-google.cjs 8790 CLAVE
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const http = require('http');

function fakeSpreadsheet() {
  const sheets = new Map();
  function makeSheet(name) {
    const rows = []; // rows[i] = array de celdas (fila i+1)
    const hidden = new Set();
    const sheet = {
      name, rows, hidden,
      getLastRow: () => rows.length,
      getRange(r, c, nr = 1, nc = 1) {
        return {
          getValues() {
            const out = [];
            for (let i = 0; i < nr; i++) {
              const row = rows[r - 1 + i] || [];
              out.push(Array.from({length: nc}, (_, j) => row[c - 1 + j] ?? ''));
            }
            return out;
          },
          setValues(vals) {
            vals.forEach((v, i) => {
              const row = rows[r - 1 + i] || (rows[r - 1 + i] = []);
              v.forEach((x, j) => { row[c - 1 + j] = x; });
            });
            return this;
          },
          setFontWeight() { return this; },
          setNumberFormat() { return this; }
        };
      },
      setFrozenRows() {},
      hideColumns(c) { hidden.add(c); },
      deleteRow(n) { rows.splice(n - 1, 1); }
    };
    return sheet;
  }
  return {
    sheets,
    getSheetByName: n => sheets.get(n) || null,
    insertSheet(n) { const s = makeSheet(n); sheets.set(n, s); return s; },
    getUrl: () => 'https://docs.google.com/spreadsheets/d/prueba/edit'
  };
}

function loadScript(key) {
  const book = fakeSpreadsheet();
  let locked = false;
  const sandbox = {
    SpreadsheetApp: {getActiveSpreadsheet: () => book},
    LockService: {getScriptLock: () => ({
      waitLock() { if (locked) throw new Error('bloqueado'); locked = true; },
      releaseLock() { locked = false; }
    })},
    ContentService: {
      MimeType: {JSON: 'json'},
      createTextOutput: text => ({text, setMimeType() { return this; }})
    },
    JSON, String, Number, Error
  };
  let code = fs.readFileSync(path.join(__dirname, '../planilla/Codigo.gs'), 'utf8');
  code = code.replace("const CLAVE = 'CAMBIAR-ESTA-CLAVE';", `const CLAVE = ${JSON.stringify(key)};`);
  vm.runInNewContext(code + '\nthis.__atender = atender; this.__doPost = doPost;', sandbox);
  return {
    book,
    handle: req => JSON.parse(sandbox.__doPost({postData: {contents: JSON.stringify(req)}}).text)
  };
}

module.exports = {loadScript};

if (require.main === module) {
  const port = Number(process.argv[2] || 8790);
  const g = loadScript(process.argv[3] || 'prueba');
  let failNext = 0;
  http.createServer((req, res) => {
    const cors = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'};
    if (req.url === '/fallar') { failNext = 1; res.writeHead(200, cors); res.end('{}'); return; }
    if (req.url === '/hoja') { res.writeHead(200, cors); res.end(JSON.stringify([...g.book.sheets.values()].map(s => ({name: s.name, rows: s.rows})))); return; }
    let body = '';
    req.on('data', d => { body += d; });
    req.on('end', () => {
      if (failNext) { failNext = 0; res.writeHead(500, cors); res.end('error'); return; }
      setTimeout(() => {
        try { res.writeHead(200, cors); res.end(JSON.stringify(g.handle(JSON.parse(body)))); }
        catch (e) { res.writeHead(200, cors); res.end(JSON.stringify({ok: false, error: String(e)})); }
      }, 300); // demora parecida a la de Google
    });
  }).listen(port, () => console.log('Google simulado en el puerto ' + port));
}
