import { storageSync, w } from '#utils/state';

import _createBuffer from '../../utils/createBuffer';
import createFilter from '../../utils/createFilter';

import { Vector2, Vector4 } from 'three';

/// #if __DEBUG__
const fs = /* glsl */`
precision highp float;
uniform mediump sampler2D frame;
uniform float ratio;
varying vec2 vUv;

void main() {
	vec2 uv = vUv * 90.;
	vec4 color = texture2D(frame, vUv ).rgba;
	vec3 checker = mod(floor(uv.x) + floor(uv.y * ratio), 2.) * vec3(0.15);
	color.rgb = mix(checker, color.rgb, 0.3 + color.a * 0.7);
	gl_FragColor = vec4(color.rgb, 1.);
}
`;
/// #endif


const noop = () => {};

export function fboPlugin(webgl) {
	const api = { createBuffer, registerBuffer: noop, unregisterBuffer: noop };
	const storage = webgl?.$debug?.storage ?? localStorage;
	webgl.$fbo = api;

	let initialized;

	/// #if __DEBUG__
	Object.assign(api, { registerBuffer, unregisterBuffer });
	let gui, guiList, previewFilter;
	const previewCoords = { previewPosition: new Vector2(), previewScale: 0.3 };
	const currentBuffer = { name: '' };
	const buffers = new Map([[ false, 'None' ]]);
	const buffersByName = new Map([[ 'None', false ]]);
	const tvec4a = new Vector4();
	/// #endif

	function createBuffer(opts) {
		init();
		const buffer = _createBuffer(opts);
		/// #if __DEBUG__
		if (opts.name) registerBuffer(opts.name, buffer);
		/// #endif
		return buffer;
	}

	function init() {
		if (initialized) return;
		initialized = true;

		/// #if __DEBUG__
		previewFilter = createFilter({
			renderer: webgl.$threeRenderer,
			fragmentShader: fs,
			uniforms: { frame: { type: 't' }, ratio: { value: 1 } },
			transparent: false
		});

		gui = webgl.$gui.addFolder({
			title: 'Framebuffers',
			index: 4
		});


		const pos = previewCoords.previewPosition;
		const scale = previewCoords.previewScale;
		const transform = storageSync(
			'gui-fbo-transform',
			w([ pos.x, pos.y, scale ]),
			{ storage: webgl.$debug.storage }
		);

		previewCoords.previewPosition.set(transform.value[ 0 ], transform.value[ 1 ]);
		previewCoords.previewScale = transform.value[ 2 ];

		gui.addBinding(
			previewCoords,
			'previewPosition',
			{ x: { step: 10 }, y: { step: 10 } }
		)
			.on('change', e => {
				if (Math.abs(e.value.x) > 100000) return;
				if (Math.abs(e.value.y) > 100000) return;
				transform.value[ 0 ] = e.value.x;
				transform.value[ 1 ] = e.value.y;
				transform.set(transform.value, true);
			});


		gui.addBinding(
			previewCoords,
			'previewScale',
			{ min: 0.05, max: 2 }
		)
			.on('change', e => {
				if (Math.abs(e.value) > 100000) return;
				transform.value[ 2 ] = e.value;
				transform.set(transform.value, true);
			});


		refreshGui();
		webgl.$hooks.afterFrame.watch(update);
		/// #endif
	}

	/// #if __DEBUG__
	function update() {
		const buffer = buffersByName.get(currentBuffer.name);
		if (!buffer) return;
		const tr = webgl.$threeRenderer;
		const size = webgl.$viewport.size.value;

		const tex = buffer.texture || buffer;
		const ratio = tex.image.width / tex.image.height;
		const width = size.x * previewCoords.previewScale;
		const height = width / ratio;
		const x = previewCoords.previewPosition.x;
		const y = size.y - height - previewCoords.previewPosition.y;

		const origAutoClear = tr.autoClear;
		const origViewport = tr.getViewport(tvec4a);
		const origRenderTarget = tr.getRenderTarget();
		tr.autoClear = false;
		tr.setRenderTarget(null);
		tr.setViewport(x, y, width, height);
		previewFilter.uniforms.frame.value = tex;
		previewFilter.uniforms.ratio.value = height / width;
		previewFilter.render();
		tr.setViewport(origViewport);
		tr.setRenderTarget(origRenderTarget);
		tr.autoClear = origAutoClear;
	}

	function refreshGui() {
		if (guiList) guiList.dispose();

		const options = [ ...buffers.values() ]
			.reverse()
			.reduce((p, c) => (p[ c ] = c, p), {});

		guiList = gui.addBinding(currentBuffer, 'name', {
			index: 0,
			label: 'Preview',
			options
		});

		const current = storage.getItem('fbo_current');
		if (current != null && Object.values(options).includes(current)) {
			currentBuffer.name = current;
			guiList.refresh();
		}

		guiList.on('change', v => toggleDebug(v.value));
	}

	function toggleDebug(v) {
		storage.setItem('fbo_current', v);
	}

	function registerBuffer(name, buffer) {
		init();
		if (buffers.has(buffer) || buffersByName.has(name)) return;
		buffers.set(buffer, name);
		buffersByName.set(name, buffer);
		refreshGui();
	}

	function unregisterBuffer(name) {
		init();
		if (!name || name === 'None') return;
		if (buffersByName.has(name)) {
			buffers.delete(buffersByName.get(name));
			buffersByName.delete(name);
		} else if (buffers.has(name)) {
			buffersByName.delete(buffers.get(name));
			buffers.delete(name);
		}
		refreshGui();
	}
	/// #endif
}
