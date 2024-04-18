const subStorageCache = new Map();

export default function subStorage(ns = 'substorage', { storage = localStorage } = {}) {
	if (storage === sessionStorage) ns += '-session';
	if (subStorageCache.has(ns)) return subStorageCache.get(ns);

	// Flag to avoid parsing the storage on every access
	// We only need to parse it when the storage is really changed
	let isStale = true;
	let cache = {};

	window.addEventListener('storage', e => {
		if (e.key !== ns) return;
		isStale = true;
	});

	const api = {
		setItem,
		getItem,
		removeItem,
		clear,
		getKeys,
		getValues,
		getEntries,
	};

	subStorageCache.set(ns, api);

	return api;

	function refreshCache() {
		if (!isStale) return;
		isStale = false;
		try {
			cache = JSON.parse(storage.getItem(ns)) ?? {};
			if (typeof cache !== 'object') cache = {};
		} catch (e) {
			cache = {};
		}
	}

	function setItem(key, value) {
		refreshCache();
		cache[ key ] = value;
		storage.setItem(ns, JSON.stringify(cache));
	}

	function getItem(key) {
		refreshCache();
		return cache[ key ];
	}

	function removeItem(key) {
		refreshCache();
		if (!(key in cache)) return;
		delete cache[ key ];
		storage.setItem(ns, JSON.stringify(cache));
	}

	function getKeys() {
		refreshCache();
		return Object.keys(cache);
	}

	function getValues() {
		refreshCache();
		return Object.values(cache);
	}

	function getEntries() {
		refreshCache();
		return Object.entries(cache);
	}

	function clear() {
		cache = {};
		storage.removeItem(ns);
	}
}
