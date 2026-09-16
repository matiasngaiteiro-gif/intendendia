(() => {
  'use strict';
  const SESSION_KEY = 'intendencia-auth-session-v1';
  let config;
  let session;

  function configure(value) {
    config = value || {};
    const urlOk = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.SUPABASE_URL || '');
    const keyOk = /^sb_publishable_[A-Za-z0-9_-]+$/.test(config.SUPABASE_PUBLISHABLE_KEY || '');
    return urlOk && keyOk;
  }

  function headers(auth = true) {
    const result = {'apikey': config.SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json'};
    if (auth && session?.access_token) result.Authorization = `Bearer ${session.access_token}`;
    return result;
  }

  function persist(next) {
    session = next;
    if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    else localStorage.removeItem(SESSION_KEY);
  }

  function normalizeSession(data) {
    return {...data, expires_at: Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600)};
  }

  async function authRequest(path, options = {}) {
    const response = await fetch(`${config.SUPABASE_URL}/auth/v1/${path}`, {...options, headers:{...headers(false), ...(options.headers || {})}});
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.msg || body.message || body.error_description || 'No se pudo validar la sesión.');
    return body;
  }

  async function signIn(email, password) {
    const data = await authRequest('token?grant_type=password', {method:'POST', body:JSON.stringify({email, password})});
    persist(normalizeSession(data));
    return session.user;
  }

  async function refresh() {
    if (!session?.refresh_token) throw new Error('La sesión venció.');
    const data = await authRequest('token?grant_type=refresh_token', {method:'POST', body:JSON.stringify({refresh_token:session.refresh_token})});
    persist(normalizeSession(data));
    return session;
  }

  async function ensureSession() {
    if (!session) {
      try { session = JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { persist(null); }
    }
    if (!session) return null;
    if (Number(session.expires_at || 0) < Math.floor(Date.now() / 1000) + 60) {
      try { await refresh(); } catch { persist(null); return null; }
    }
    try {
      const user = await authRequest('user', {method:'GET', headers:{Authorization:`Bearer ${session.access_token}`}});
      session.user = user; persist(session); return user;
    } catch { persist(null); return null; }
  }

  async function rest(path, options = {}, retry = true) {
    await ensureSession();
    if (!session) throw new Error('La sesión venció. Volvé a ingresar.');
    const response = await fetch(`${config.SUPABASE_URL}/rest/v1/${path}`, {...options, headers:{...headers(), ...(options.headers || {})}});
    if (response.status === 401 && retry) { await refresh(); return rest(path, options, false); }
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;
    if (!response.ok) throw new Error(body?.message || body?.hint || 'No se pudo acceder a la base de datos.');
    return body;
  }

  async function getState() {
    const rows = await rest('workspace_state?id=eq.1&select=data,revision,updated_at,updated_by');
    return rows[0] || null;
  }

  async function saveState(data, expectedRevision = 0) {
    const row = await rest('rpc/save_workspace_state', {
      method:'POST',
      body:JSON.stringify({p_data:data, p_expected_revision:expectedRevision})
    });
    return Array.isArray(row) ? row[0] : row;
  }

  async function signOut() {
    if (session?.access_token) await authRequest('logout', {method:'POST', headers:{Authorization:`Bearer ${session.access_token}`}}).catch(() => {});
    persist(null);
  }

  window.db = Object.freeze({configure, signIn, signOut, ensureSession, getState, saveState, currentUser:() => session?.user || null});
})();
