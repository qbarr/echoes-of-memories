// Small wrapper around IndexedDB to make it easier to use, like localStorage.
// Source: https://github.com/jakearchibald/idb-keyval
// Some stuff are rewritten to use as "instance" if needed
// + Implements https://github.com/jakearchibald/idb-keyval/issues/165
// + Add close https://github.com/jakearchibald/idb-keyval/issues/168

const ERR_CLOSING = 'connection is closing';
const R = 'readonly';
const RW = 'readwrite';
const SKEY = 'storage';

const storagePool = new Map();

function promisify(request) {
	return new Promise((resolve, reject) => {
		request.oncomplete = request.onsuccess = () => resolve(request.result);
		request.onabort = request.onerror = () => reject(request.error);
	});
}

export default function idbStorage(ns = 'idb-storage') {
	if (storagePool.has(ns)) return storagePool.get(ns);

	let idbReq = null;
	let idbPromise = null;
	let destroyed = false;

	const api = {
		setItem: reqWrapper(RW, async (store, k, v = null) => {
			await promisify(store.put(v, k));
		}),
		getItem: reqWrapper(R, async (store, k, def = null) => {
			const v = await promisify(store.get(k));
			return v ?? def;
		}),
		removeItem: reqWrapper(RW, async (store, k) => {
			await promisify(store.delete(k));
		}),
		updateItem: reqWrapper(RW, async (store, k, fn) => {
			const item = await promisify(store.get(k));
			const newItem = fn(item);
			await promisify(store.put(newItem, k));
		}),
		clear: reqWrapper(RW, async (store) => {
			await promisify(store.clear());
		}),
		keys: reqWrapper(R, async (store) => {
			return promisify(store.getAllKeys());
		}),
		values: reqWrapper(R, async (store) => {
			return promisify(store.getAll());
		}),
		entries: reqWrapper(R, async (store) => {
			const [ keys, values ] = await Promise.all([
				promisify(store.getAllKeys()),
				promisify(store.getAll()),
			]);
			return keys.map((key, i) => [ key, values[ i ] ]);
		}),
		isIdbStorage: true,
		destroy,
		close: destroy
	};

	storagePool.set(ns, api);
	recreateDbp();

	return api;

	function recreateDbp() {
		idbPromise = (async () => {
			if (idbReq) idbReq.onupgradeneeded = null;
			idbReq = indexedDB.open(ns);
			idbReq.onupgradeneeded = () => idbReq.result.createObjectStore(SKEY);
			let db = await promisify(idbReq);
			if (!db.objectStoreNames.contains(SKEY)) {
				db.close();
				await new Promise((resolve, reject) => {
					const req = indexedDB.deleteDatabase(ns);
					req.onsuccess = resolve;
					req.onerror = reject;
				});
				idbReq = indexedDB.open(ns);
				idbReq.onupgradeneeded = () => idbReq.result.createObjectStore(SKEY);
				db = await promisify(idbReq);
			}
			return db;
		})();
	}

	async function destroy() {
		if (destroyed) return;
		destroyed = true;
		if (idbReq) idbReq.onupgradeneeded = null;
		if (idbPromise) await idbPromise.then(db => db.close()).catch(() => {});
		idbPromise = idbReq = null;
	}

	function reqWrapper(mode = R, cb, isRetry = false) {
		async function execRequest(a, b) {
			const db = await idbPromise;
			if (destroyed) return null;
			const store = await db.transaction(SKEY, mode).objectStore(SKEY);
			if (destroyed) return null;
			return cb(store, a, b);
		}

		return async function (a, b) {
			const currentIdbP = idbPromise;
			let res;
			try {
				res = await execRequest(a, b);
			} catch (e) {
				const canHandle = e instanceof Error && !isRetry && !destroyed;
				if (canHandle && e?.message?.includes(ERR_CLOSING)) {
					if (currentIdbP === idbPromise) recreateDbp();
					res = await execRequest(a, b);
				} else {
					console.error(e);
				}
			}
			return res;
		};
	}
}

