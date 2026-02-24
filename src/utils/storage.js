const STORAGE_KEYS = {
    API_KEY: 'excuse_engine_api_key',
    EXCUSE_HISTORY: 'excuse_engine_history',
    FAVORITES: 'excuse_engine_favorites',
    THEME: 'excuse_engine_theme',
};

// ===== API KEY =====
export function getApiKey() {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
}

export function setApiKey(key) {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
}

// ===== EXCUSE HISTORY =====
export function getExcuseHistory() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.EXCUSE_HISTORY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function saveExcuse(excuse) {
    const history = getExcuseHistory();
    const entry = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        ...excuse,
        createdAt: new Date().toISOString(),
    };
    history.unshift(entry);
    if (history.length > 50) history.length = 50;
    localStorage.setItem(STORAGE_KEYS.EXCUSE_HISTORY, JSON.stringify(history));
    return entry;
}

export function deleteExcuse(id) {
    const history = getExcuseHistory().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXCUSE_HISTORY, JSON.stringify(history));
}

export function clearHistory() {
    localStorage.removeItem(STORAGE_KEYS.EXCUSE_HISTORY);
}

// ===== FAVORITES =====
export function getFavorites() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function toggleFavorite(id) {
    const favs = getFavorites();
    const idx = favs.indexOf(id);
    if (idx >= 0) {
        favs.splice(idx, 1);
    } else {
        favs.push(id);
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    return favs;
}

export function isFavorite(id) {
    return getFavorites().includes(id);
}

// ===== THEME =====
export function getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
}

export function setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
}
