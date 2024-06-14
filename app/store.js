import { app } from './core';
import { reactive } from 'vue';

export default () => {
	const store = reactive({
		isPaused: false,
	});

	// Some props can only be added once the app is fully started
	// You can use this function for that
	// app.$onBeforeMount(() => {});

	return store;
};
