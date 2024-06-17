import { map } from '#utils/maths';
import { webgl } from '#webgl/core';
import { AnimationMixer, LoopOnce, LoopPingPong, LoopRepeat } from 'three';

const NOOP = () => {};
const nope = () => false;

export function useAnimationsMixer(
	root,
	{
		skip = nope,
		rename = null,
		onStart: _onStart = NOOP,
		onUpdate = NOOP,
		defaultAction,
		...args
	} = {},
) {
	const mixer = new AnimationMixer(root);
	const actions = {};

	for (const clip of root.animations) {
		if (skip(clip)) continue;

		const name = (rename?.(clip.name) ?? clip.name.split('_')[0]).toLowerCase();
		const animation = {
			clip,
			action: mixer.clipAction(clip, root.scene),
			name,
			rawName: clip.name,
			weight: 1,
			totalDuration: clip.duration,
			invTotalDuration: 1 / clip.duration,

			play: ({ once = true } = {}) => {
				animation.action.clampWhenFinished = once;
				animation.action.loop = once ? LoopOnce : LoopRepeat;
				animation.action.play();
			},
		};
		actions[name] = animation;
	}

	const api = {
		root,
		current: null,
		currentProgress: 0,
		prev: null,
		mixer,
		actions,
		enabled: true,

		isPaused: false,

		...(args ?? {}),

		onUpdate,
		_onStart,

		play,
		stop,
		pause,
		resume,
		reset,

		seek,
		normSeek,
		update,

		fadeOut: (d = 0.2) => api.current?.action.fadeOut(d),
		fadeIn: (d = 0.2) => api.current?.action.fadeIn(d),

		get(_name) {
			return actions[_name];
		},
	};

	defaultAction && api.play(defaultAction);

	return api;

	function play(
		id,
		{
			fadeIn = 0.5,
			durationOut = fadeIn,
			weight = 1,
			timeScale = 1,
			once = false,
			yoyo = false,
			stopOnLastFrame = false,
			backward = false,
			onComplete = NOOP,
			onStart = NOOP,
			preventDefaultAnimation = false,
			force = false,
			reset = false,
		} = {},
	) {
		id = id?.toLowerCase();
		if (
			(!api.current && id === null) ||
			!(id in actions) ||
			(api.current?.name === id && !force) ||
			(api.current?.clip?.name.toLowerCase().includes(id) && !force)
		)
			return;

		const prevAction = api.current?.action;
		const nextAction = actions[id].action;

		if (!nextAction)
			return __DEBUG__ && console.error(`No action found for id: ${id}`);

		api.prev = api.current;
		api.current = actions[id];
		api.isPaused = false;

		api.prev &&
			'_onComplete' in api.prev &&
			mixer.removeEventListener('finished', api.prev._onComplete);
		prevAction?.fadeOut(durationOut);

		nextAction.enabled = true;
		nextAction.clampWhenFinished = once;
		nextAction.repetitions = once ? 1 : Infinity;
		nextAction.loop = yoyo ? LoopPingPong : once ? LoopOnce : LoopRepeat;

		if (backward) timeScale *= -1;
		let startTime = backward ? nextAction._clip.duration : 0;

		if (nextAction.isRunning() && !reset) startTime = nextAction.time;

		nextAction
			.reset()
			.setEffectiveTimeScale(timeScale)
			.setEffectiveWeight(weight)
			.fadeIn(fadeIn)
			.play();

		nextAction.time = startTime;
		nextAction.isPaused = false;

		onStart(api);
		_onStart(id, api);

		const _onComplete = () => {
			if (defaultAction && !preventDefaultAnimation) play(defaultAction);

			stopOnLastFrame && seek(api.current.totalDuration);
			nextAction.isPaused = true;

			onComplete(api);
			mixer.removeEventListener('finished', _onComplete);
		};
		api.current._onComplete = _onComplete;
		mixer.addEventListener('finished', _onComplete);

		return api;
	}

	function pause({ fadeOut = 0 } = {}) {
		if (!api.current?.action) return;
		const { action } = api.current;
		action.fadeOut(fadeOut);
		api.isPaused = true;

		return api;
	}

	function resume({ fadeIn = 0 } = {}) {
		if (!api.current?.action) return;
		const { action } = api.current;
		action.fadeIn(fadeIn);
		action.isPaused = false;
		api.isPaused = false;

		return api;
	}

	function stop({ fadeOut = 0 } = {}) {
		if (!api.current?.action) return;
		const { action } = api.current;
		action.fadeOut(fadeOut);
		setTimeout(() => action.stop(), fadeOut);

		return api;
	}

	function reset({ hard = false } = {}) {
		api.current?.action?.reset();
		mixer.setTime(0);
		if (hard) api.current = null;

		return api;
	}

	function normSeek(time) {
		const _time = map(time, 0, 1, 0, api.current.totalDuration);
		return seek(_time);
	}

	function seek(time) {
		if (!api.current?.action) return;
		const { action } = api.current;

		const normProgress = action?.time * api.current.invTotalDuration;
		const progress = action.time;

		api.currentProgress = progress;
		onUpdate(api, progress, normProgress);

		mixer.setTime(time);

		return mixer;
	}

	function update() {
		if (!api.enabled || api.isPaused) return;

		const { dt } = webgl.$time;
		mixer.update(dt * 0.001);

		const normProgress = api.current?.action?.time * api.current?.invTotalDuration;
		const progress = api.current?.action?.time;
		onUpdate(api, progress, normProgress);
	}
}
