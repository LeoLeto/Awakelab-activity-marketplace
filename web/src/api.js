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

export function login(email, password) {
    return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function register(email, password, name) {
    return request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) });
}

export function logout() {
    return request('/auth/logout', { method: 'POST' });
}

export function me() {
    return request('/auth/me');
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
