import { w } from '#utils/state';

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

export function subtitlesPlugin(webgl, opts = {}) {
	const tempSubtitles = []; // Array of objects, like so: [{ start: 0, end: 1, part: 'text' }]
	const currentPart = w(null);

	const api = {
		tempSubtitles,
		currentPart,
		flush,
		getContentByTime,
	};

	function init() {
		attachSubtitlesToSounds();
	}

	function addDatasToSubtitles(subtitles) {
		subtitles = deepCopy(subtitles);
		// let current = null;
		// let subtitlesRange = [subtitles[0].start, subtitles[subtitles.length - 1].end];

		// capitalize all content
		// remove accents
		// set start time to the last end time if not set
		// for (let i = 0; i < subtitles.length; i++) {
		// const prev = subtitles[i - 1] ?? { end: 0 };
		// const current = subtitles[i];
		// subtitles[i] = subtitles[i]
		// 	.toUpperCase()
		// 	.normalize('NFD')
		// 	.replace(/[\u0300-\u036f]/g, '');

		// current.start = current.start ?? prev.end;
		// }

		// const contents = subtitles.map((s) => s.content);

		// const s = {
		// 	get contents() {
		// 		return subtitles;
		// 	},
		// 	get onlyContents() {
		// 		return contents;
		// 	},
		// 	datas: {
		// 		get current() {
		// 			return current;
		// 		},
		// 		subtitlesRange,
		// 	},
		// };

		// Object.defineProperty(s, 'onChange', {
		// 	value: () => {},
		// 	writable: true,
		// 	enumerable: false,
		// });

		// const updateBySheetProgress = ({ time }) => {
		// 	if (
		// 		(subtitlesRange[0] > time || subtitlesRange[1] < time) &&
		// 		current !== null
		// 	) {
		// 		current = null;
		// 		s.onChange(null);
		// 		return;
		// 	}

		// 	for (let i = 0; i < subtitles.length; i++) {
		// 		const subtitle = subtitles[i];
		// 		if (current?.end >= time) continue;

		// 		if (current?.end < time && time < subtitle.start) {
		// 			current = null;
		// 			s.onChange(null);
		// 		}

		// 		if (current === subtitle) continue;
		// 		if (time >= subtitle.start && time <= subtitle.end) {
		// 			current = subtitle;
		// 			s.onChange(subtitle);
		// 		}
		// 	}
		// };

		// Object.defineProperty(s, 'updateBySheetProgress', {
		// 	value: updateBySheetProgress,
		// 	writable: false,
		// 	enumerable: false,
		// });

		return { content: subtitles };
	}

	function attachSubtitlesToSounds() {
		const { audios, data } = webgl.$assets;
		for (const k in data) {
			if (!audios[k]) continue;
			const jsons = data[k];
			for (const kk in jsons) {
				if (!audios[k][kk]) continue;
				const s = addDatasToSubtitles(jsons[kk]);
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
