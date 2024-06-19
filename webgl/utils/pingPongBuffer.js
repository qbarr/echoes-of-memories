import { webgl } from '#webgl/core';
import createBuffer from './createBuffer';

export default function pingPongRT({ name = '', ...opts } = {}) {
	const rtA = createBuffer({ ...opts, name: name + '_A' });
	const rtB = createBuffer({ ...opts, name: name + '_B' });

	const { $threeRenderer } = webgl;

	const api = {
		bind,
		unbind,
		swap,
		readable: rtA,
		writable: rtB,
		uniform: { value: rtA.texture, type: 't' },
	};

	return api;

	function bind(renderer) {
		(renderer ?? $threeRenderer).setRenderTarget(api.writable);
	}

	function unbind(renderer) {
		(renderer ?? $threeRenderer).setRenderTarget(null);
	}

	function swap() {
		[api.readable, api.writable] = [api.writable, api.readable];
		api.uniform.value = api.readable.texture;
		// api.uniforms.tNew.value = api.readable.texture;
		// api.uniforms.tOld.value = api.writable.texture;
	}
}
