import { ref } from 'vue';

export function subtitlesPlugin(webgl, opts = {}) {
	const tempSubtitles = []; // Array of objects, like so: [{ start: 0, end: 1, part: 'text' }]
	const currentPart = ref(null);

	const api = {
		tempSubtitles,
		currentPart,
		flush,
		setCurrent,
		getContentByTime,
	};

	/// #if __DEBUG__
	function devTools() {
		const $gui = webgl.$app.$gui;
	}
	/// #endif

	function init() {
		attachSubtitlesToSounds();
	}

	function getSubtitle({ id }) {
		const { subtitles } = webgl.$assets.data;

		return subtitles[id];
	}

	function setCurrent({ id }) {
		const { subtitles } = webgl.$assets.data;

		try {
			api.tempSubtitles = JSON.parse(JSON.stringify(subtitles[id]));
		} catch (e) {
			console.error('Error while updating current file', e);
		}
		console.log('[Subtitles plugin] setCurrent');
	}

	function attachSubtitlesToSounds() {
		const { sounds } = webgl.$assets;
		const { subtitles } = webgl.$assets.data;

		for (const file in subtitles) {
			if (sounds[file]) sounds[file].subtitles = subtitles[file];
		}
	}

	function getContentByTime({ id, time }) {
		for (let i = 0; i < api.tempSubtitles.length; i++) {
			const subtitle = api.tempSubtitles[i];
			if (time >= subtitle.start && time <= subtitle.end) {
				api.currentPart.value = subtitle.part;
				api.tempSubtitles.splice(i, 1);
			}
		}
	}

	function flush() {
		api.tempSubtitles = [];
		api.currentPart.value = '';
	}

	return {
		install: () => {
			webgl.$subtitles = api;
		},
		load: () => {
			__DEBUG__ && devTools();

			const { afterStart } = webgl.$hooks;
			afterStart.watchOnce(init);
		},
	};
}
