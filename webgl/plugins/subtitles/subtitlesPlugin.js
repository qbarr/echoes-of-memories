import { w } from '#utils/state';

export function subtitlesPlugin(webgl, opts = {}) {
	const tempSubtitles = []; // Array of objects, like so: [{ start: 0, end: 1, part: 'text' }]
	const currentPart = w(null);

	const api = {
		tempSubtitles,
		currentPart,
		flush,
		setCurrent,
		getContentByTime,
	};

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
		const { audios, data } = webgl.$assets;
		for (const k in data) {
			if (!audios[k]) continue;
			const jsons = data[k];
			for (const kk in jsons) {
				if (!audios[k][kk]) continue;
				const s = jsons[kk];

				// capitalize all content
				// remove accents
				for (let i = 0; i < s.length; i++) {
					s[i].content = s[i].content
						.toUpperCase()
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, '');

					s[i].start = s[i].start ?? s[i - 1].end;
				}
				audios[k][kk].subtitles = s;
			}
		}
	}

	function getContentByTime({ time }) {
		for (let i = 0; i < api.tempSubtitles.length; i++) {
			const subtitle = api.tempSubtitles[i];
			if (time >= subtitle.start && time <= subtitle.end) {
				api.currentPart.set(subtitle.part);
				api.tempSubtitles.splice(i, 1);
			}
		}
	}

	function flush() {
		api.tempSubtitles = [];
		api.currentPart.set(null);
	}

	return {
		install: () => {
			webgl.$subtitles = api;
		},
		load: () => {
			webgl.$hooks.afterPreload.watchOnce(init);
		},
	};
}
