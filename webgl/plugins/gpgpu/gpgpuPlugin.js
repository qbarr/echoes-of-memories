import { GPUComputationRenderer } from 'three/examples/jsm/Addons.js';

export function gpgpuPlugin(webgl) {
	const api = { create, createPooling };

	api.pool = createPooling(100)
	api.pool.alloc(5)

	function createPooling(nbPixels) {
		const pool = [];

		function get() {
			const item = pool.pop() || create(nbPixels)
			return item
		}

		function release(gpgpu) {
			pool.push(gpgpu)
			return gpgpu
		}

		function alloc(count) {
			if (count <= 0) return;
			while (count--) release(create(nbPixels))
		}

		return { get, release, alloc, pool };
	}

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
