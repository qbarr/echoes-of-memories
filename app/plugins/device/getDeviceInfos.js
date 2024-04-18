/*

getDeviceInfos
──────────────
Gather all informations about a device

*/

import defaultTestObject from './defaultGPUTests';

let testObject;

if (typeof __GPU_TESTS__ !== 'undefined') {
	testObject = __GPU_TESTS__;
} else {
	testObject = defaultTestObject;
}

const UNKNOWN = 'unknown';
const match = (str, a, all) => a.reduce((p, c) => all ? (p && !!str.match(c)) : (p || !!str.match(c)), false); // eslint-disable-line
const findType = ( str, o ) => { for ( const k in o ) if ( match( str, o[ k ] ) ) return k }; // eslint-disable-line

const BROWSERS = {
	edge: [ 'edge', 'edg' ],
	chrome: [ 'chrome', 'crios' ],
	firefox: [ 'firefox', 'fxios' ],
	ie: [ 'msie', 'trident', 'rv:' ],
	ucbrowser: [ 'ucbrowser' ],
	safari: [ 'safari', 'ios' ],
	opera: [ 'opera', 'opios' ]
};

const QUALITIES = {
	0: 'verylow',
	1: 'low',
	2: 'medium',
	3: 'high',
	4: 'veryhigh',
	5: 'ultra'
};

export default function getDeviceInfos(userAgent, mock = false) {
	const infos = {};

	// Use mock for SSR context
	if (mock)
		return Object.assign(infos, {
			type: { desktop: true },
			os: 'windows',
			browser: 'chrome',
			browserVersion: '77',
			gpu: gpuGetQualityObject('low'),
		});

	infos.userAgent = typeof userAgent === 'string'
		? userAgent
		: navigator.userAgent.toLowerCase();

	infos.hasTouch = hasTouch();
	infos.type = getDeviceType(infos);
	infos.os = getOS(infos);
	infos.browser = getBrowser(infos);
	infos.browserVersion = getBrowserVersion(infos);

	let gl = webglCreateContext(infos, true);
	const failed = !gl;
	webglDestroyContext();

	gl = webglCreateContext(infos, false);
	infos.majorPerformanceCaveat = (gl && failed);
	infos.webgl = gl ? getWebGL(infos, gl) : null;
	webglDestroyContext();
	gl = null;

	// GPU detection is now async
	infos.gpu = gpuGetQualityObject('low');
	infos.gpuDetectionFinished = infos.webgl
		? getGPU(infos).then(gpu => Object.assign(infos.gpu, gpu))
		: Promise.resolve(infos.gpu);

	return infos;
}

// Check if the current device has touch
function hasTouch() {
	return ('ontouchstart' in window) || (navigator.maxTouchPoints > 1);
}

// Used to check iPad (and so iOS) on Apple Device
function isiOS(userAgent, hasTouch) {
	const isApple = match(userAgent, [ 'ipad', 'mac', 'macos' ]);
	const isIphone = match(userAgent, [ 'iphone' ]);
	const isMac = navigator.platform === 'MacIntel';
	return !!(!isIphone && isApple && isMac && hasTouch);
}

// Select desktop, tablet or phone (mobile)
function getDeviceType({ hasTouch, userAgent }) {
	const mobiles = [ 'ios', 'iphone', 'ipad', 'phone', 'android', 'blackberry' ];
	const hasTabletScreen = Math.max(screen.width, screen.height) > 1020;

	// Some android tablets declare being safari
	const fakeAndroidSafari = match(userAgent, [ 'android', 'safari' ], true);

	// Apple declare iPad as Desktop Safari
	const forceTablet = isiOS(userAgent, hasTouch) || fakeAndroidSafari;

	const mobile = !!(forceTablet || hasTouch && match(userAgent, mobiles));
	const tablet = !!(mobile && (forceTablet || hasTabletScreen));
	const desktop = !mobile;
	const phone = !desktop && !(tablet && forceTablet);

	return { desktop, mobile, tablet, phone };
}

