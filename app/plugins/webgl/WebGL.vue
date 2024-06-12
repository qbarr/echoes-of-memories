<template>
	<aside v-once ref="$$wrapper" class="webgl-wrapper" data-touch />
</template>

<script setup>
import { getCurrentInstance, nextTick, onMounted, onUnmounted, shallowRef } from 'vue';
import { useSize } from '#app/composables/useSize/useSize.js';

const props = defineProps({
	useResizeObserver: { type: Boolean, default: false },
});

const $$wrapper = shallowRef();

const app = getCurrentInstance().appContext.config.globalProperties;
const webglInternals = app.$webglInternals;

let canvas = shallowRef();

if (webglInternals && props.useResizeObserver) {
	let $webgl = null;
	let needsResize = false;

	const resize = () => {
		const vp = $webgl.$viewport;
		vp.useManualResize = true;
		vp.resize(size.width, size.height);
	};

	const { size } = useSize({
		ref: $$wrapper,
		cb: () => {
			if (!$webgl) return (needsResize = true);
			resize();
		},
	});

	webglInternals.onReady(async (webgl) => {
		$webgl = webgl;
		if (!needsResize) return;
		await nextTick();
		resize();
	});
}

onMounted(() => {
	if (webglInternals.canvas) {
		canvas.value = webglInternals.canvas;
		canvas.value.classList.add('webgl-canvas');
		$$wrapper.value.appendChild(canvas.value);

		/// #if __DEBUG__
		app.$webgl.$hooks.beforeStart.watchOnce(() => {
			app.$webgl.$theatre.studioActive.watchImmediate((v) => {
				$$wrapper.value.classList.toggle('theatre-studio_active', v);
			});
		});
		/// #endif
	}
});

onUnmounted(() => {
	if (canvas.value && canvas.value.parentNode === $$wrapper.value) {
		$$wrapper.value.removeChild(canvas.value);
	}
	canvas.value = null;
});

defineExpose({ wrapper: $$wrapper, canvas });
</script>

<style lang="scss">
.webgl-wrapper {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	overflow: hidden;
	overflow: clip;
	user-select: none;
	contain: strict;

	/// #if __DEBUG__
	&.theatre-studio_active {
		transform: translateY(-200px) scale(0.5);
	}
	/// #endif
}

.webgl-canvas {
	outline: none;
}
</style>
