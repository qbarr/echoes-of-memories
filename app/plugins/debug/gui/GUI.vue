<template>
	<aside class="debug-gui" :style="{ '--offset': (isTheatreEnabled ? 400 : 0) + 'px' }">
		<div ref="base" class="debug-gui-scr"></div>
	</aside>
</template>

<script setup>
import { webgl } from '#webgl/core/index.js';
import { onMounted, ref, inject, shallowRef } from 'vue';

const base = ref();
const gui = inject('gui');

const isTheatreEnabled = shallowRef(false);

onMounted(() => {
	if (gui) {
		gui.container.classList.add('debug-gui-container');
		base.value.appendChild(gui.container);
	}

	webgl.$hooks.beforeStart.watch(() => {
		webgl.$theatre.studioActive.watchImmediate((v) => {
			isTheatreEnabled.value = v;
		});
	});
});
</script>

<style lang="scss">
.debug-gui {
	--tp-base-font-family: 'Roboto Mono', 'Source Code Pro', Menlo, Consolas, Courier,
		monospace;
	position: fixed;
	top: calc(8px + var(--offset));
	right: 8px;
	width: calc(100% - 16px);
	max-width: 300px;
	height: calc(var(--inner-height) - 16px - var(--offset));
	font-family: var(--tp-base-font-family) !important;
	pointer-events: none;
	user-select: none;
	direction: ltr !important;
	z-index: 999;
}

.debug-gui-scr {
	height: 100%;
	overflow: -moz-scrollbars-none;
	overflow: hidden scroll;
	font-size: 0.3em;
	pointer-events: none;
	user-select: none;
	will-change: content;
	-ms-overflow-style: none;
	-webkit-overflow-scrolling: touch;
	scrollbar-width: none !important;

	&::-webkit-scrollbar {
		display: none;
		width: 0 !important;
		height: 0 !important;
	}

	&::after {
		display: block;
		width: 100%;

		// height: 150px;
		pointer-events: none;
		content: '';
	}
}

.debug-gui-container {
	pointer-events: all;
}

.tp-rotv {
	--tp-base-border-radius: 4px;
	--tp-blade-spacing: 4px;
	--tp-blade-unit-size: 16px;
	--tp-base-background-color: #111;
	--tp-base-shadow-color: transparent;
	--tp-container-horizontal-padding: 2px;
	--tp-container-vertical-padding: 3px;
	font-size: 10px !important;
	pointer-events: all;
}

.tp-fldv_c {
	border-left-width: 0 !important;
}

.tp-rotv:not(input) {
	user-select: none;
}

.tp-v-disabled * {
	// user-select: none;
	// opacity: inherit !important;
}

.tp-ckbv_w {
	border: 1px solid rgba(255, 255, 255, 30%);
}

.tp-tabv_c {
	border-left: 0 !important;
}

.tp-fldv_c > .tp-cntv,
.tp-tabv_c .tp-brkv > .tp-cntv {
	margin-left: 0 !important;
}

.tp-tbpv_c > .tp-fldv {
	&:nth-child(odd) {
		background: #05050b;
	}

	&:nth-child(even) {
		background: #081028;
	}
}

// .debug-gui-container input {
// 	user-select: all;
// }

.debug-gui-container input[readonly] {
	pointer-events: none;
	user-select: none;
}
</style>
