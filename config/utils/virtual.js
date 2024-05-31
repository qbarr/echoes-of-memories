import path from 'node:path';

export function virtual(vmods) {
	const fakePrefix = `\0virtual:`;
	const resolveds = new Map();
	Object.keys(vmods).forEach((id) =>
		resolveds.set(path.resolve(id), vmods[id]),
	);

	return { resolveId, load };

	function resolveId(id, importer) {
		if (id in vmods) return fakePrefix + id;
		if (importer) {
			const importerNoPrefix = importer.startsWith(fakePrefix)
				? importer.slice(fakePrefix.length)
				: importer;
			const resolved = path.resolve(path.dirname(importerNoPrefix), id);
			if (resolveds.has(resolved)) return fakePrefix + resolved;
		}
		return null;
	}

	async function load(id) {
		if (id.startsWith(fakePrefix)) {
			const idNoPrefix = id.slice(fakePrefix.length);
			const m =
				idNoPrefix in vmods
					? vmods[idNoPrefix]
					: resolveds.get(idNoPrefix);
			if (typeof m === 'function') return await m();
			return m;
		}
		return null;
	}
}
