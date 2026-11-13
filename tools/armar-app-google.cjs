// Arma planilla/App.html: la aplicación entera en un solo archivo, para pegarla en el proyecto de la planilla.
// Así se puede abrir desde la dirección de Google (…/exec) sin depender de GitHub.
// Uso: node tools/armar-app-google.cjs
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');
const leer = f => fs.readFileSync(path.join(raiz, f), 'utf8');

let html = leer('index.html');
html = html.replace(/\s*<meta http-equiv="Content-Security-Policy"[^>]*>/, ''); // Google pone sus propias reglas
html = html.replace(/<link rel="stylesheet" href="styles\.css[^"]*">/, () => `<style>\n${leer('styles.css')}\n</style>`);
// Google modifica algunos textos dentro del código (por ejemplo «<?xml», que usa el Excel)
// y rompe la aplicación. Por eso cada archivo va codificado en base64 (solo letras y números)
// y se decodifica al abrir: Google no tiene nada que cambiar.
const cargador = `<script>window.__correr = function (b64) {
  var bytes = Uint8Array.from(atob(b64), function (c) { return c.charCodeAt(0); });
  var s = document.createElement('script');
  s.text = new TextDecoder('utf-8').decode(bytes);
  document.body.appendChild(s);
};</script>`;
let primero = true;
html = html.replace(/<script src="([^"?]+)(\?[^"]*)?"><\/script>/g, (_, f) => {
  const b64 = Buffer.from(leer(f), 'utf8').toString('base64');
  const parte = `<script>__correr('${b64}');</script>`;
  if (primero) { primero = false; return cargador + '\n  ' + parte; }
  return parte;
});
fs.writeFileSync(path.join(raiz, 'planilla/App.html'), html);
console.log(`planilla/App.html: ${(html.length / 1024).toFixed(0)} KB`);
