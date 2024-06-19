import { raf } from '#utils/raf';
import { storageSync, w } from '#utils/state';
import { AudioListener } from 'three';
import { BgmAudio } from './BgmAudio';
import { SfxAudio } from './SfxAudio';
import { BaseAudio } from './BaseAudio';

export function audioPlugin(webgl, opts = {}) {
	const listener = new AudioListener();

	console.log(webgl.$app.$storage);
	const { $storage } = webgl.$app;
	const volume = w($storage.getItem('volume') ?? 0.2);
	console.log('AUDIO PLUGIN INIT', volume.value);
	volume.watchImmediate((v) => {
		listener.setMasterVolume(v);
		$storage.setItem('volume', v);
	});

	const isMuted = w(false);
	isMuted.watchImmediate((v) => (v ? mute() : unmute()));

	const activeSamples = new Map(); // audios that are currently playing

	const sfxs = {};
	const bgms = {};
	const singles = {};
	const all = { sfxs, bgms, singles };

	const api = {
		get current() {
			return current.get();
		},
		force_pause: false,

		visible: true,
		currentId: null,

		volume,
		setVolume,

		progress: 0,
		startAt: 0,
		pausedAt: 0,
		totalElapsed: 0,
		duration: 0,

		listener,
		isMuted,

		actives: activeSamples,

		get sfxs() { return sfxs }, // prettier-ignore
		get bgms() { return bgms }, // prettier-ignore
		get singles() { return singles }, // prettier-ignore
		get all() { return all }, // prettier-ignore

		play,
		pause,
		stop,
		mute,
		unmute,
	};

	function init() {
		// const scene = webgl.$getCurrentScene();
		// const camera = scene.getCurrentCamera().base;

		// scene.$hooks.onCameraChange.watch((camera) => {
		// 	listener?.parent?.remove(listener);
		// 	camera.cam.add(listener);
		// });

		// camera.add(listener);
		// raf.add(update);

		const { audios } = webgl.$assets;

		const _sfxs = {};
		const _bgms = {};
		const _singles = {};

		for (const k in audios) {
			const parent = audios[k];

			for (const kk in parent) {
				const a = parent[kk];
				const { audio, type } = a;

				const parseId = kk.split('_')[0];

				if (type === 'bgm') {
					if (!_bgms[k]) _bgms[k] = [];
					_bgms[k].push({ audio, id: `${k}/${kk}`, parent: k, _id: kk });
				} else if (type === 'sfx') {
					if (!_sfxs[parseId]) _sfxs[parseId] = [];
					_sfxs[parseId].push({ audio, id: `${k}/${kk}`, parent: k, _id: kk });
				} else {
					_singles[parseId] = { audio, id: `${k}/${kk}`, parent: k, _id: kk };
				}
			}
		}

		for (const key in _sfxs) {
			const v = _sfxs[key];
			const id = v[0].id.split('_')[0];
			sfxs[id] = new SfxAudio(
				v.id,
				v.map((v) => v.audio),
			);
		}

		for (const key in _bgms) {
			const v = _bgms[key];
			const id = v[0].id.split('_')[0];
			bgms[id] = new BgmAudio(
				id,
				v.map((v) => v.audio),
			);
		}

		for (const key in _singles) {
			const v = _singles[key];
			singles[v.id] = new BaseAudio(v.id, v.audio);
		}

		__DEBUG__ && devtools();
	}

	function get(id) {
		const audio = sfxs[id] || bgms[id] || singles[id];
		if (!audio) {
			console.warn(`Audio with id ${id} not found`);
			return;
		}
		return audio;
	}

	function play(id, opts = {}) {
		const audio = get(id);
		if (!audio) return;
		audio.play(opts);
		return audio;
	}

	function pause(fromVisibility = false) {
		const cb = fromVisibility ? 'pauseFromVisibility' : 'pause';
		activeSamples.forEach((sample) => sample[cb]());
	}
	function pauseSound(id) {
		const sample = activeSamples.get(id);
		if (!sample) return;
		sample.pause();
	}

	function resume(fromVisibility = false) {
		const cb = fromVisibility ? 'resumeFromVisibility' : 'resume';
		activeSamples.forEach((sample) => sample[cb]());
	}
	function resumeSound(id) {
		const sample = activeSamples.get(id);
		if (!sample) return;
		!sample.forcePause && sample.resume();
	}

	function stop() {
		activeSamples.forEach((sample) => sample.stop());
	}
	function stopSound(id) {
		const sample = activeSamples.get(id);
		if (!sample) return;
		sample.stop();
	}

	function mute() {
		listener.setMasterVolume(0);
	}

	function unmute() {
		listener.setMasterVolume(volume.value);
	}

	function setVolume(_volume) {
		volume.set(_volume);
		listener.setMasterVolume(volume.value);
	}

	// function onCameraChange(camera) {
	// 	listener.parent && listener.parent.remove(listener);
	// 	camera.cam.add(listener);
	// }

	function checkViewportVisible(visible) {
		if (visible && !isMuted.value) resume(true);
		else pause(true);
	}

	function reset() {}

	function update() {
		// if (!api.visible) return;
		// const { current } = api;
		// if (!current) return;
		// const currentTime = current.audio.context.currentTime;
		// const startedAt = current.audio._startedAt;
		// const duration = (Math.floor(current.audio.buffer.duration * 100) / 100) * 1000;
		// if (current.audio.isPlaying) {
		// 	const startedAt = current.audio._startedAt;
		// 	api.duration = (Math.floor(current.audio.buffer.duration * 100) / 100) * 1000;
		// 	const currentTime = performance.now() - api.startedAt;
		// 	const progress = api.totalElapsed + currentTime;
		// 	api.progress = Math.ceil(progress);
		// 	// api.progress_debug.value = api.progress;
		// 	if (current.subtitles) {
		// 		webgl.$subtitles.getContentByTime({
		// 			id: current.value,
		// 			time: api.progress,
		// 		});
		// 	}
		// }
		// if (api.progress > 0 && api.progress >= api.duration) {
		// 	reset();
		// 	stop({ id: api.currentId });
		// 	webgl.$subtitles.flush();
		// }
	}

	/// #if __DEBUG__
	function devtools() {
		const gui = webgl.$app.$gui.addFolder({ title: '🔊 Audio', index: 6 });

		gui.addBinding(volume, 'value', { label: 'Volume', min: 0, max: 1, step: 0.01 });
		gui.addBinding(isMuted, 'value', { label: 'Mute' });

		gui.addSeparator();

		gui.addGrid(3, [
			['Pause', pause],
			['Resume', resume],
			['Stop', stop],
		]);

		gui.addSeparator();

		const sfxGui = gui.addFolder({ title: 'SFX' });
		const _sfxs = Object.keys(sfxs);

		sfxGui.addGrid(
			2,
			_sfxs.map((id) => [id, () => play(id)]),
		);

		const bgmGui = gui.addFolder({ title: 'BGM' });
		const _bgms = Object.keys(bgms);

		_bgms.forEach((bgm) => {
			const audio = bgms[bgm];
			const folder = bgmGui.addFolder({ title: bgm });

			folder.addBinding(audio.volume, 'value', {
				label: 'Volume',
				min: 0,
				max: 1,
				step: 0.01,
			});
			for (let i = 0; i < audio.layers.length; i++) {
				const volume = audio.layersVolume[i];
				const v = { volume };
				folder
					.addBinding(v, 'volume', {
						label: `Layer ${i + 1}`,
						min: 0,
						max: 1,
						step: 0.01,
					})
					.on('change', () => audio.mix(i, v.volume));
			}
			folder.addGrid(2, [
				['Play', () => audio.play()],
				['Pause', () => audio.pause()],
				// ['Resume', () => audio.resume()],
			]);
		});

		const singleGui = gui.addFolder({ title: 'Single' });
		const _singles = Object.keys(singles);

		singleGui.addGrid(
			2,
			_singles.map((id) => [id, () => play(id)]),
		);
	}
	/// #endif

	return {
		install: () => {
			webgl.$audio = api;
			webgl.$audioListener = listener;
		},
		load: () => {
			const { $viewport, $hooks } = webgl;
			const { afterSetup, afterStart } = $hooks;

			afterSetup.watch(() => {
				$viewport && $viewport.visible.watch(checkViewportVisible);
			});
			afterStart.watchOnce(init);
		},
	};
}
