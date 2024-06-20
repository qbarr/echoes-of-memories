<template>
	<div class="letter-wrapper">
		<p ref="$$text">
			<span
				v-for="(t, i) in contents"
				:key="t + i"
				:class="{ 'is-revealed': i < index }"
				v-html="t"
			/>
		</p>
	</div>
</template>

<script setup>
import { shallowRef, onBeforeUnmount, onMounted } from 'vue';
import { app } from '#app/core';
import useSplitText from '#app/composables/useSplitText/useSplitText.js';

const { $webgl, $store } = app;

const index = shallowRef(0);
console.log($store.letterContent);
const contents = $store.letterContent.map((str) => (str += '<br>'));

const updateIndex = (value) => (index.value = Math.floor(value));
onMounted(() => {
	$webgl.$letterTextIndex.watchImmediate(updateIndex);
});
onBeforeUnmount(() => {
	$webgl.$letterTextIndex.unwatch(updateIndex);
});
</script>

<style lang="scss" scoped>
.letter-wrapper {
	position: relative;
	z-index: 1000;
	width: 100vw;
	height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
}

p {
	display: flex;
	flex-direction: column;
	align-items: left;
	flex-wrap: wrap;
	width: 50%;
	position: relative;
	font-size: 1rem;
	font-weight: 700;
	color: #fff;
	text-align: left;
	font-family: VCR;

	span {
		opacity: 0;
		transition: opacity 0.5s ease-in-out;

		&.is-revealed {
			opacity: 1;
		}
	}
}
</style>
