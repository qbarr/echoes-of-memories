<template>
	<main class="ui">
		<RouterView />

		<!-- <div class="cross-cursor"></div> -->
	</main>

	<WebGL />

	<Debug v-if="isDebug" />
</template>

<script setup>
// import { CrossCursor } from './components/CrossCursor.vue';
import { shallowRef } from 'vue';
import { app } from './core';

const isDebug = shallowRef(__DEBUG__ ?? false);

// document.addEventListener('click', onClick); // TODO: temp

// const { $store, $webgl } = $app;

// function preventDebug(ev) {
// 	const isStudioActive = $webgl.$theatre.studioActive.value;
// 	return (
// 		ev.target.closest('.debug') ||
// 		ev.target.closest('#theatrejs-studio-root') ||
// 		isStudioActive
// 	);
// }

// function onClick(ev) {
// 	/// #if __DEBUG__
// 	if (preventDebug(ev)) return;
// 	/// #endif

// 	const { $getCurrentScene, $canvas } = $webgl;
// 	const scene = $getCurrentScene();
// 	const currentCam = scene.getCurrentCamera();

// 	if (!this.$pointerLocked && !$store.isPaused && currentCam.name !== 'Debug Camera') {
// 		$canvas.requestPointerLock();
// 	}
// }
</script>

<style lang="scss">
.ui {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100vw;
	height: var(--vp-height);
	overflow: hidden;
}

.page {
	position: relative;
	width: 100%;
	height: 100vh;
}

p,
a {
	color: #000;
}

h1 {
	padding: 20px;
}

.cross-cursor {
	width: 50px;
	height: 50px;
	position: relative;
	mix-blend-mode: difference;

	&::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 2px;
		height: 50%;
		background-color: #000;
		transform: translate(-50%, -50%);
		mix-blend-mode: difference;
	}

	&::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 50%;
		height: 2px;
		background-color: #000;
		transform: translate(-50%, -50%);
		mix-blend-mode: difference;
	}
}
</style>
