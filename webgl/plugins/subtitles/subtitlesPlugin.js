import { ref } from 'vue';

const _SUBS_ = import.meta.glob('/assets/subtitles/**/*.json', { eager: true });

export function subtitlesPlugin(webgl, opts = {}) {
	const subtitles = {}; // Object of arrays, like so: { 'file': [{ start: 0, end: 1, part: 'text' }] }
	const tempSubtitles = []; // Array of objects, like so: [{ start: 0, end: 1, part: 'text' }]
	const currentPart = ref(null);

	const api = {
		subtitles,
		tempSubtitles,

		currentPart,

		getContentByTime,
		setCurrent,
		flush,

		preload,
	};

	/// #if __DEBUG__
	function devTools() {
		const $gui = webgl.$app.$gui;

		const gui = $gui.addFolder({ title: 'Subtitles' });
	}
	/// #endif

	function init() {
		attachSubtitlesToSounds();
	}

	function preload() {
		console.log('[Subtitles plugin] Prealod');

		try {
			return Promise.all(
				Object.entries(_SUBS_).map(async ([path, module]) => {
					const [id, extension] = path.split('/').pop().split('.');

					const response = await fetch(path);
					if (!response.ok) throw new Error(`Failed to load file at: ${url}`);
					const data = await response.json();

					setSubtitle({ id, data });
				}),
			);
		} catch (e) {
			console.error('Error while preloading subtitles', e);
		}
	}

	function setSubtitle({ id, data }) {
		api.subtitles[id] = data;
	}

	function getSubtitle({ id }) {
		return api.subtitles[id];
	}

	function setCurrent({ id }) {
		try {
			api.tempSubtitles = JSON.parse(JSON.stringify(subtitles[id]));
		} catch (e) {
			console.error('Error while updating current file', e);
		}
		console.log('[Subtitles plugin] setCurrent', api.tempSubtitles);
	}

	function attachSubtitlesToSounds() {
		const { sounds } = webgl.$assets;

		for (const file in subtitles) {
			if (sounds[file]) sounds[file].subtitles = subtitles[file];
		}
	}

	function getContentByTime({ id, time }) {
		// if (!api.tempSubtitles.length) {
		// 	api.currentPart.value = '';
		// }

		for (let i = 0; i < api.tempSubtitles.length; i++) {
			const subtitle = api.tempSubtitles[i];

			if (time >= subtitle.start && time <= subtitle.end) {
				api.currentPart.value = subtitle.part;
				api.tempSubtitles.splice(i, 1);
			}
		}
	}

	function flush() {
		console.log('[Subtitles plugin] FLUSH');
		api.currentPart.value = '';
	}

	return {
		install: (app) => {
			/// #if __DEBUG__
			console.log('[Subtitles plugin] Install');
			/// #endif
			webgl.$subtitles = api;
		},
		load: () => {
			/// #if __DEBUG__
			console.log('[Subtitles plugin] Load');
			/// #endif

			__DEBUG__ && devTools();

			const { $viewport, $hooks } = webgl;
			const { afterStart } = $hooks;

			afterStart.watchOnce(init);
		},
	};
}
