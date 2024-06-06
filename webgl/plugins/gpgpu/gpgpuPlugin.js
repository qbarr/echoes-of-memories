import { GPUComputationRenderer } from 'three/examples/jsm/Addons.js';

export function gpgpuPlugin(webgl) {
	const api = { create };

	function create(count) {
		const gpgpu = {}
		gpgpu.variables = {}
		gpgpu.count = count;
		gpgpu.size = Math.ceil(Math.sqrt(count));
		gpgpu.computation = new GPUComputationRenderer(gpgpu.size, gpgpu.size, webgl.$renderer.instance);
		gpgpu.baseTexture = gpgpu.computation.createTexture();

		return gpgpu
	}

	return {
		install: () => {
			webgl.$gpgpu = api;
		},
		load: () => {},
	};
}
