<template>
	<main class="ui">
		<RouterView />
	</main>
	<WebGL />
	<!-- #if __DEBUG__ -->
	<Debug/>
	<!-- #endif -->
</template>

<script setup>
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
	// min-height: 100vh;
	overflow: hidden;
}

.page {
	width: 100%;
	height: 100vh;
	position: relative;
}

p,
a {
	color: #000;
}

h1 {
	padding: 20px;
}
</style>
