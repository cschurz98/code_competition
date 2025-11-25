// Lightweight leaderboard connectivity using Supabase REST API with authentication
// Usage: provide window.LEADERBOARD_CONFIG = { url: 'https://<project>.supabase.co', anonKey: '<anon_public_key>', table: 'scores' }
// Functions here avoid any bundlers and rely on fetch.

const DEFAULT_TABLE = 'scores';
let currentSession = null;

function getConfig() {
  const cfg = (typeof window !== 'undefined' && window.LEADERBOARD_CONFIG) ? window.LEADERBOARD_CONFIG : null;
  if (!cfg || !cfg.url || !cfg.anonKey) return null;
  return { url: cfg.url.replace(/\/$/, ''), anonKey: cfg.anonKey, table: cfg.table || DEFAULT_TABLE };
}

function getAuthHeaders(accessToken = null) {
  const cfg = getConfig();
  if (!cfg) return {};
  const token = accessToken || (currentSession && currentSession.access_token) || cfg.anonKey;
  return {
    apikey: cfg.anonKey,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

export async function signup(email, password, username) {
  const cfg = getConfig();
  if (!cfg) return { ok: false, error: 'No leaderboard config set' };
  // Generate a fake email from username if not provided
  const userEmail = email || `${username.toLowerCase().replace(/\s+/g, '')}@codeclash.local`;
  try {
    const res = await fetch(`${cfg.url}/auth/v1/signup`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email: userEmail, password, data: { username } })
    });
    if (!res.ok) {
      const data = await res.json();
      return { ok: false, error: data.msg || data.error_description || 'Signup failed' };
    }
    const data = await res.json();
    if (data.access_token) {
      currentSession = data;
      localStorage.setItem('supabase_session', JSON.stringify(data));
      return { ok: true, user: data.user, session: data };
    }
    return { ok: false, error: 'No session returned' };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function login(email, password) {
  const cfg = getConfig();
  if (!cfg) return { ok: false, error: 'No leaderboard config set' };
  // Allow login with username by checking for @ symbol
  const loginEmail = email.includes('@') ? email : `${email.toLowerCase().replace(/\s+/g, '')}@codeclash.local`;
  try {
    const res = await fetch(`${cfg.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email: loginEmail, password })
    });
    if (!res.ok) {
      const data = await res.json();
      return { ok: false, error: data.msg || data.error_description || 'Login failed' };
    }
    const data = await res.json();
    currentSession = data;
    localStorage.setItem('supabase_session', JSON.stringify(data));
    return { ok: true, user: data.user, session: data };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function logout() {
  currentSession = null;
  localStorage.removeItem('supabase_session');
  return { ok: true };
}

export function getUser() {
  if (!currentSession) {
    try {
      const stored = localStorage.getItem('supabase_session');
      if (stored) currentSession = JSON.parse(stored);
    } catch (e) {}
  }
  return currentSession ? currentSession.user : null;
}

export async function fetchLeaderboard(limit = 50) {
  const cfg = getConfig();
  if (!cfg) return { ok: false, error: 'No leaderboard config set' };
  const endpoint = `${cfg.url}/rest/v1/${encodeURIComponent(cfg.table)}?select=name,score,status,timestamp,user_id&order=score.desc&limit=${limit}`;
  try {
    const res = await fetch(endpoint, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Fetch failed: ${res.status} ${text}` };
    }
    const data = await res.json();
    return { ok: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function submitScore(name, score, status) {
  const cfg = getConfig();
  if (!cfg) return { ok: false, error: 'No leaderboard config set' };
  const user = getUser();
  if (!user) return { ok: false, error: 'Must be logged in to submit scores' };
  
  const userId = user.id;
  const endpoint = `${cfg.url}/rest/v1/${encodeURIComponent(cfg.table)}`;
  
  try {
    // First, check if user already has a score
    const checkRes = await fetch(`${endpoint}?user_id=eq.${userId}&select=score`, {
      headers: getAuthHeaders()
    });
    
    if (checkRes.ok) {
      const existing = await checkRes.json();
      if (existing.length > 0) {
        const existingScore = existing[0].score;
        // Only update if new score is higher
        if (score <= existingScore) {
          return { ok: false, error: `Your current score (${existingScore}) is higher. Score not updated.` };
        }
        // Update existing record
        const updateRes = await fetch(`${endpoint}?user_id=eq.${userId}`, {
          method: 'PATCH',
          headers: {
            ...getAuthHeaders(),
            Prefer: 'return=representation'
          },
          body: JSON.stringify({ name, score, status, timestamp: new Date().toISOString() })
        });
        if (!updateRes.ok) {
          const text = await updateRes.text();
          return { ok: false, error: `Update failed: ${updateRes.status} ${text}` };
        }
        const data = await updateRes.json();
        return { ok: true, data, updated: true };
      }
    }
    
    // Insert new record
    const body = [{ user_id: userId, name, score, status, timestamp: new Date().toISOString() }];
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        Prefer: 'return=representation'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Insert failed: ${res.status} ${text}` };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export function isRemoteEnabled() {
  return !!getConfig();
}
