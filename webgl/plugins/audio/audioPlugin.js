import { AudioListener } from 'three';

const _AUDIOS_ = import.meta.glob('/assets/audios/**/*.*', { eager: true });

const audioListener = new AudioListener();

export function audioPlugin(webgl, opts = {}) {
	const api = {
		sounds: {},

		play,
		stop,
		playMany,
		stopMany,
		setSoundVolume,
		mute,
		unmute,
		getMasterVolume,

		preload
	};

	function init() {
		console.log('Audio plugin init', audioListener.getMasterVolume());

		const { $assets } = webgl;
		api.sounds = $assets.sounds;
	};

	function play({ id }) {
		try {
			api.sounds[id].play();
		} catch (e) {
			console.error('Error playing sound', id, e);
		}
	}

	function stop({ id }) {
		try {
			api.sounds[id].stop();
		} catch (e) {
			console.error('Error stopping sound', id, e);
		}
	}

	function playMany({ ids = []}) {
		try {
			ids.forEach(play);
		} catch (e) {
			console.error('Error playing sounds', ids, e);
		}
	}

	function stopMany({ ids = []}) {
		try {
			ids.forEach(stop);
		} catch (e) {
			console.error('Error stopping sounds', ids, e);
		}
	}

	function setSoundVolume({ id, volume }) {
		try {
			api.sounds[id].setVolume(volume);
		} catch (e) {
			console.error('Error setting sound volume', id, e);
		}
	}

	function mute() {
		audioListener.setMasterVolume(0);
	}

	function unmute() {
		audioListener.setMasterVolume(1);
	}

	function getMasterVolume() {
		return audioListener.getMasterVolume();
	}

	function preload() {
		const { load } = webgl.$assets;

		return Promise.all(
			Object.entries(_AUDIOS_).map(async ([key, url]) => {
				const [file, extension] = key.split('/').pop().split('.');

				return await load(file, {
					type: 'audio',
					audioListener
				});
			})
		);
	};

	return {
		install: (webgl) => {
			/// #if __DEBUG__
			console.log("[Audio plugin] Install");
			/// #endif
			webgl.$sounds = api;
		},
		load: async (webgl) => {
			/// #if __DEBUG__
			console.log("[Audio plugin] Load");
			/// #endif
			webgl.$hooks.afterStart.watchOnce(init)
		},
	};
}
