<template>
	<component :is="tag" ref="$$text" class="gl-text">{{ text }}</component>
</template>

<script setup>
	import { MSDFTextMesh } from '#webgl/components/Text';
	import { shallowRef } from 'vue';
	import { useSyncDomWebGL } from './useSyncDomToWebgl';

	const { text } = defineProps({
		text: { type: String, default: 'GLText' },
		tag: { type: String, default: 'p' }
	})

	const $$text = shallowRef(null);

	const mesh = new MSDFTextMesh({
		content: text,
		font: 'VCR_OSD_MONO',
	})

	useSyncDomWebGL($$text, mesh)
</script>

<style lang='scss' scoped>
	.gl-text {
		color: red;
		opacity: 0.2;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		// left: 100px;
		// top: 100px;
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		outline: 1px solid red;
	}
</style>
