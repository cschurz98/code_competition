// Lightweight leaderboard connectivity using Supabase REST API (no client SDK required)
// Usage: provide window.LEADERBOARD_CONFIG = { url: 'https://<project>.supabase.co', anonKey: '<anon_public_key>', table: 'scores' }
// Functions here avoid any bundlers and rely on fetch.

const DEFAULT_TABLE = 'scores';

function getConfig() {
  const cfg = (typeof window !== 'undefined' && window.LEADERBOARD_CONFIG) ? window.LEADERBOARD_CONFIG : null;
  if (!cfg || !cfg.url || !cfg.anonKey) return null;
  return { url: cfg.url.replace(/\/$/, ''), anonKey: cfg.anonKey, table: cfg.table || DEFAULT_TABLE };
}

export async function fetchLeaderboard(limit = 50) {
  const cfg = getConfig();
  if (!cfg) return { ok: false, error: 'No leaderboard config set' };
  const endpoint = `${cfg.url}/rest/v1/${encodeURIComponent(cfg.table)}?select=name,score,status,timestamp&order=score.desc&limit=${limit}`;
  try {
    const res = await fetch(endpoint, {
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
        'Content-Type': 'application/json'
      }
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
  const endpoint = `${cfg.url}/rest/v1/${encodeURIComponent(cfg.table)}`;
  const body = [{ name, score, status, timestamp: new Date().toISOString() }];
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
        'Content-Type': 'application/json',
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
