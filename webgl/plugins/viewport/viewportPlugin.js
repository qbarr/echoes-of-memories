import { Vector2 } from 'three';
import { watch, watchSyncEffect } from 'vue';

import { debounce } from '#utils/async';
import { holdEmits, releaseEmits, s, w } from '#utils/state';


export function viewportPlugin(webgl, opts = {}) {
	const vp = webgl.$app.$viewport;
	const size = w(new Vector2(vp.width, vp.height));
	const ratio = w(size.value.x / size.value.y);
	const pixelRatio = w(vp.pixelRatio);
	const visible = w(vp.visible);
	const changed = s();

	const ddelay = (opts.debounceDelay ?? 150);
	let debouncedUpdate = ddelay <= 0 ? update : debounce(update, ddelay);

	let newWidth = 0;
	let newHeight = 0;
	let newPixelRatio = 0;

	const api = {
		size,
		visible,
		ratio,
		pixelRatio,
		changed,
		resize,
		useManualResize: opts.useManualResize ?? false,
		frame,
		set debounceDelay(delay = 16) {
			debouncedUpdate = delay <= 0
				? delay
				: debounce(update, delay);
		},
	};

	function resize() {
		Object.assign(webgl.$canvas.style, {
			width: vp.width + 'px',
			height: vp.height + 'px',
		});
		debouncedUpdate();
	}

	function update() {
		newWidth = vp.width;
		newHeight = vp.height;
		newPixelRatio = vp.pixelRatio;
	}

	function frame() {
		const sizeVec = size.value;
		const sizeChanged = sizeVec.x !== newWidth || sizeVec.y !== newHeight;
		const pixelRatioChanged = pixelRatio.value !== newPixelRatio;

		if (!sizeChanged && !pixelRatioChanged) return;

		holdEmits();

		if (sizeChanged) {
			sizeVec.set(newWidth, newHeight);
			size.set(sizeVec, true);
			ratio.set(sizeVec.x / sizeVec.y);
		}

		if (pixelRatioChanged) {
			pixelRatio.set(newPixelRatio);
		}

		changed.emit();
		releaseEmits();
	}

	return {
		install: (webgl) => {
			webgl.$viewport = api;

			const { afterStart, beforeFrame } = webgl.$hooks;
			afterStart.watchOnce(resize);
			beforeFrame.watch(frame);
		},
		load: () => {
			watch(vp,
				() => {
					if (api.useManualResize) return;
					resize(vp.width, vp.height);
				},
				{ immediate: true }
			);

			watchSyncEffect(() => visible.set(vp.visible));
		}
	}
}
