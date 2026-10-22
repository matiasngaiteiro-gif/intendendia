// Genera un archivo Excel (.xlsx) sin librerías externas.
// Un .xlsx es un .zip con algunos archivos XML adentro; acá se arma ese zip "a mano" (sin comprimir).
(function (root) {
  'use strict';

  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function zip(files) {
    const enc = new TextEncoder();
    const parts = [];
    const central = [];
    let offset = 0;
    files.forEach(({name, content}) => {
      const nameBytes = enc.encode(name);
      const data = typeof content === 'string' ? enc.encode(content) : content;
      const crc = crc32(data);
      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(6, 0x0800, true); // nombres en UTF-8
      local.setUint16(8, 0, true); // sin compresión
      local.setUint32(14, crc, true);
      local.setUint32(18, data.length, true);
      local.setUint32(22, data.length, true);
      local.setUint16(26, nameBytes.length, true);
      parts.push(new Uint8Array(local.buffer), nameBytes, data);

      const cen = new DataView(new ArrayBuffer(46));
      cen.setUint32(0, 0x02014b50, true);
      cen.setUint16(4, 20, true);
      cen.setUint16(6, 20, true);
      cen.setUint16(8, 0x0800, true);
      cen.setUint32(16, crc, true);
      cen.setUint32(20, data.length, true);
      cen.setUint32(24, data.length, true);
      cen.setUint16(28, nameBytes.length, true);
      cen.setUint32(42, offset, true);
      central.push(new Uint8Array(cen.buffer), nameBytes);
      offset += 30 + nameBytes.length + data.length;
    });
    const centralSize = central.reduce((n, p) => n + p.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, centralSize, true);
    end.setUint32(16, offset, true);
    const all = [...parts, ...central, new Uint8Array(end.buffer)];
    const out = new Uint8Array(all.reduce((n, p) => n + p.length, 0));
    let pos = 0;
    all.forEach(p => { out.set(p, pos); pos += p.length; });
    return out;
  }

  const xml = v => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function colName(i) {
    let s = '';
    for (i += 1; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + (i - 1) % 26) + s;
    return s;
  }

  // sheet = {name, title, columns: [{header, width}], rows: [[texto…]]}
  function sheetXml(sheet) {
    const last = colName(sheet.columns.length - 1);
    // Los números se guardan como números (para poder sumar en Excel); lo demás como texto.
    const cell = (ref, value, style) => typeof value === 'number' && Number.isFinite(value)
      ? `<c r="${ref}" s="${style === 3 ? 4 : style}"><v>${value}</v></c>`
      : `<c r="${ref}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${xml(value)}</t></is></c>`;
    const rows = [
      `<row r="1" ht="22" customHeight="1">${cell('A1', sheet.title, 1)}</row>`,
      `<row r="3">${sheet.columns.map((c, i) => cell(colName(i) + 3, c.header, 2)).join('')}</row>`,
      ...sheet.rows.map((r, n) => `<row r="${n + 4}">${r.map((v, i) => cell(colName(i) + (n + 4), v, 3)).join('')}</row>`)
    ];
    const lastRow = Math.max(3, sheet.rows.length + 3);
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>
<sheetViews><sheetView workbookViewId="0"><pane ySplit="3" topLeftCell="A4" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<cols>${sheet.columns.map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.width}" customWidth="1"/>`).join('')}</cols>
<sheetData>${rows.join('')}</sheetData>
${sheet.rows.length ? `<autoFilter ref="A3:${last}${lastRow}"/>` : ''}
<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>
<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>
<headerFooter><oddFooter>&amp;L${xml(sheet.title)}&amp;RPágina &amp;P de &amp;N</oddFooter></headerFooter>
</worksheet>`;
  }

  // Estilos: 0 normal, 1 título, 2 encabezado de columna, 3 celda con ajuste de texto, 4 número centrado. Todo en Arial, blanco y negro.
  const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="3"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="10"/><name val="Arial"/></font><font><b/><sz val="13"/><name val="Arial"/></font></fonts>
<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FF000000"/></left><right style="thin"><color rgb="FF000000"/></right><top style="thin"><color rgb="FF000000"/></top><bottom style="thin"><color rgb="FF000000"/></bottom><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="5">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
<xf numFmtId="49" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

  function workbook(sheets) {
    const names = sheets.map(s => xml(s.name.slice(0, 31)));
    return zip([
      {name: '[Content_Types].xml', content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}
</Types>`},
      {name: '_rels/.rels', content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`},
      {name: 'xl/workbook.xml', content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${names.map((n, i) => `<sheet name="${n}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets>
<definedNames>${sheets.map((s, i) => `<definedName name="_xlnm.Print_Titles" localSheetId="${i}">'${names[i]}'!$3:$3</definedName>`).join('')}</definedNames>
</workbook>`},
      {name: 'xl/_rels/workbook.xml.rels', content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}
<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`},
      {name: 'xl/styles.xml', content: STYLES},
      ...sheets.map((s, i) => ({name: `xl/worksheets/sheet${i + 1}.xml`, content: sheetXml(s)}))
    ]);
  }

  // ---------- Lectura de un .xlsx (para importar el inventario) ----------
  // Usa el descompresor que traen los navegadores; no hace falta ninguna librería.
  async function unzip(buffer) {
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);
    let end = bytes.length - 22;
    while (end >= 0 && view.getUint32(end, true) !== 0x06054b50) end--;
    if (end < 0) throw new Error('no-zip');
    const count = view.getUint16(end + 10, true);
    let p = view.getUint32(end + 16, true);
    const dec = new TextDecoder();
    const files = {};
    for (let i = 0; i < count; i++) {
      const method = view.getUint16(p + 10, true);
      const size = view.getUint32(p + 20, true);
      const nameLen = view.getUint16(p + 28, true);
      const extraLen = view.getUint16(p + 30, true);
      const commentLen = view.getUint16(p + 32, true);
      const local = view.getUint32(p + 42, true);
      const name = dec.decode(bytes.subarray(p + 46, p + 46 + nameLen));
      const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
      const raw = bytes.subarray(start, start + size);
      files[name] = {method, raw};
      p += 46 + nameLen + extraLen + commentLen;
    }
    const text = async name => {
      const f = files[name];
      if (!f) return null;
      if (f.method === 0) return dec.decode(f.raw);
      const stream = new Blob([f.raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return new Response(stream).text();
    };
    return {names: Object.keys(files), text};
  }

  function colIndex(ref) {
    const letters = ref.replace(/\d+/g, '');
    let n = 0;
    for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
    return n - 1;
  }

  // Devuelve las filas de la primera hoja como listas de texto.
  async function read(buffer) {
    const zipFile = await unzip(buffer);
    const parse = t => new DOMParser().parseFromString(t, 'application/xml');
    const shared = [];
    const sst = await zipFile.text('xl/sharedStrings.xml');
    if (sst) parse(sst).querySelectorAll('si').forEach(si => shared.push([...si.querySelectorAll('t')].map(t => t.textContent).join('')));
    let sheetPath = 'xl/worksheets/sheet1.xml';
    const wb = await zipFile.text('xl/workbook.xml');
    const rels = await zipFile.text('xl/_rels/workbook.xml.rels');
    if (wb && rels) {
      const first = parse(wb).querySelector('sheet');
      const rid = first && (first.getAttribute('r:id') || first.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id'));
      const rel = rid && [...parse(rels).querySelectorAll('Relationship')].find(r => r.getAttribute('Id') === rid);
      if (rel) {
        const target = rel.getAttribute('Target').replace(/^\//, '');
        sheetPath = target.startsWith('xl/') ? target : 'xl/' + target;
      }
    }
    const sheet = await zipFile.text(sheetPath);
    if (!sheet) throw new Error('no-sheet');
    const rows = [];
    parse(sheet).querySelectorAll('sheetData > row').forEach(row => {
      const r = Number(row.getAttribute('r')) - 1;
      const cells = rows[r] = [];
      row.querySelectorAll('c').forEach((c, i) => {
        const ref = c.getAttribute('r');
        const col = ref ? colIndex(ref) : i;
        const type = c.getAttribute('t');
        let value = '';
        if (type === 's') value = shared[Number(c.querySelector('v')?.textContent)] ?? '';
        else if (type === 'inlineStr') value = [...c.querySelectorAll('is t')].map(t => t.textContent).join('');
        else value = c.querySelector('v')?.textContent ?? '';
        cells[col] = value;
      });
    });
    return Array.from(rows, r => Array.from(r || [], v => v ?? ''));
  }

  const Xlsx = {workbook, crc32, read};
  if (typeof module !== 'undefined' && module.exports) module.exports = Xlsx;
  else root.Xlsx = Xlsx;
})(typeof window !== 'undefined' ? window : globalThis);
