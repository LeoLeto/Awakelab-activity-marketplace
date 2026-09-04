async function request(path, options = {}) {
    const res = await fetch(path, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        credentials: 'same-origin',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || 'Ha ocurrido un error.');
    }
    return data;
}

export function sessionLogin(identifier, password) {
    return request('/session/login', { method: 'POST', body: JSON.stringify({ identifier, password }) });
}

export function sessionLogout() {
    return request('/session/logout', { method: 'POST' });
}

export function sessionMe() {
    return request('/session/me');
}

export function register(email, password, name) {
    return request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) });
}

export function listGames(q, sort) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (sort) params.set('sort', sort);
    const qs = params.toString();
    return request('/auth/games' + (qs ? '?' + qs : ''));
}

export function getGame(id) {
    return request('/auth/games/' + id);
}

export function rateGame(id, stars) {
    return request('/auth/games/' + id + '/rate', { method: 'POST', body: JSON.stringify({ stars }) });
}

export function listSchools() {
    return request('/admin/schools');
}

export function createSchool(name) {
    return request('/admin/schools', { method: 'POST', body: JSON.stringify({ name }) });
}

export function toggleSchool(id, active) {
    return request('/admin/schools/' + id + '/toggle', { method: 'POST', body: JSON.stringify({ active }) });
}

export function listAdmins() {
    return request('/admin/admins');
}

export function createAdmin(username, password) {
    return request('/admin/admins', { method: 'POST', body: JSON.stringify({ username, password }) });
}

export function toggleAdmin(id, active) {
    return request('/admin/admins/' + id + '/toggle', { method: 'POST', body: JSON.stringify({ active }) });
}

export function listUsers() {
    return request('/admin/users');
}