// Detect OS
function getOS({ hasTouch, type, userAgent }) {
	// Apple declare iPad as Desktop Safari
	if (isiOS(userAgent, hasTouch)) return 'ios';

	const list = {
		desktop: {
			windows: [ 'windows', 'iemobile' ],
			linux: [ 'linux' ],
			macos: [ 'mac os' ]
		},
		mobile: {
			android: [ 'android' ],
			ios: [ 'ipad', 'iphone' ],
			blackberry: [ 'blackberry' ]
		}
	};

	const osList = type.desktop ? list.desktop : list.mobile;
	return findType(userAgent, osList) || UNKNOWN;
}

// Get browser
function getBrowser({ userAgent, os }) {
	const browser = findType(userAgent, BROWSERS);
	if (browser) return browser;
	if (os === 'ios') return 'safari';
	return UNKNOWN;
}

// [Private] Get Browser Version (on iOS on some webviews, this can also be the iOS version)
function getBrowserVersion({ userAgent, browser }) {
	const parse = name => {
		const splitted = userAgent.split(name)[ 1 ];
		if (!splitted || splitted.length <= 0) return;
		const value = parseFloat(splitted
			.split(' ')[ 0 ]
			.split('.')[ 0 ]
			.replace(/[^.0-9]/g, ''));
		if (isNaN(value)) return;
		else return value;
	};

	switch (browser) {
		case 'chrome':
		case 'firefox':
			BROWSERS[ browser ].forEach(browserId => {
				const parsed = parse(browserId);
				if (parsed !== null || parsed !== undefined) return parsed;
			});
			return;
		case 'safari':
			let version = userAgent.match(/version\/([.\d]+)/i);
			if (version && version[ 1 ]) return parseFloat(version[ 1 ]);
			version = userAgent.match(/os ([0-9_]+)/i);
			if (version && version[ 1 ]) return parseFloat(version[ 1 ].split('_')[ 0 ]);
			return;
		case 'ie':
		case 'edge':
			if (match(userAgent, [ 'msie' ])) return parse('msie');
			if (match(userAgent, [ 'rv:' ])) return parse('rv:');
			return parse('edge/');
		default:
			return;
	}
}

// Try to get GPU info and estimate GPU Quality
async function getGPU({ os, webgl }) {
	const gpu = {
		string: null,
		quality: { low: true },
		qualityIndex: 1,
		type: null,
		series: null,
		version: null,
		numbers: [],
		isMobile: null,
	};

	const gpuTypes = {
		intel: [ 'intel' ],
		nvidia: [ 'nvidia', 'geforce' ],
		amd: [ 'amd', 'radeon' ],
		adreno: [ 'adreno' ],
		apple: [ 'apple' ],
		mali: [ 'mali' ],
		swiftshader: [ 'swiftshader' ]
	};

	const infos = webgl && webgl.rendererInfos;
	const unmaskedRenderer = (webgl && webgl.rendererUnmasked) || '';
	if (!infos || !unmaskedRenderer.length) return gpu;

	gpu.string = gpuCleanRendererString(unmaskedRenderer);

	// Get gpu type
	gpu.type = findType(gpu.string, gpuTypes) || UNKNOWN;
	if (gpu.type === UNKNOWN) return gpu;

	// GPU is obfuscated on new apple devices
	if (os === 'ios' && gpu.string === 'apple gpu') {
		gpu.string = await gpuEstimateAppleRendererString(gpu);
		gpu.string = gpuCleanRendererString(gpu.string);
	}

	gpu.isMobile = gpu.string[ gpu.string.length - 1 ] === 'm';
	Object.assign(gpu, gpuParseVersion(gpu.string));
	gpu.series = gpuGetSeries(gpu.string);
	Object.assign(gpu, gpuEstimateQuality(infos, gpu));

	return gpu;
}


