import { Object3D } from 'three';
import { w, storageSync } from '#utils/state';
import { logger } from '#utils/debug';
import { mean } from '#utils/maths';
import { Query } from './Query.js';
import createStatsOverlay from './statsOverlay.js';

const TIME_ELAPSED_EXT = 0x88BF;

// const GPU_DISJOINT_EXT = 0x8FBB;

// Patch Object3D to add update matrix count
let updateMatrixCount = 0;
const updateMatrixTemp = Object3D.prototype.updateMatrixWorld;
Object3D.prototype.updateMatrixWorld = function (force) {
	updateMatrixCount++;
	updateMatrixTemp.call(this, force);
};


export function debugPlugin(webgl) {
	if (!webgl.$app.$gui) return;

	// const { $hooks, $app } = webgl;

	// Add gui
	const api = {
		$debug : {}
	};

	api.debugStats = {
		gpu: w('---'),
		cpu: w('---')
	};

	const gui = webgl.$app.$gui;
	const page = gui.webglPage || gui;

	api.$debug.storage = webgl.$app.$debug.storage;


	gui.methods.forEach(k => {
		if (k in page) api[ k ] = page[ k ].bind(page);
	});

	const fstats = api.addFolder({ title: 'Stats' });
	// const requestIdleCallback = window.requestIdleCallback;

	const stats = {
		fps: 60,
		cpu: 0,
		gpu: 0,
		textureMemory: 0,
		geometryMemory: 0,
		programs: 0,
		geometries: 0,
		textures: 0,
		drawcalls: 0,
		triangles: 0,
		matrixUpdates: 0
	};

	let timerQuery;


	let cpuTime = 0;
	const cpuValues = new Array(6).fill(1);
	let cpuIndex = 0;

	const gpuValues = new Array(6).fill(1);
	let gpuIndex = 0;

	function startFrame() {
		cpuTime = performance.now();
		if (timerQuery && !timerQuery.active) timerQuery.begin();
	}

	function endFrame() {
		if (timerQuery && !timerQuery.active) timerQuery.end();

		stats.matrixUpdates = updateMatrixCount;
		updateMatrixCount = 0;

		cpuTime = performance.now() - cpuTime;
		cpuValues[ cpuIndex++ ] = cpuTime;
		if (cpuIndex >= cpuValues.length) {
			cpuIndex = 0;
			const ms = mean(cpuValues).toFixed(2);
			if (stats.cpu !== ms) {
				api.debugStats.cpu.set(ms);
				stats.cpu = ms;
				stats._cpu.refresh();
			}
		}

		if (timerQuery && timerQuery.active) {
			let timerAvailable = timerQuery.ready();
			// var gpuTimerDisjoint = webgl.getParameter(GPU_DISJOINT_EXT);
			if (timerAvailable) {
				gpuValues[ gpuIndex++ ] = timerQuery.result / 1000000;
				if (gpuIndex >= gpuValues.length) {
					gpuIndex = 0;
					const ms = mean(gpuValues).toFixed(2);
					if (stats.gpu !== ms) {
						api.debugStats.gpu.set(ms);
						stats.gpu = ms;
						stats._gpu.refresh();
					}
				}
			}
		}
	}

	let fpsFrames = 0;
	let fpsStartDate = performance.now();
	function updateFps() {
		const t = performance.now();
		const elapsedTime = t - fpsStartDate;
		if (elapsedTime > 1000) {
			const fps = fpsFrames * 1000 / elapsedTime;
			fpsFrames = 0;
			fpsStartDate = t;
			if (stats.fps !== fps) {
				stats.fps = fps;
				stats._fps.refresh();
			}
		}
		fpsFrames++;
	}


	let threeDate = performance.now();
	function updateThreeProps() {
		const t = performance.now();
		const elapsedTime = t - threeDate;
		if (elapsedTime < 200) return;
		threeDate = t;

		const info = webgl.$threeRenderer.info;
		const programs = info.programs.length;
		if (programs !== stats.programs) {
			stats.programs = programs;
			stats._programs.refresh();
		}

		const geometries = info.memory.geometries;
		if (geometries !== stats.geometries) {
			stats.geometries = geometries;
			stats._geometries.refresh();
		}

		const textures = info.memory.textures;
		if (textures !== stats.textures) {
			stats.textures = textures;
			stats._textures.refresh();
		}

		const drawcalls = info.render.calls;
		if (drawcalls !== stats.drawcalls) {
			stats.drawcalls = drawcalls;
			stats._drawcalls.refresh();
		}

		const triangles = info.render.triangles;
		if (triangles !== stats.triangles) {
			stats.triangles = triangles;
			stats._triangles.refresh();
		}

		const geoMem = info.memory.geometries;
		if (geoMem !== stats.geometryMemory) {
			stats.geometryMemory = geoMem;
			stats._geometryMemory.refresh();
		}

		const texMem = info.memory.textures;
		if (texMem !== stats.textureMemory) {
			stats.textureMemory = texMem;
			stats._textureMemory.refresh();
		}
	}

	return {
		install: () => {
			webgl.$gui = api
			webgl.$debug = api;
		},
		load: () => {
			const { $hooks, $debug } = webgl;
			const { afterSetup, beforeFrame, afterFrame } = $hooks;

			afterSetup.watchOnce(() => {
				// Prepare webgl2 timer query (taken from picogl)
				const exts = webgl.$threeRenderer.extensions;
				const gl = webgl.$threeRenderer.getContext();
				const hasTimerQuery = exts.has('EXT_disjoint_timer_query_webgl2');
				timerQuery = hasTimerQuery && new Query(gl, TIME_ELAPSED_EXT);
				if (!timerQuery) delete api.debugStats.gpu;

				const viewOverlay = storageSync(
					'overlay-stats-visible',
					w(true),
					{ storage: $debug.storage }
				);

				fstats.addBinding({ viewOverlay }, 'viewOverlay', { label: 'Show overlay' });

				for (const k in stats) {
					const opts = { interval: 30, readonly: true };
					if (k !== 'fps') opts.format = v => Math.floor(v);
					if (k === 'cpu') {
						opts.label = 'cpu time';
						opts.format = v => v.toFixed(2) + 'ms';
					} else if (k === 'gpu') {
						opts.label = 'gpu time';
						opts.format = v => v.toFixed(2) + 'ms';
					} else if (k === 'textureMemory' || k === 'geometryMemory') {
						opts.format = v => ~~v + 'mb';
					}

					stats[ '_' + k ] = fstats.addBinding(stats, k, opts);
				}

				if (!hasTimerQuery) stats._gpu.dispose();

				if (typeof window.debugWebglSpriteCount !== 'undefined') {
					fstats.addBinding(window, 'debugWebglSpriteCount', {
						format: v => Math.floor(v),
						label: 'sprites',
						readonly: true
					});
				}
				if (typeof window.debugSignalCount !== 'undefined') {
					fstats.addBinding(window, 'debugSignalCount', {
						format: v => Math.floor(v),
						label: 'signals',
						readonly: true
					});
				}
				if (typeof window.debugWebglComponentCount !== 'undefined') {
					fstats.addBinding(window, 'debugWebglComponentCount', {
						format: v => Math.floor(v),
						label: 'components',
						readonly: true
					});
				}

				const statsOverlay = createStatsOverlay();
				viewOverlay.watchImmediate(v => {
					if (v) statsOverlay.show();
					else statsOverlay.hide();
				});
			});

			beforeFrame.watch(startFrame);

			afterFrame.watch(() => {
				endFrame();
				updateFps();

				// updateUnclampedFps();
				updateThreeProps();
			});
		}
	}
}
