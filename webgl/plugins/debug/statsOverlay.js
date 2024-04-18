import { computed, w } from '#utils/state';
import { webgl } from '#webgl/core';

let created = false;
const qualityStr = {
	0: 'VERYLOW',
	1: 'LOW',
	2: 'MEDIUM',
	3: 'HIGH',
	4: 'VERYHIGH',
	5: 'ULTRA'
};

export default function createStatsOverlay() {
	if (created) return;
	created = true;

	const parent = webgl?.$app?.$parent ?? document.body;

	const $quality = webgl.$quality;
	const version = typeof __PROJECT_TIMESTAMP__ !== 'undefined'
		? __PROJECT_TIMESTAMP__
		: '';

	const el = document.createElement('div');
	el.classList.add('debug-quality-monitor');
	el.style.cssText = `
		position:fixed;padding:0.4em 0.7em;top:3px;left:3px;contain: content;
		z-index:9999;background:rgba(0,0,0,0.4);color:white;opacity:0.8;
		font-size:9px;line-height:1em;
		font-family:"Roboto Mono","Source Code Pro",Menlo,Consolas,Courier,monospace;
		pointer-events:none;will-change:content;border-radius:4px;
		white-space:pre;text-rendering:optimizeSpeed;
	`;

	const debugStats = webgl.$gui.debugStats;
	const hasGpuTime = debugStats && debugStats.gpu;
	const gpuTime = hasGpuTime ? debugStats.gpu : w('--');
	const cpuTime = debugStats ? debugStats.cpu : w('--');
	const SEP = '  ';

	let isHidden = false;
	parent.appendChild(el);

	computed(
		[
			$quality.fps,
			$quality.current,
			$quality.fpsAverage,
			cpuTime,
			gpuTime
		],
		(fps, q, average, cpu, gpu) => {
			if (isHidden) return;
			el.textContent =
				qualityStr[ q ] + SEP
				+ 'FPS ' + fps + SEP
				+ 'CPU ' + cpu + SEP
				+ (hasGpuTime ? 'GPU ' + gpu + SEP : '')
				+ version.slice(4);
		}
	);

	return {
		show: () => {
			isHidden = false;
			parent.appendChild(el);
		},
		hide: () => {
			isHidden = true;
			parent.removeChild(el);
		}
	};
}
