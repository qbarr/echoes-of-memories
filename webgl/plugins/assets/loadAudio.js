import { cache } from '#utils/files/cache';
import { webgl } from '#webgl/core/index.js';

import { Audio, AudioLoader, PositionalAudio } from 'three';

const audioLoader = new AudioLoader();

export default function loadAudio(url, opts) {
	return new Promise((resolve, reject) => {
		const { onLoad, type = null } = opts;

		const listener = webgl.$audioListener;

		const sound =
			type == 'positional' ? new PositionalAudio(listener) : new Audio(listener);

		audioLoader.load(
			url,
			(buffer) => {
				sound.setBuffer(buffer);
				if (onLoad) onLoad(sound);
				resolve(sound);
			},
			() => {},
			reject,
		);
	});
}

loadAudio.loader = {
	name: 'audio',
	extensions: ['.mp3', '.ogg', '.wav'],
	function: loadAudio,
};
