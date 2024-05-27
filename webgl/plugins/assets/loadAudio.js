import { cache } from '#utils/files/cache';

import { Audio, AudioLoader } from 'three';

const audioLoader = new AudioLoader();

export default function loadAudio(url, opts) {
	// console.log('Loading audio', opts);
	return new Promise((resolve, reject) => {
		const sound = new Audio( opts.audioListener );

		audioLoader.load(
			url,
			buffer => {
				sound.setBuffer( buffer );
				if (opts.onLoad) opts.onLoad(sound);
				resolve(sound)
			},
			() => {},
			reject
		);
	});
}

loadAudio.loader = {
	name: 'audio',
	extensions: [ '.mp3', '.ogg', '.wav' ],
	function: loadAudio
};
