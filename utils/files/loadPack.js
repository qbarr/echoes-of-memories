import loadFile from './loadFile';
import { createCache, cache } from './cache';

const parsersMap = {
	'application/json': getAsJSON,
	'text/plain': getAsString,
	'application/javascript': getAsString,
	'audio/mpeg': getAsAudioBuffer,
	'audio/mp4': getAsAudioBuffer,
	'audio/wav': getAsAudioBuffer,
	'image/png': getAsImage,
	'image/jpeg': getAsImage,
	'image/gif': getAsImage,
	'image/svg+xml': getAsSVG,
	default: getAsURI
};

let packManifest = {};
let audioContext = null;

const domParser = new DOMParser();

function addManifest(newManifest) {
	Object.assign(packManifest, newManifest);
}

async function loadPack(source, opts = {}) {
	if (source.startsWith('/')) source = source.slice(1);
	const url = packManifest[ source ];

	/// #if __DEBUG__
	if (!url) throw new Error(`Can't find pack ${ source }`);
	/// #endif

	const promises = await Promise.all([
		opts.beforeParse && opts.beforeParse(source),
		loadFile(url, { responseType: 'arraybuffer', noCache: true })
	]);

	const data = promises[ 1 ];

	// Parse pack headers
	const isMM = uInt8ArrayToString(new Uint8Array(data, 0, 2)) === 'MM';
	if (!isMM) throw new Error('Invalid pack headers');

	const headers = new DataView(data, 2, 14);
	const packVersion = headers.getUint16(0, true);
	if (packVersion !== 1) throw new Error('Invalid pack version');
	// const packSize = headers.getUint32(2, true);
	const jsonSize = headers.getUint32(6, true);
	// const binSize = headers.getUint32(10, true);

	// Decode JSON files manifest from the pack
	const jsonStart = 16;
	const jsonEnd = jsonStart + jsonSize;
	const jsonData = data.slice(jsonStart, jsonEnd);
	const filelist = await getAsJSON({ buffer: jsonData });

	const offset = jsonEnd;
	const packCache = createCache();
	addPackHierarchy(packCache);
	cache.add(source, packCache);

	// Load all files and add them to pack cache and global file cache
	const files = filelist.map(async (file) => {
		if (opts.beforeFileParse) {
			opts.beforeFileParse(source, file);
		}

		const parser = getParser(source, file, opts.getParser);
		if (!parser) return;

		const buffer = data.slice(offset + file.start, offset + file.end);
		const fullPath = source + '/' + file.name;

		file.fullPath = fullPath;
		file.buffer = buffer;

		let res = await parser(file);

		if (opts.changeParsedData) {
			res = opts.changeParsedData(source, file, res);
			if (res === false) return;
		}

		if (opts.afterFileUnpack) {
			opts.afterFileUnpack(source, file, res);
		}

		cache.add(fullPath, res);
		packCache.add(file.name, res);
	});

	await Promise.all(files);
	if (opts.onLoad) opts.onLoad(packCache.list());
	return packCache.list();
}

function addPackHierarchy(pack) {
	let cached = null;
	pack.hierarchy = () => {
		cached = cached || getPackHierarchy(pack);
		return cached;
	};
}

function getPackHierarchy(pack) {
	const obj = {};
	const list = pack.list();
	for (const k in list) {
		const item = list[ k ];
		const splits = k.split('/');
		const last = splits.length - 1;
		let t = obj;
		for (let i = 0; i <= last; i++) {
			const k = splits[ i ];
			if (i === last) t[ k ] = item;
			else if (!t[ k ]) t[ k ] = {};
			t = t[ k ];
		}
	}
	return obj;
}

function getParser(pack, file, customGetParser) {
	let parser = null;

	if (customGetParser) {
		parser = customGetParser(pack, file);
		if (parser !== undefined) return parser;
	}

	if (parsersMap[ file.mime ]) {
		return parsersMap[ file.mime ];
	}

	return parsersMap.default;
}

function uInt8ArrayToString(array) {
	let str = '';
	for (let i = 0; i < array.length; i++) {
		str += String.fromCharCode(array[ i ]);
	}
	return str;
}

export function getAsURI(file) {
	const blob = new Blob([ file.buffer ], { type: file.mime });
	return URL.createObjectURL(blob);
}

export function getAsJSON(file) {
	return new Promise((resolve) => {
		getAsString(file).then((string) => {
			resolve(JSON.parse(string));
		});
	});
}

export function getAsSVG(file) {
	return new Promise((resolve) => {
		getAsString(file).then((string) => {
			const doc = domParser.parseFromString(string, 'image/svg+xml');
			const node = doc.querySelector('svg');
			resolve({ node, string });
		});
	});
}

export function getAsString(file) {
	return new Promise((resolve) => {
		const buffer = file.buffer;
		if (typeof buffer === 'string') return resolve(string);
		if (window.TextDecoder) {
			const bytes = new Uint8Array(buffer);
			const string = new TextDecoder().decode(bytes);
			resolve(string);
		} else {
			const blob = new Blob([ buffer ], { type: 'application/octet-stream' });
			const reader = new FileReader();
			reader.onload = event => resolve(event.target.result);
			reader.readAsText(blob);
		}
	});
}

export function getAsAudioBuffer(file, customContext) {
	return new Promise(resolve => {
		audioContext = (
			customContext ||
			audioContext ||
			new (window.AudioContext || window.webkitAudioContext)()
		);
		audioContext.decodeAudioData(buffer, resolve);
	});
}


export function getAsImage(file) {
	return new Promise((resolve) => {
		const node = new Image();
		const uri = getAsURI(file);
		const cb = () => resolve({ node, uri });

		node.onload = cb;
		node.decode = 'async';
		node.setAttribute('decode', 'async');
		node.src = uri;

		// if ( ! node.decode ) node.onload = cb;
		// node.src = source;
		// if ( node.decode ) node.decode().then( cb );
	});
}

loadPack.addManifest = addManifest

loadPack.loader = {
	name: 'pack',
	extensions: [ '.pack' ],
	function: loadPack
};

export default loadPack;
