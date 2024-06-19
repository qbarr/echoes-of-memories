import { Color } from 'three';
import { app } from './core';
import { reactive } from 'vue';

export default () => {
	const store = reactive({
		isPaused: true,
		// isPaused: false,
		pointerLocked: false,

		subtitles: {
			colors: {
				white: new Color(0xffffff),
				yellow: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
			},
		},
	});

	// Some props can only be added once the app is fully started
	// You can use this function for that
	// app.$onBeforeMount(() => {});

	return store;
};
