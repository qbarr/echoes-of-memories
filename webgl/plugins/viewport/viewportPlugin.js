import { watch, watchSyncEffect } from 'vue';
import { Vector2 } from 'three';

import { s, w, holdEmits, releaseEmits } from '#utils/state';
import { debounce } from '#utils/async';

export function viewportPlugin(webgl, opts = {}) {
	const vp = webgl.$app.$viewport;
	const size = w(new Vector2(vp.width, vp.height));
	const ratio = w(size.value.x / size.value.y);
	const pixelRatio = w(vp.pixelRatio);
	const visible = w(vp.visible);
	const changed = s();

	const ddelay = (opts.debounceDelay ?? 150);
	let debouncedUpdate = ddelay <= 0 ? update : debounce(update, ddelay);

	webgl.$viewport = {
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

	let newWidth = 0;
	let newHeight = 0;
	let newPixelRatio = 0;

	watch(vp, () => {
		if (webgl.$viewport.useManualResize) return;
		resize(vp.width, vp.height);
	}, { immediate: true });

	watchSyncEffect(() => {
		visible.set(vp.visible);
	});

	function resize() {
		webgl.$canvas.style.width = vp.width + 'px';
		webgl.$canvas.style.height = vp.height + 'px';
		debouncedUpdate();
	}

	function update() {
		newWidth = vp.width;
		newHeight = vp.height;
		newPixelRatio = vp.pixelRatio;
	}

	// Force viewport metrics to update BEFORE rendering
	webgl.$hooks.afterStart.watchOnce(resize);
	webgl.$hooks.beforeFrame.watch(frame);

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
}
