import { BasicShadowMap, Color, Vector2, WebGLRenderer } from 'three';

import { holdEmits, releaseEmits, s, w } from '#utils/state';
import { clamp } from '#utils/maths';
import { patchThreeRenderer } from './patchThreeRenderer.js';

const pixelCountPreset = {
	'720p': 1280 * 720,
	'1080p': 1920 * 1080,
	'1440p': 2560 * 1440,
	'2k': 2560 * 1440,
	'3k': 2880 * 1620,
	'4k': 3840 * 2160,
	'5k': 5120 * 2880,
	'8k': 7680 * 4320,
};

export function rendererPlugin(webgl) {
	/** @type {WebGLRenderer} */
	let renderer;

	const clearColor = new Color(0xffffff);
	const drawingBufferSize = w(new Vector2());
	const pixelRatio = w(1);

	let minPixelRatio = 1;
	let maxPixelRatio = 2;
	let maxPixelCount = pixelCountPreset[ '3k' ];

	const options = {
		antialias: false,
		alpha: false,
		depth: true,
		stencil: false,
		preserveDrawingBuffer: false,
		powerPreference: 'high-performance',
		// premultipliedAlpha: false
	};

	const hooks = {
		beforeInit: s(),
		afterInit: s()
	};

	const api = webgl.$renderer = {
		setup,
		options,
		hooks,
		clearColor,
		resize,
		setMinPixelRatio,
		setMaxPixelRatio,
		setMaxPixelCount,
		drawingBufferSize,
		pixelRatio
	};

	function setup({ Renderer, ...newOpts } = {}) {
		Object.assign(options, newOpts);
		options.canvas = webgl.$canvas;
		hooks.beforeInit.emit();

		const ThreeRenderer = Renderer ?? WebGLRenderer;
		renderer = new ThreeRenderer(options);

		patchThreeRenderer(renderer);

		renderer.debug = {
			// Disable shader error check in production
			// For a small performance boost
			checkShaderErrors: typeof __DEBUG__ !== 'undefined' && !!__DEBUG__,
		};

		webgl.$renderer.instance = renderer;
		webgl.$threeRenderer = renderer;

		api.isWebGL2 = !!(renderer?.capabilities?.isWebGL2 ?? true);

		// Trigger first resizes
		renderer.getDrawingBufferSize(drawingBufferSize.value);
		resize();

		renderer.setClearColor(clearColor, 1);
		renderer.autoClear = false;
		renderer.shadowMap.enabled = false;
		renderer.shadowMap.type = BasicShadowMap;

		renderer.info.autoReset = false;
		webgl.$hooks.beforeFrame.watch(() => renderer.info.reset());

		hooks.afterInit.emit();
		webgl.$viewport.changed.watch(resize);
	}

	function setMinPixelRatio(v) {
		if (minPixelRatio === v) return;
		minPixelRatio = v;
		defferUpdate();
	}

	function setMaxPixelRatio(v) {
		if (maxPixelRatio === v) return;
		maxPixelRatio = v;
		defferUpdate();
	}

	function setMaxPixelCount(v) {
		if (typeof v === 'string') {
			v = pixelCountPreset[ v.toLowerCase() ];
			if (!v) return;
		} else if (v == null) {
			v = 0;
		}
		maxPixelCount = v;
		defferUpdate();
	}


	let deffered = false;
	function defferUpdate() {
		if (deffered) return;
		deffered = true;
		webgl.$hooks.beforeFrame.watchOnce(resize);
	}

	function resize() {
		deffered = false;
		let pr = clamp(webgl.$viewport.pixelRatio.value, minPixelRatio, maxPixelRatio);
		const vp = webgl.$viewport.size.value;
		const currentSize = Vector2.get();

		// Maximum pixel count
		let pixelCount = pr * vp.x * vp.y;
		if (maxPixelCount > 0 && pixelCount > maxPixelCount) {
			pr /= pixelCount / maxPixelCount;
		}

		renderer.getSize(currentSize);
		if (renderer.getPixelRatio() !== pr) renderer.setPixelRatio(pr);
		if (!currentSize.equals(vp)) renderer.setSize(vp.x, vp.y);
		updateBufferSize();
		currentSize.release();
	}

	function updateBufferSize() {
		const size = drawingBufferSize.value;
		const tVec3 = Vector2.get();
		renderer.getDrawingBufferSize(tVec3);
		holdEmits();
		if (!tVec3.equals(size)) drawingBufferSize.set(size.copy(tVec3), true);
		pixelRatio.set(renderer.getPixelRatio());
		tVec3.release();
		releaseEmits();
	}
}
