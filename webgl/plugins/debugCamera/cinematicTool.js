import { Quaternion, Vector3 } from 'three';

import { mod } from '#utils/maths';
import { s, w } from '#utils/state';
import { bezier, easings } from '#utils/anim';

export default function cinematicTool(webgl, debugApi) {
	const api = (webgl.$cinematicTool = {
		init,
		'Cinematic mode': false,
		enabled: w(),
		playing: w(false),
		setFrom: s(),
		setTo: s(),
		duration: w(5000),
		ease: w(),
		progress: w(0),
		easing: 'linear',
		initGui,
		update,
		fakeProgress: 0,

		from: {
			position: new Vector3(),
			rotation: new Quaternion(),
		},

		to: {
			position: new Vector3(),
			rotation: new Quaternion(),
		},
		current: {
			position: new Vector3(),
			rotation: new Quaternion(),
		},
	});

	let ease = bezier('linear');
	let playing = api.playing;
	let copiedTimeout, gui, cam, isInit, progressTween;

	function init() {
		api.setTo.watch(onSetTo);
		api.setFrom.watch(onSetFrom);
		webgl.$hooks.beforeRender.watch(() => {
			update();
		});
	}

	function initGui(gui) {
		const folder = gui.addFolder({ title: '  ↳ Cinematic Camera', expanded: false });

		let enabled = (gui.enabled = folder.addBinding(api, 'Cinematic mode', {
			index: 5,
		}));
		enabled.on('change', (v) => {
			if (!v.value) {
				togglePlay(false);
			}

			api.enabled.set(v.value);
		});

		let btn = (gui.setFromButton = folder.addButton({
			title: `Set from `,
			index: 6,
		}));
		btn.on('click', (v) => {
			api.setFrom.emit(v);
		});

		let btn2 = (gui.setToButton = folder.addButton({ title: `Set to`, index: 7 }));
		btn2.on('click', (v) => {
			api.setTo.emit(v);
		});

		let play = (gui.play = folder.addButton({ title: `‣ Play` }));
		play.on('click', (v) => {
			togglePlay();
		});

		let progress = (gui.progress = folder.addBinding(api, 'progress', {
			min: 0,
			max: 1,
		}));

		progress.on('change', (v) => {
			// api.progress.set(v);
		});

		let easingsList = (gui.easingsList = folder.addBinding(api, 'easing', {
			options: { ...easings },
		}));

		easingsList.on('change', (v) => easingChange(v));

		let duration = (gui.duration = folder.addBinding(api, 'duration', {
			min: 500,
			max: 15000,
		}));
	}

	function easingChange(v) {
		api.ease.set(v.value);
		const easing = api.ease.value;
		ease = bezier(easing[0], easing[1], easing[2], easing[3]);
	}

	function togglePlay(forcedValue) {
		if (!api.enabled.value) return;

		playing.value = forcedValue !== undefined ? forcedValue : !playing.value;
		if (!playing.value) {
			api.progress.value = 0;
			debugApi.gui.play.title = '‣ Play';
		} else {
			api.progress.value = 0;
			debugApi.gui.play.title = '▪ Stop';
		}
	}

	function copyCoords(title) {
		if (!debugApi) return;

		const camera = debugApi.currentCamera;
		if (!camera) return;

		const posStr = camera.cam.position;
		const qtStr = camera.cam.quaternion;

		if (title === 'Set to') {
			api.to.position.copy(posStr);
			api.to.rotation.copy(qtStr);
		} else {
			api.from.position.copy(posStr);
			api.from.rotation.copy(qtStr);
		}
	}

	function onSetTo(v) {
		copyCoords(v.target.title);
	}

	function onSetFrom(v) {
		copyCoords(v.target.title);
	}

	function update(camera) {
		if (!api.enabled.value) return;
		if (!camera) return;
		if (progressTween) progressTween.update(webgl.$time.stableDt);

		if (playing.value) {
			api.progress.value += webgl.$time.dt / api.duration.value;
		}

		api.progress.value = mod(api.progress.value, 1);
		api.current.position
			.copy(api.from.position)
			.lerp(api.to.position, ease(api.progress.value));
		api.current.rotation
			.copy(api.from.rotation)
			.slerp(api.to.rotation, ease(api.progress.value));

		const cameraBase = camera.cam;
		cameraBase.position.copy(api.current.position);
		cameraBase.quaternion.copy(api.current.rotation);
	}

	return api;
}