function getWebGL(infos, gl) {
	const vendorPrefixes = [ 'WEBKIT_', 'MOZ_' ];

	let exts = gl.getSupportedExtensions() || [];

	exts = exts
		.reduce((p, v) => {
			for (let i = 0; i < vendorPrefixes.length; i++)
				if (!v.indexOf(vendorPrefixes[ i ]))
					return p[ v.substring(vendorPrefixes[ i ].length) ] = v, p;
			return p[ v ] = v, p;
		}, {});

	const prefix = 'WEBGL_compressed_texture_';
	const formats = [ 's3tc', 'astc', 'etc', 'pvrtc' ]
		.reduce((p, v) =>(p[ v ] = !!exts[ prefix + v ], p), {});


	const supported = infos.browser !== 'firefox';
	const rendererDef = gl.getParameter(gl.RENDERER);
	const rendererInfos = supported && gl.getExtension(exts.WEBGL_debug_renderer_info);
	const rendererUnmasked = rendererInfos
		? gl.getParameter(rendererInfos.UNMASKED_RENDERER_WEBGL)
		: rendererDef;

	return {
		renderer: (gl.getParameter(gl.RENDERER) || '').toLowerCase(),
		rendererInfos,
		rendererUnmasked,
		version: (gl.getParameter(gl.VERSION) || '').toLowerCase(),
		glsl: (gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || '').toLowerCase(),
		extensions: exts,
		compressedTextures: formats
	};
}

// --- WEBGL METHODS ---

function webglCreateContext(infos, failIfMajorPerformanceCaveat) {
	const canvas = document.createElement('canvas');
	let gl;

	try {
		const opts = {
			alpha: false,
			antialias: false,
			depth: false,
			failIfMajorPerformanceCaveat,
			powerPreference: 'high-performance',
			stencil: false,
		};

		if (
			infos.browser === 'safari' &&
			infos.browserVersion === 12 &&
			infos.type.desktop
		) {
			delete opts.powerPreference;
		}

		gl = canvas.getContext('webgl', opts) ||
			canvas.getContext('webgl-experimental', opts) ||
			canvas.getContext('experimental-webgl', opts);
	} catch ( e ) {} // eslint-disable-line

	return gl;
}

function webglDestroyContext(gl) {
	if (!gl || !gl.getExtension('WEBGL_lose_context')) return;
	gl.getExtension('WEBGL_lose_context').loseContext();
}


// --- GPU METHODS ---

// Get GPU Version numbers
function gpuParseVersion(renderer) {
	const splitted = renderer.split(' ');
	const numbers = splitted
		.map(v => v.replace(/[\D]/g, ''))
		.filter(w => w.length > 0)
		.map(v => parseFloat(v));

	const version = numbers[ 0 ] || null;

	// Use "second number" to precise gpu sub-version
	// (A12Z are far superior than A12 for instance)
	if (renderer.startsWith('apple a')) {
		const letter = splitted[ 1 ] && splitted[ 1 ][ splitted[ 1 ].length - 1 ];
		if (letter === 'z') numbers[ 1 ] = 100;
		else if (letter === 'x') numbers[ 1 ] = 10;
		else numbers[ 1 ] = 1;
	}

	return { numbers, version };
}

function gpuGetSeries(renderer) {
	const seriesList = {
		'swiftshader': 'swiftshader',

		// apple
		'apple a': 'apple a',
		'apple m2': 'apple m2',
		'apple m1': 'apple m1',
		'apple m': 'apple m',
		'apple gpu': 'apple gpu',

		// nvidia
		'geforce gtx': 'geforce gtx',
		'geforce rtx': 'geforce rtx',
		'geforce mx': 'geforce mx',
		'titan': 'geforce titan',
		'quadro fx': 'quadro fx',
		'quadro p': 'quadro p',
		'quadro rtx': 'quadro rtx',
		'quadro ': 'quadro',
		'geforce ': 'geforce',
		'tegra ': 'tegra',

		// amd
		'radeon vii': 'radeon vii',
		'radeon r7': 'radeon r7',
		'radeon r9': 'radeon r9',
		'radeon r10': 'radeon r10',
		'radeon rx': 'radeon rx',
		'radeon pro vega': 'radeon pro vega',
		'radeon rx vega': 'radeon rx vega',
		'radeon hd': 'radeon hd',
		'radeon pro ': 'radeon pro',
		'radeon ': 'radeon',

		// intel
		'intel iris ': 'intel iris',
		'intel iris plus ': 'intel iris plus',
		'intel iris pro ': 'intel iris pro',
		'intel hd ': 'intel hd',
		'intel uhd ': 'intel uhd',

		// adreno
		'adreno': 'adreno',

		// mali
		'mali-t': 'mali t',
		'mali-g': 'mali g',
		'mali': 'mali'
	};

	const series = {};

	for (const k in seriesList) {
		if (renderer.indexOf(k) > -1) series[ seriesList[ k ] ] = true;
	}

	return series;
}

