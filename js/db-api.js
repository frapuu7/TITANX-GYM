/* ===== API Database Module ===== */
const API = (() => {
  const BASE = window.API_URL || 'http://localhost:3001/api';

  async function request(method, path, data) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (data) opts.body = JSON.stringify(data);
    try {
      const res = await fetch(`${BASE}${path}`, opts);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`[API] ${method} ${path} fallback:`, e.message);
      return null;
    }
  }

  /* Auth */
  function login(email, password) {
    return request('POST', '/auth/login', { email, password });
  }

  function register(name, email, password, phone) {
    return request('POST', '/auth/register', { name, email, password, phone });
  }

  /* Members */
  function getMembers() { return request('GET', '/members'); }

  function getMember(email) { return request('GET', `/members/${email}`); }

  function createMember(data) { return request('POST', '/members', data); }

  function updateMember(email, data) { return request('PUT', `/members/${email}`, data); }

  function deleteMember(email) { return request('DELETE', `/members/${email}`); }

  /* Workouts */
  function getWorkouts(email) { return request('GET', `/workouts${email ? `?email=${email}` : ''}`); }

  function createWorkout(data) { return request('POST', '/workouts', data); }

  function updateWorkout(id, data) { return request('PUT', `/workouts/${id}`, data); }

  function deleteWorkout(id) { return request('DELETE', `/workouts/${id}`); }

  /* Diets */
  function getDiets(email) { return request('GET', `/diets${email ? `?email=${email}` : ''}`); }

  function createDiet(data) { return request('POST', '/diets', data); }

  function deleteDiet(id) { return request('DELETE', `/diets/${id}`); }

  /* Checkins */
  function getCheckins(email, date) {
    let q = '';
    if (email || date) {
      q = '?';
      if (email) q += `email=${email}`;
      if (email && date) q += '&';
      if (date) q += `date=${date}`;
    }
    return request('GET', `/checkins${q}`);
  }

  function createCheckin(data) { return request('POST', '/checkins', data); }

  function updateCheckin(id, data) { return request('PUT', `/checkins/${id}`, data); }

  /* Payments */
  function getPayments(email) { return request('GET', `/payments${email ? `?email=${email}` : ''}`); }

  function createPayment(data) { return request('POST', '/payments', data); }

  /* Memberships */
  function getMemberships() { return request('GET', '/memberships'); }

  function createMembership(data) { return request('POST', '/memberships', data); }

  function updateMembership(id, data) { return request('PUT', `/memberships/${id}`, data); }

  function deleteMembership(id) { return request('DELETE', `/memberships/${id}`); }

  /* Coaches */
  function getCoaches() { return request('GET', '/coaches'); }

  /* Schedule */
  function getSchedule() { return request('GET', '/schedule'); }

  return {
    login, register,
    getMembers, getMember, createMember, updateMember, deleteMember,
    getWorkouts, createWorkout, updateWorkout, deleteWorkout,
    getDiets, createDiet, deleteDiet,
    getCheckins, createCheckin, updateCheckin,
    getPayments, createPayment,
    getMemberships, createMembership, updateMembership, deleteMembership,
    getCoaches, getSchedule,
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = API;
