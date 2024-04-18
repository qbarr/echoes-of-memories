import { clamp, median } from '#utils/maths';
import { w } from '#utils/state';

export function qualityPlugin(webgl) {
	const LS_KEY = 'webgl-quality';
	const RESTART_DELAY = 300;
	const SECONDS_THRESHOLD = 3;
	const MAX_PING_PONG = 2;
	const MAX_QUALITY = 5;
	const storage = webgl?.$app?.$localStorage ?? localStorage;

	// Above this fps number, quality will be increased (+1)
	let HIGH_THRESHOLD = 58;
	// Below this fps number, quality will be reduced (-1)
	let LOW_THRESHOLD = 52;
	// Below this fps number, quality will be greatly reduced (-2)
	let CRITICAL_THRESHOLD = 30;

	let nextDelay = RESTART_DELAY;
	let delay = RESTART_DELAY; // Delay before starting the measure
	let timer = 0;
	let fpsCount = 0;
	let needReset = false;
	let needHardReset = false;

	let qualityLimit = MAX_QUALITY;
	let forcedQualityLimit = MAX_QUALITY;

	// Wait the first 5 render frame before measuring quality
	let bootFrames = 10;

	const fpsHistory = new Float64Array(SECONDS_THRESHOLD);
	let fpsHistoryIndex = 0;
	const qualityHistory = new Float64Array([ -1, -1, -1 ]);
	let pingPongScore = 0;
	let bigPingPongScore = 0;

	let paused = false;

	const fps = w(60);
	const fpsAverage = w(60);
	const quality = w(1);

	webgl.$hooks.afterSetup.watchOnce(init);
	webgl.$hooks.beforeStart.watchOnce(start);

	const api = webgl.$quality = {
		get pingPongScore() { return pingPongScore },
		get bigPingPongScore() { return bigPingPongScore },
		fps,
		fpsAverage,
		quality,
		current: quality,
		pause,
		resume,
		reset: (delay = 300) => scheduleReset(false, delay),
		hardReset: (delay = 300) => scheduleReset(true, delay),
		updateQuality,
		limitQuality: v => {
			forcedQualityLimit = clamp(v, 0, MAX_QUALITY);
			updateQuality();
		},
		setThresholds
	};

	/// #if __DEBUG__
	/// #code api.debugPingPong = () => [
	/// #code pingPongScore, bigPingPongScore, qualityLimit,
	/// #code qualityHistory.join(',')
	/// #code ].join(' | ');
	/// #endif

	function setThresholds(t = {}) {
		if (t.high) HIGH_THRESHOLD = t.high;
		if (t.low) LOW_THRESHOLD = t.low;
		if (t.critical) CRITICAL_THRESHOLD = t.critical;
	}

	// Read current saved preset
	function readPreset() {
		const value = storage.getItem(LS_KEY);
		return value !== null && value !== undefined && !isNaN(value)
			? (value | 0)
			: null;
	}

	function savePreset(v) {
		storage.setItem(LS_KEY, v);
	}

	function pause() {
		paused = true;
	}

	function resume(delay = 150) {
		paused = false;
		scheduleReset(false, delay);
	}

	function init() {
		const device = webgl.$app.$device;
		const detectedQuality = ((device && device.gpu) ? device.gpu.qualityIndex : 3);
		const preset = readPreset();
		const qualityValue = preset != null ? preset : detectedQuality;

		quality.watch(v => {
			if (device) device.updateQuality(v);
			savePreset(v);
		});

		pushQuality(qualityValue);
		webgl.$hooks.beforeFrame.watch(update);
	}

	async function start() {
		const vp = webgl.$viewport;
		// Some properties will reset the measure
		vp.visible.watch(() => scheduleReset());

		const size = vp.size.value;
		let lastHardResetPixelCount = size.x * size.y;
		vp.changed.watch(() => {
			const size = vp.size.value;
			const pixelCount = size.x * size.y;
			if (Math.abs(lastHardResetPixelCount - pixelCount) < 200000) {
				scheduleReset(false, RESTART_DELAY);
			} else {
				lastHardResetPixelCount = pixelCount;
				scheduleReset(true, RESTART_DELAY);
			}
		});
	}

	function scheduleReset(hardReset, delay) {
		needReset = true;
		// Hard reset will also reset history
		needHardReset = needHardReset || hardReset;
		if (delay) nextDelay = delay;
	}

	function resetMeasures() {
		timer = 0;
		fpsCount = 0;
		if (needHardReset) {
			qualityLimit = MAX_QUALITY;
			fpsHistoryIndex = 0;
			pingPongScore = 0;
			bigPingPongScore = 0;
		}
		delay = nextDelay || RESTART_DELAY;
		needReset = needHardReset = false;
		nextDelay = RESTART_DELAY;
	}

	function update() {
		if (bootFrames > 0) return bootFrames--;
		const dt = webgl.$time.qualityDt;
		if (needReset) resetMeasures();
		if (delay > 0) return delay -= dt;
		timer += dt;
		fpsCount++;
		if (timer >= 1000) updateFps();
	}

	function updateFps() {
		// Add fps to history - do not add if the fps is paused
		if (!paused) {
			fpsHistory[ fpsHistoryIndex++ ] = fpsCount;
			fpsHistoryIndex = fpsHistoryIndex % (fpsHistory.length + 1);
		}

		fps.set(fpsCount);

		// Reset fps measure
		fpsCount = 0;
		timer = timer % 1000;

		if (!paused && fpsHistoryIndex == fpsHistory.length) {
			updateQuality();
		}
	}

	function pushQuality(newQuality) {
		qualityHistory[ 2 ] = qualityHistory[ 1 ];
		qualityHistory[ 1 ] = qualityHistory[ 0 ];
		qualityHistory[ 0 ] = newQuality;
		quality.set(newQuality);
	}

	function updateQuality(forcedQuality) {
		// Use previous quality as default quality
		let newQuality = qualityHistory[ 0 ];
		const newAverage = median(fpsHistory);

		if (forcedQuality) {
			newQuality = forcedQuality;
		} else {
			if (newAverage <= CRITICAL_THRESHOLD) {
				newQuality -= 2;
			} else if (newAverage < LOW_THRESHOLD) {
				newQuality -= 1;
			} else if (newAverage > HIGH_THRESHOLD) {
				newQuality += 1;
			}
		}

		// clamp to prevent negative value
		newQuality = clamp(newQuality, 0, Math.min(forcedQualityLimit, qualityLimit));

		// Test if there is a ping pong between two qualities (-1 +1)
		// If there is one, we choose the lowest one and stop monitoring the quality
		if (newQuality === qualityHistory[ 0 ]) {
			pingPongScore = Math.max(0, pingPongScore - 0.2);
			bigPingPongScore = Math.max(0, bigPingPongScore - 0.2);
		} else if (newQuality !== qualityHistory[ 0 ] && newQuality !== qualityHistory[ 1 ]) {
			pingPongScore = 0;
		} else if (newQuality === qualityHistory[ 1 ]) {
			pingPongScore += 1;
		}

		// Test if there is a ping pong between three qualities (-2 +1 +1)
		// As ping pong do, we choose the lowest optimize one
		if (newQuality === qualityHistory[ 2 ] && newQuality < qualityHistory[ 0 ])
			bigPingPongScore++;

		if (pingPongScore >= MAX_PING_PONG) {
			qualityLimit = Math.min(
				qualityHistory[ 1 ],
				qualityHistory[ 0 ],
				qualityLimit,
				forcedQualityLimit
			);
			pingPongScore = 0;
		}

		if (bigPingPongScore >= MAX_PING_PONG) {
			qualityLimit = Math.min(
				median(qualityHistory),
				qualityLimit,
				forcedQualityLimit
			);
			bigPingPongScore = 0;
		}

		newQuality = Math.min(
			newQuality,
			qualityLimit,
			forcedQualityLimit
		);

		if (newQuality !== quality.value) {
			pushQuality(newQuality);
		}

		fpsAverage.set(newAverage);
	}

	return api;
}
