import { raf } from '#utils/raf/raf.js';
import { w } from '#utils/state';
import { AudioListener } from 'three';

export function audioPlugin(webgl, opts = {}) {
	const listener = new AudioListener();
	const current = w(null);

	const api = {
		get current() {
			return current.get();
		},
		force_pause: false,

		visible: true,
		currentId: null,
		masterVolume: w(1),

		progress: 0,
		startAt: 0,
		pausedAt: 0,
		totalElapsed: 0,
		duration: 0,

		listener,

		play,
		pause,
		stop,
		playMany,
		pauseMany,
		stopMany,
		setSoundVolume,
		mute,
		unmute,
		setMasterVolume,
		getMasterVolume,
		setCurrent,

		getSound,
	};

	/// #if __DEBUG__
	function devTools() {
		const $gui = webgl.$app.$gui;
		// const gui = webgl.$gui.addFolder({ title: '🔊 Audio' });
		api.gui = webgl.$gui.addFolder({ title: '🔊 Audio', index: 6 });
		const { audios } = webgl.$assets;

		// current.value = Object.values(audios)[0];
		// api.currentId = Object.keys(audios)[0];
		// api.gui
		// 	.addBinding(api, 'masterVolume', {
		// 		label: 'Master Volume',
		// 		min: 0,
		// 		max: 1,
		// 	})
		// 	.on('change', () => listener.setMasterVolume(api.masterVolume));
		// let CELLS_PER_ROW = 2;
		// const cells = [
		// 	{ title: 'Mute', action: mute },
		// 	{ title: 'Unmu te', action: unmute },
		// 	{
		// 		title: 'Play',
		// 		action: () => {
		// 			api.force_pause = false;
		// 			play({ id: api.currentId });
		// 		},
		// 	},
		// 	{
		// 		title: 'Pause',
		// 		action: () => {
		// 			api.force_pause = true;
		// 			pause({ id: api.currentId });
		// 		},
		// 	},
		// ];
		// const rows = Math.ceil(cells.length / CELLS_PER_ROW);
		// CELLS_PER_ROW = Math.min(CELLS_PER_ROW, cells.length);

		// // api.gui
		// // 	.addBlade({
		// // 		view: 'list',
		// // 		label: 'Sounds',
		// // 		options: Object.entries(audios).map(([id, sound]) => ({
		// // 			text: id,
		// // 			value: id,
		// // 		})),
		// // 		value: api.currentId,
		// // 	})
		// // 	.on('change', ({ value }) => {
		// // 		setCurrent({ id: value, audio: audios[value] });
		// // 	});
		// api.gui.addMonitor(api, 'currentId', { label: 'Current Sound' });
		// api.gui
		// 	.addBlade({
		// 		view: 'buttongrid',
		// 		size: [CELLS_PER_ROW, rows],
		// 		cells: (x, y) => cells[y * CELLS_PER_ROW + x],
		// 		label: 'Actions',
		// 	})
		// 	.on('click', ({ index }) => {
		// 		const { action } = cells[index[1] * CELLS_PER_ROW + index[0]];
		// 		action();
		// 	});

		// api.progress_debug = api.gui.addBinding(api, 'progress', {
		// 	label: 'Audio progress',
		// 	view: 'slider',
		// 	readonly: true,
		// 	value: api.progress,
		// });

		// api.timeline_debug = api.gui
		// 	.addBinding(api, 'progress', {
		// 		label: 'Timeline',
		// 		view: 'slider',
		// 		value: api.progress,
		// 		min: 0,
		// 		max: current.value.audio.buffer.duration * 1000,
		// 	})
		// 	.on('change', (tl) => {
		// 		changeTimelineDebug(tl.value);
		// 	});
	}
	/// #endif

	function init() {
		__DEBUG__ && devTools();

		const scene = webgl.$getCurrentScene();
		const camera = scene.getCurrentCamera().base;

		scene.$hooks.onCameraChange.watch((camera) => {
			listener?.parent?.remove(listener);
			camera.cam.add(listener);
		});

		camera.add(listener);
		raf.add(update);
	}

	function updateDebugPogressValue() {
		api.progress = 0;
		// api.progress_debug.max = current.value.audio.buffer.duration * 1000;
		// api.progress_debug.value = api.progress;
		// api.timeline_debug.max = current.value.audio.buffer.duration * 1000;
		// api.timeline_debug.value = api.progress;
	}

	function changeTimelineDebug(value) {
		if (current.value.audio.isPlaying) {
			pause({ id: api.currentId });
		}

		const time = Math.floor(value);
		current.value.audio.offset = time;
		api.progress = time;
	}

	function setCurrent({ id, audio }) {
		if (current.value?.audio?.isPlaying) {
			stop({ id: api.currentId });
		}

		if (current.value?.subtitles) {
			webgl.$subtitles.flush();
		}

		api.currentId = id;
		current.set(audio);
		api.progress = 0;

		// updateDebugPogressValue();

		return current.value;
	}

	function getAssetAudio(_id) {
		const id = _id.split('/').pop();
		let subID = _id.split('/').shift();
		if (subID === id) subID = null;

		const { audios } = webgl.$assets;
		const audio = subID ? audios[subID][id] : audios[id];

		return audio;
	}

	function play({ id }) {
		const { $assets, $subtitles } = webgl;
		const { audios } = $assets;

		const audio = getAssetAudio(id);

		setCurrent({ id, audio: audio });

		try {
			api.startedAt = performance.now();
			audio.audio.play();

			if (audio.subtitles && !$subtitles.tempSubtitles.length) {
				$subtitles.setCurrent({ id });
			}
		} catch (e) {
			console.error('Error playing sound', id, e);
		}
	}

	function pause({ id }) {
		try {
			const { audio } = getAssetAudio(id);
			audio.pause();
			api.pausedAt = performance.now();
			api.totalElapsed += api.pausedAt - api.startedAt;
		} catch (e) {
			console.error('Error stopping sound', id, e);
		}
	}

	function stop({ id }) {
		try {
			const { audio } = getAssetAudio(id);
			audio.stop();
		} catch (e) {
			console.error('Error stopping sound', id, e);
		}
	}

	function playMany({ ids = [] }) {
		try {
			ids.forEach((id) => play({ id }));
		} catch (e) {
			console.error('Error playing audios', ids, e);
		}
	}

	function pauseMany({ ids = [] }) {
		try {
			ids.forEach((id) => pause({ id }));
		} catch (e) {
			console.error('Error stopping audios', ids, e);
		}
	}

	function stopMany({ ids = [] }) {
		try {
			ids.forEach((id) => stop({ id }));
		} catch (e) {
			console.error('Error stopping audios', ids, e);
		}
	}

	function setSoundVolume({ id, volume }) {
		try {
			const { audio } = getAssetAudio(id);
			audio.setVolume(volume);
		} catch (e) {
			console.error('Error setting sound volume', id, e);
		}
	}

	function mute() {
		const v = getMasterVolume();
		listener.setMasterVolume(v ? v : 0);
	}

	function unmute() {
		const v = getMasterVolume();
		listener.setMasterVolume(v ? v : 1);
	}

	function getMasterVolume() {
		return api.masterVolume.value;
	}

	function setMasterVolume(volume) {
		console.log(api.masterVolume);
		api.masterVolume.set(volume);
		listener.setMasterVolume(volume);
	}

	function getSound({ id }) {
		try {
			return webgl.$assets.audios[id].audio;
		} catch (e) {
			console.error(`Error getting ${id} sound`, e);
		}
	}

	function onCameraChange(camera) {
		listener.parent && listener.parent.remove(listener);
		camera.cam.add(listener);
	}

	function isViewportVisible(visible) {
		api.visible = visible;

		if (visible) {
			unmute();
			if (current.value && api.progress > 0 && !api.force_pause) {
				play({ id: api.currentId });
			}
		} else {
			mute();
			if (current.value && api.progress > 0) {
				pause({ id: api.currentId });
			}
		}
	}

	function reset() {
		api.progress = 0;
		api.startedAt = 0;
		api.pausedAt = 0;
		api.totalElapsed = 0;
		api.duration = 0;
	}

	function update() {
		if (!api.visible) return;

		const { current } = api;
		if (!current) return;

		const currentTime = current.audio.context.currentTime;
		const startedAt = current.audio._startedAt;
		const duration = (Math.floor(current.audio.buffer.duration * 100) / 100) * 1000;

		if (current.audio.isPlaying) {
			const startedAt = current.audio._startedAt;
			api.duration = (Math.floor(current.audio.buffer.duration * 100) / 100) * 1000;

			const currentTime = performance.now() - api.startedAt;
			const progress = api.totalElapsed + currentTime;

			api.progress = Math.ceil(progress);
			// api.progress_debug.value = api.progress;

			if (current.subtitles) {
				webgl.$subtitles.getContentByTime({
					id: current.value,
					time: api.progress,
				});
			}
		}

		if (api.progress > 0 && api.progress >= api.duration) {
			reset();
			stop({ id: api.currentId });

			webgl.$subtitles.flush();
		}
	}

	return {
		install: () => {
			webgl.$audio = api;
			webgl.$audioListener = listener;
		},
		load: () => {
			const { $viewport, $hooks } = webgl;
			const { afterSetup, afterStart } = $hooks;

			afterSetup.watch(() => {
				$viewport && $viewport.visible.watch(isViewportVisible);
			});
			afterStart.watchOnce(init);
		},
	};
}