// Normalize GPU Renderer String. Credits:
// https://github.com/TimvanScherpenzeel/detect-gpu/blob/master/src/internal/cleanRendererString.ts
function gpuCleanRendererString(rendererString) {
	let cleanedRendererString = rendererString.toLowerCase();
	cleanedRendererString = cleanedRendererString.replace(/(\(tm\)|\(r\))/g, '');
	cleanedRendererString = cleanedRendererString.trim();

	// Strip off ANGLE and Direct3D version
	if (
		cleanedRendererString.includes('angle (') &&
		cleanedRendererString.includes('direct3d')
	) {
		cleanedRendererString = cleanedRendererString
			.replace('angle (', '')
			.split(' direct3d')[ 0 ];
	}

	// Strip off the GB amount
	// (1060 6gb was being concatenated to 10606 and because of it using the fallback)
	if (
		cleanedRendererString.includes('nvidia') &&
		cleanedRendererString.includes('gb')
	) {
		cleanedRendererString = cleanedRendererString
			.split(/\dgb/)[ 0 ];
	}

	return cleanedRendererString;
}

// [Private] Only iOS > 12 – Estimate "minimum" GPU renderer string from screen resolution
// Remove 51degree proprietary code for now
function gpuEstimateAppleRendererString() {
	return 'apple gpu';
}

// [Private] Estimate quality from GPU informations
// benchmarks desktop: https://www.videocardbenchmark.net/gpu_list.php
// benchmarks mobile:
//	- Super clear: https://www.techcenturion.com/mobile-gpu-rankings
//	- Super complete: https://www.notebookcheck.net/Smartphone-Graphics-Cards-Benchmark-List.149363.0.html
function gpuEstimateQuality({ type, browser }, gpu) {
	// In case the gpu is obfuscated
	if (!gpu || !gpu.type || gpu.type === 'swiftshader') {
		if (browser === 'firefox' && type.desktop) return gpuGetQualityObject('medium');
		return gpuGetQualityObject('low');
	}

	const mobileGPU = gpu.isMobile;
	const gpuBrand = gpu.type;
	const gpuSeries = gpu.series;
	const gpuVersion = gpu.version || 0;

	let gpuSubNumber = gpu.numbers[ 1 ] || 1;

	// Use GPU Cores as subnumber for mali
	const maliMatches = gpu.string.match(/(?:^| )mp(\d)+(?: |$)/i);
	if (maliMatches) gpuSubNumber = parseFloat(maliMatches[ 1 ]);

	const is = (serie) => (
		gpuSeries[ serie ]
	);

	const le = (serie, version, subNumber) => (
		is(serie) &&
		version <= gpuVersion &&
		(subNumber === undefined || gpuSubNumber <= subNumber)
	);

	const ge = (serie, version, subNumber) => (
		is(serie) &&
		gpuVersion >= version &&
		(subNumber === undefined || gpuSubNumber >= subNumber)
	);

	const brand = (brand) => (
		brand === gpuBrand
	);

	const methods = { is, le, ge, brand };

	let qualityName = 'low';
	for (let quality in testObject) {
		const testObjQuality = testObject[ quality ];
		for (let i = 0, l = testObjQuality.length; i < l; i++) {
			const args = testObjQuality[ i ];
			let firstArg = args.shift();
			if (firstArg === 'mobile' && !mobileGPU) continue;
			else if (firstArg === 'not-mobile' && mobileGPU) continue;
			if (!methods[ firstArg ]) firstArg = args.shift();
			const method = methods[ firstArg ];
			if (!method) continue;
			if (!method(...args)) continue;
			qualityName = quality;
			break;
		}
		if (qualityName !== 'low') {
			break;
		}
	}

	return gpuGetQualityObject(qualityName);
}

function gpuGetQualityObject(qualityStr) {
	const qualities = QUALITIES;
	const qualityIndex = Math.max(0, Object.values(qualities).indexOf(qualityStr));
	return {
		qualities,
		qualityIndex,
		detectedQualityIndex: qualityIndex
	};
}
