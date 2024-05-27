import { cache } from '#utils/files/cache';

import { Audio, AudioLoader, PositionalAudio } from 'three';

const audioLoader = new AudioLoader();

export default function loadAudio(url, opts) {
	return new Promise((resolve, reject) => {
		const sound =
			opts.directory == 'positional'
				? new PositionalAudio(opts.audioListener)
				: new Audio(opts.audioListener);

		audioLoader.load(
			url,
			(buffer) => {
				sound.setBuffer(buffer);
				if (opts.onLoad) opts.onLoad(sound);
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
