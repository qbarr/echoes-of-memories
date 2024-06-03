import { AudioListener } from 'three';

import { raf } from '#utils/raf/raf.js';

const _AUDIOS_ = import.meta.glob('/assets/audios/**/*.*', { eager: true });

const audioListener = new AudioListener();

export function audioPlugin(webgl, opts = {}) {
	let NEED_UPDATE = false;

	const api = {
		audioListener,

		current: null,
		currentId: null,
		masterVolume: 1,

		progress: 0,
		startAt: 0,
		pausedAt: 0,
		totalElapsed: 0,

		play,
		pause,
		playMany,
		pauseMany,
		setSoundVolume,
		mute,
		unmute,
		setMasterVolume,
		getMasterVolume,
		setCurrent,

		preload,
		getSound,
	};

	/// #if __DEBUG__
	function devTools() {
		const $gui = webgl.$app.$gui;
		// const gui = webgl.$gui.addFolder({ title: '🔊 Audio' });
		api.gui = webgl.$gui.addFolder({ title: '🔊 Audio' });
		const { sounds } = webgl.$assets;

		api.current = Object.values(sounds)[0];
		api.currentId = Object.keys(sounds)[0];
		api.gui
			.addBinding(api, 'masterVolume', {
				label: 'Master Volume',
				min: 0,
				max: 1,
			})
			.on('change', () => audioListener.setMasterVolume(api.masterVolume));
		let CELLS_PER_ROW = 2;
		const cells = [
			{
				title: 'Mute',
				action: mute,
			},
			{
				title: 'Unmute',
				action: unmute,
			},
			{
				title: 'Play',
				action: () => play({ id: api.currentId }),
			},
			{
				title: 'Pause',
				action: () => pause({ id: api.currentId }),
			},
		];
		const rows = Math.ceil(cells.length / CELLS_PER_ROW);
		CELLS_PER_ROW = Math.min(CELLS_PER_ROW, cells.length);

		api.gui
			.addBlade({
				view: 'list',
				label: 'Sounds',
				options: Object.entries(sounds).map(([id, sound]) => ({
					text: id,
					value: id,
				})),
				value: api.currentId,
			})
			.on('change', ({ value }) => {
				setCurrent({ id: value, audio: sounds[value] });
			});
		api.gui.addBinding(api, 'currentId', {
			label: 'Current Sound',
			readonly: true,
		});
		api.gui
			.addBlade({
				view: 'buttongrid',
				size: [CELLS_PER_ROW, rows],
				cells: (x, y) => cells[y * CELLS_PER_ROW + x],
				label: 'Actions',
			})
			.on('click', ({ index }) => {
				const { action } = cells[index[1] * CELLS_PER_ROW + index[0]];
				action();
			});

		api.progress_debug = api.gui.addBinding(api, 'progress', {
			label: 'Audio progress',
			view: 'slider',
			readonly: true,
			value: api.progress,
		});

		// api.timeline_debug = api.gui
		// 	.addBinding(api, 'progress', {
		// 		label: 'Timeline',
		// 		view: 'slider',
		// 		value: api.progress,
		// 		min: 0,
		// 		max: api.current.audio.buffer.duration * 1000,
		// 	})
		// 	.on('change', (tl) => {
		// 		changeTimelineDebug(tl.value);
		// 	});
	}
	/// #endif

	function init() {
		console.log('[Audio plugin] init', webgl);

		__DEBUG__ && devTools();

		const scene = webgl.$getCurrentScene();
		const camera = scene.getCurrentCamera().base;

		scene.$hooks.onCameraChange.watch((camera) => {
			audioListener.parent && audioListener.parent.remove(audioListener);
			camera.base.add(audioListener);
		});

		camera.add(audioListener);
		raf.add(update);
	}

	function updateDebugPogressValue() {
		api.progress = 0;
		api.progress_debug.max = api.current.audio.buffer.duration * 1000;
		api.progress_debug.value = api.progress;
		// api.timeline_debug.max = api.current.audio.buffer.duration * 1000;
		// api.timeline_debug.value = api.progress;
	}

	function changeTimelineDebug(value) {
		if (api.current.audio.isPlaying) {
			pause({ id: api.currentId });
		}

		const time = Math.floor(value);
		api.current.audio.offset = time;
		api.progress = time;
	}

	function setCurrent({ id, audio }) {
		if (api.current.audio.isPlaying) {
			stop({ id: api.currentId });
		}

		console.log('setCurrent', api.current);

		if (api.current.subtitles) {
			webgl.$subtitles.flush();
		}

		api.currentId = id;
		api.current = audio;
		api.progress = 0;

		updateDebugPogressValue();

		return api.current;
	}

	function play({ id }) {
		const { $assets, $subtitles } = webgl;
		const { sounds } = $assets;

		setCurrent({ id, audio: sounds[id] });

		try {
			api.startedAt = performance.now();
			sounds[id].audio.play();

			if (sounds[id].subtitles && !$subtitles.tempSubtitles.length) {
				$subtitles.setCurrent({ id });
			}
		} catch (e) {
			console.error('Error playing sound', id, e);
		}
	}

	function pause({ id }) {
		try {
			webgl.$assets.sounds[id].audio.pause();
			api.pausedAt = performance.now();
			api.totalElapsed += api.pausedAt - api.startedAt;
		} catch (e) {
			console.error('Error stopping sound', id, e);
		}
	}

	function stop({ id }) {
		try {
			webgl.$assets.sounds[id].audio.stop();
		} catch (e) {
			console.error('Error stopping sound', id, e);
		}
	}

	function playMany({ ids = [] }) {
		try {
			const s = [];
			for (let i = 0; i < ids.length; i++) {
				if (!webgl.$assets.sounds[ids[i]].subtitles) {
					s.push(webgl.$assets.sounds[ids[i]]);
				}
			}
			s.forEach((id) => play({ id }));
		} catch (e) {
			console.error('Error playing sounds', ids, e);
		}
	}

	function pauseMany({ ids = [] }) {
		try {
			ids.forEach((id) => pause({ id }));
		} catch (e) {
			console.error('Error stopping sounds', ids, e);
		}
	}

	function setSoundVolume({ id, volume }) {
		try {
			webgl.$assets.sounds[id].audio.setVolume(volume);
		} catch (e) {
			console.error('Error setting sound volume', id, e);
		}
	}

	function mute() {
		audioListener.setMasterVolume(0);
		getMasterVolume();
	}

	function unmute() {
		audioListener.setMasterVolume(1);
		getMasterVolume();
	}

	function getMasterVolume() {
		return api.masterVolume;
	}

	function setMasterVolume(volume) {
		api.masterVolume = volume;
		audioListener.setMasterVolume(volume);
	}

	function preload() {
		const { load } = webgl.$assets;

		return Promise.all(
			Object.entries(_AUDIOS_).map(async ([path, module]) => {
				const [file, extension] = path.split('/').pop().split('.');
				const directory = path.split('/').slice(0, -1).pop();

				return await load(file, {
					type: 'audio',
					directory,
					audioListener,
				});
			}),
		);
	}

	function getSound({ id }) {
		try {
			return webgl.$assets.sounds[id].audio;
		} catch (e) {
			console.error(`Error getting ${id} sound`, e);
		}
	}

	function onCameraChange(camera) {
		audioListener.parent && audioListener.parent.remove(audioListener);
		camera.base.add(audioListener);
	}

	function isViewportVisible(visible) {
		if (visible) unmute();
		else mute();
	}

	function update() {
		const { current } = api;

		if (!current) return;

		const currentTime = current.audio.context.currentTime;
		const startedAt = current.audio._startedAt;
		const duration = (Math.floor(current.audio.buffer.duration * 100) / 100) * 1000;

		if (current.audio.isPlaying) {
			const currentTime = performance.now() - api.startedAt;
			const progress = api.totalElapsed + currentTime;

			api.progress = Math.ceil(progress);
			api.progress_debug.value = api.progress;
		}

		if (current.subtitles) {
			webgl.$subtitles.getContentByTime({
				id: api.current,
				time: api.progress,
			});
		}

		if (api.progress >= duration) {
			api.progress = 0;
			stop({ id: api.currentId });
			webgl.$subtitles.flush();
		}
	}

	return {
		install: () => {
			/// #if __DEBUG__
			console.log('[Audio plugin] Install');
			/// #endif
			webgl.$sounds = api;
		},
		load: () => {
			/// #if __DEBUG__
			console.log('[Audio plugin] Load');
			/// #endif
			const { $viewport, $hooks } = webgl;
			const { afterSetup, afterStart } = $hooks;

			afterSetup.watch(() => {
				$viewport && $viewport.visible.watch(isViewportVisible);
			});
			afterStart.watchOnce(init);
		},
	};
}
