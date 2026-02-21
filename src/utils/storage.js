const STORAGE_KEYS = {
    API_KEY: 'excuse_engine_api_key',
    EXCUSE_HISTORY: 'excuse_engine_history',
};

export function getApiKey() {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
}

export function setApiKey(key) {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
}

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
    // Keep last 50
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
