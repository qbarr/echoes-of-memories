import { webgl } from '#webgl/core';
import { MeshDepthMaterial, RGBADepthPacking, Vector2, WebGLRenderTarget } from 'three';

import { w } from '#utils/state/index.js';
import createFilter from '#webgl/utils/createFilter.js';

import DepthPass from './DepthPass.frag?hotshader';
import { wUniform } from '#webgl/utils/Uniform.js';

const DUMMY_RT = new WebGLRenderTarget(1, 1, { depthBuffer: false });

export const useDepthPass = (composer) => {
	const { buffers, filters, uniforms, defines } = composer;
	const { $threeRenderer, $fbo } = webgl;

	const materials = {};

	/* Params */
	const distance = w(1.5);

	let texture = DUMMY_RT.texture;

	const api = {
		get texture() {
			return texture;
		},

		render,
		/// #if __DEBUG__
		devtools,
		/// #endif
	};
	composer.$depth = api;

	/* Init */
	const bufferDepth = $fbo.createBuffer({ name: 'Depth' });
	const bufferSceneDepth = $fbo.createBuffer({ name: 'Scene Depth' });
	const DepthMaterial = new MeshDepthMaterial({
		depthPacking: RGBADepthPacking,
	});

	Object.assign(uniforms, {
		tDepth: { value: texture, type: 't' },
	});

	const filter = createFilter({
		uniforms: {
			...uniforms,
			tDepth: { value: DUMMY_RT.texture, type: 't' },
			...wUniform('uDistance', distance),
		},
		defines: { ...defines },
	});
	DepthPass.use(filter.material);

	/* Render */
	function render(scene, renderer) {
		renderer = renderer ?? $threeRenderer;

		scene.base.traverse((o) => {
			if (o.isMesh || o.isLine) {
				if (materials[o.uuid]) {
					materials[o.uuid].visible = o.visible;
					materials[o.uuid].material = o.material;
				} else {
					materials[o.uuid] = {
						visible: o.visible,
						material: o.material,
					};
				}

				// if (o.renderToDepthPrepass) {
				o.material = o.customDepthMaterial || DepthMaterial;
				// } else {
				// o.visible = false;
				// }
			}
		});

		renderer.setRenderTarget(bufferDepth);
		renderer.clear();
		scene.triggerRender();
		filter.uniforms.tDepth.value = bufferDepth.texture;

		renderer.setRenderTarget(bufferSceneDepth);
		renderer.clear();
		filter.render();
		texture = bufferSceneDepth.texture;
		uniforms.tDepth.value = texture;

		scene.base.traverse((o) => {
			if (o.isMesh || o.isLine) {
				const m = materials[o.uuid];
				if (!m) return; // In case the object was removed from the scene of added to

				// if (o.renderToDepthPrepass) {
				o.material = m.material;
				// }

				o.visible = m.visible;
			}
		});
	}

	/// #if __DEBUG__
	function devtools(_gui) {
		const gui = _gui.addFolder({ title: '🌑 Depth' });

		gui.addBinding(distance, 'value', {
			label: 'Distance',
			min: 0,
			max: 3,
			step: 0.01,
		});
	}
	/// #endif

	return api;
};
