import { getWebGL } from '#webgl/core/index.js';
import createFilter from '#webgl/utils/createFilter.js';
import { MeshDepthMaterial, RGBADepthPacking, WebGLRenderTarget } from 'three';

import DepthFragment from './DepthFragment.frag?hotshader';

const DUMMY_RT = new WebGLRenderTarget(1, 1, { depthBuffer: false });

export const useDepthPass = (composer) => {
	const { buffers, filters, uniforms, defines } = composer;

	const $webgl = getWebGL();
	const { $threeRenderer, $fbo } = $webgl;

	const materials = {};

	/* Params */
	// const distance = w(1);

	let depthTexture = DUMMY_RT.texture;

	const api = {
		get texture() {
			return depthTexture;
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
		tDepth: { value: depthTexture, type: 't' },
	});

	const filter = createFilter({
		uniforms: {
			...uniforms,
			tDepth: { value: DUMMY_RT.texture, type: 't' },
		},
		defines: {
			...defines,
		},
	});
	DepthFragment.use(filter.material);

	/* Render */
	function render(scene, renderer) {
		renderer = renderer ?? $threeRenderer;

		scene.base.traverse((o) => {
			if (o.isMesh || o.isLine) {
				if (o.uuid in materials) {
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
		depthTexture = bufferSceneDepth.texture;
		uniforms.tDepth.value = depthTexture;

		scene.base.traverse((o) => {
			if (o.isMesh || o.isLine) {
				const m = materials[o.uuid];

				// if (o.renderToDepthPrepass) {
				o.material = m.material;
				// }

				o.visible = m.visible;
			}
		});
	}

	/// #if __DEBUG__
	function devtools(_gui) {
		const gui = _gui.addFolder({ title: 'Depth' });
	}
	/// #endif

	return api;
};
