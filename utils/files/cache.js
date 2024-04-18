function createCache() {
	let files = {};

	return { get, add, clear, list };

	function list() {
		return files;
	}

	function get(filepath, search = true) {
		if (files[ filepath ]) return files[ filepath ];
		if (!search) return;
		for (const k in files) {
			if (k.match(filepath)) return files[ k ];
		}
	}

	function add(filepath, content) {
		files[ filepath ] = content;
	}

	function clear() {
		files = {};
	}
}

const cache = createCache();
export { createCache, cache };
