// Almacenamiento local: los datos se guardan en este navegador (sin servidor ni contraseña).
// Mantiene la misma interfaz que usaba la versión con Supabase para no cambiar el resto de la app.
(() => {
  'use strict';
  const KEY = 'intendencia-estado-v2';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || null; }
    catch { return null; }
  }

  async function getState() {
    return read();
  }

  async function saveState(data, expectedRevision = 0) {
    const current = read();
    const revision = Number(current?.revision || 0);
    // Otra pestaña guardó antes: la app recarga la versión más reciente.
    if (current && revision !== Number(expectedRevision)) throw new Error('REVISION_CONFLICT');
    const row = {data, revision: revision + 1, updated_at: new Date().toISOString()};
    try { localStorage.setItem(KEY, JSON.stringify(row)); }
    catch { throw new Error('el navegador no tiene espacio disponible. Exportá una copia y liberá espacio.'); }
    return row;
  }

  const user = {email: 'Uso local'};
  window.db = Object.freeze({
    configure: () => true,
    ensureSession: async () => user,
    signIn: async () => user,
    signOut: async () => {},
    currentUser: () => user,
    getState,
    saveState
  });
})();
