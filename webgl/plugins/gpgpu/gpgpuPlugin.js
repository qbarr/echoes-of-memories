import { GPUComputationRenderer } from 'three/examples/jsm/Addons.js';

export function gpgpuPlugin(webgl) {
	const api = { create };
	function create({instance, nbParticles}) {
		const gpgpu = {}
		gpgpu.instance = instance;
		gpgpu.count = instance ? instance.attributes.position.count : nbParticles;
		gpgpu.size = Math.ceil(Math.sqrt(gpgpu.count));
		gpgpu.computation = new GPUComputationRenderer(gpgpu.size, gpgpu.size, webgl.$renderer.instance);
		gpgpu.baseTexture = gpgpu.computation.createTexture();
		return gpgpu
	}
	return {
		install: () => {
			webgl.$gpgpu = api;
		},
		load: () => {
		},
	};
}
