/* ===== DB Sync: localStorage ↔ API Bridge ===== */
const DB = (() => {
  const BASE = window.API_URL || 'http://localhost:3001/api';

  function online() {
    return navigator.onLine !== false;
  }

  /* ---- Internal fetch ---- */
  async function api(method, path, data) {
    try {
      const opts = { method, headers: { 'Content-Type': 'application/json' } };
      if (data) opts.body = JSON.stringify(data);
      const res = await fetch(`${BASE}${path}`, opts);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /* ---- Pull all data from API into localStorage ---- */
  async function pullAll() {
    const stores = [
      { key: 'gymMembers', path: '/members' },
      { key: 'gymWorkouts', path: '/workouts' },
      { key: 'gymDiets', path: '/diets' },
      { key: 'gymCheckins', path: '/checkins' },
      { key: 'gymPayments', path: '/payments' },
      { key: 'gymMemberships', path: '/memberships' },
      { key: 'gymCoaches', path: '/coaches' },
      { key: 'gymSchedule', path: '/schedule' },
    ];
    let count = 0;
    for (const s of stores) {
      const data = await api('GET', s.path);
      if (data) {
        localStorage.setItem(s.key, JSON.stringify(data));
        count++;
      }
    }
    if (count > 0) console.log(`[DB] Sincronizados ${count} módulos desde la BD`);
    return count;
  }

  /* ---- Push a single store to API ---- */
  async function pushStore(key) {
    const data = JSON.parse(localStorage.getItem(key)) || [];
    if (!data.length) return;

    /* Members */
    if (key === 'gymMembers') {
      for (const m of data) {
        const existing = await api('GET', `/members/${m.email}`);
        if (existing) {
          await api('PUT', `/members/${m.email}`, m);
        } else {
          await api('POST', '/members', m);
        }
      }
    }
    /* Workouts */
    if (key === 'gymWorkouts') {
      const existing = await api('GET', '/workouts') || [];
      const existingIds = new Set(existing.map(w => `${w.memberEmail}-${w.name}-${w.generated}`));
      for (const w of data) {
        const key2 = `${w.memberEmail}-${w.name}-${w.generated}`;
        if (!existingIds.has(key2)) {
          await api('POST', '/workouts', w);
        }
      }
    }
    /* Diets */
    if (key === 'gymDiets') {
      const existing = await api('GET', '/diets') || [];
      const existingIds = new Set(existing.map(d => `${d.memberEmail}-${d.name}`));
      for (const d of data) {
        const key2 = `${d.memberEmail}-${d.name}`;
        if (!existingIds.has(key2)) {
          await api('POST', '/diets', d);
        }
      }
    }
    /* Payments */
    if (key === 'gymPayments') {
      for (const p of data) {
        if (!p._synced) {
          const res = await api('POST', '/payments', p);
          if (res) p._synced = true;
        }
      }
      localStorage.setItem(key, JSON.stringify(data));
    }
    /* Checkins */
    if (key === 'gymCheckins') {
      const existing = await api('GET', '/checkins') || [];
      const existingIds = new Set(existing.map(c => `${c.memberEmail}-${c.date}-${c.checkinTime}`));
      for (const c of data) {
        const key2 = `${c.memberEmail}-${c.date}-${c.checkinTime}`;
        if (!existingIds.has(key2)) {
          await api('POST', '/checkins', c);
        }
      }
    }
    /* Memberships */
    if (key === 'gymMemberships') {
      for (const m of data) {
        await api('POST', '/memberships', m).catch(() => {});
      }
    }
  }

  /* ---- Push all stores to API ---- */
  async function pushAll() {
    const keys = ['gymMembers', 'gymWorkouts', 'gymDiets', 'gymCheckins', 'gymPayments', 'gymMemberships'];
    for (const k of keys) {
      await pushStore(k);
    }
    console.log('[DB] Datos sincronizados con la BD');
  }

  /* ---- One-shot: pull then push ---- */
  async function sync() {
    const pulled = await pullAll();
    await pushAll();
    return pulled;
  }

  return { sync, pullAll, pushAll, api };
})();
