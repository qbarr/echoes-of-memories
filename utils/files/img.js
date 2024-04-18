const supports = {
	default: true,
	webp: false,
	avif: false
};

const types = {
	avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=',
	webp: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
	default: 'data:,x'
};

async function supportsType(type) {
	return new Promise(resolve => {
		const img = document.createElement('img');
		img.onload = () => resolve(supports[ type ] = true);
		img.onerror = () => resolve(supports[ type ] = false);
		img.src = types[ type ] ?? types.default;
	});
}

const testPromise = Promise.all([
	supportsType('webp'),
	supportsType('avif')
]);

function test() {
	return testPromise;
}

function select(def, webp, avif) {
	if (typeof def === 'object') {
		avif = def.avif;
		webp = def.webp;
		def = def.url ?? def.default ?? def;
	}

	if (supports.avif && avif) return avif;
	else if (supports.webp && webp) return webp;
	else return def;
}

/**
 * List image from a vite import glob object
 *
 * Example:
 * const icons = img.list(import.meta.glob('/app/assets/icons/*', { eager: true, as: 'url' }));
 *
 */

const DEFAULT_EXTENSIONS = [ 'jpeg', 'png', 'jpg', 'gif' ];
const IMAGES_EXTENSIONS = [ ...DEFAULT_EXTENSIONS, 'avif', 'webp' ];

function list(res, forceList) {
	let imgs = {};

	for (let filepath in res) {
		const pkg = res[ filepath ];
		const url = pkg.default ?? pkg;
		const filename = filepath.split('/').pop().split('.');
		let ext = filename.pop();
		if (!IMAGES_EXTENSIONS.includes(ext)) continue;
		if (DEFAULT_EXTENSIONS.includes(ext)) ext = 'url';
		const name = filename.join('.');
		const obj = imgs[ name ] = (imgs[ name ] || {});
		obj[ ext ] = url;
	}

	if (Object.values(imgs).length === 1 && !forceList) {
		imgs = Object.values(imgs)[ 0 ];
	}

	return imgs;
}

export default {
	test,
	list,
	select,
	get: select,
	supports
};
