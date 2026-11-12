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
html = html.replace(/<script src="([^"?]+)(\?[^"]*)?"><\/script>/g, (_, f) => {
  const code = leer(f);
  if (/<\/script/i.test(code)) throw new Error(`${f} contiene </script>`);
  return `<script>\n${code}\n</script>`;
});
fs.writeFileSync(path.join(raiz, 'planilla/App.html'), html);
console.log(`planilla/App.html: ${(html.length / 1024).toFixed(0)} KB`);
