<template>
	<component :is="tag">{{ text }}</component>
</template>

<script setup>
	defineProps({
		text: { type: String, default: 'GLText' },
		tag: { type: String, default: 'p' }
	})


</script>

<style lang='scss' scoped>
</style>
