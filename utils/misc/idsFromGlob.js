export function idsFromGlob(glob, useDefault = true) {
	return Object.fromEntries(Object.entries(glob).reduce((acc, [ fp, mod ]) => {
		const id = fp.split('/').pop().split('.').shift();
		acc.push([ id, useDefault ? mod?.default : mod ]);
		return acc;
	}, []));
}
