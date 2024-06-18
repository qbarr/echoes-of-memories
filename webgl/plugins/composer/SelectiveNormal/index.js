import { webgl } from '#webgl/core';
import { GLSL3, MeshBasicMaterial, MeshNormalMaterial, WebGLRenderTarget } from 'three';

import createFilter from '#webgl/utils/createFilter.js';
import { w } from '#utils/state';

const DUMMY_RT = new WebGLRenderTarget(1, 1, { depthBuffer: false });
const BLACK_MATERIAL = new MeshBasicMaterial({ color: 0x000000 });
// const WHITE_MATERIAL = new MeshBasicMaterial({ color: 0xffffff });
const OVERRIDE_MATERIAL = new MeshNormalMaterial();

export const useSelectiveNormalPass = (composer) => {
	const { buffers, filters, uniforms, defines } = composer;

	const objectsToRender = [];
	const objects = {};

	const enabled = w(true);

	let texture = DUMMY_RT.texture;
	const api = {
		enabled,

		get texture() {
			return texture;
		},

		add: (obj) => objectsToRender.push(obj),
		remove: (obj) => objectsToRender.splice(objectsToRender.indexOf(obj), 1),

		render,
	};
	composer.$selectiveNormal = api;

	/* Private */
	const { $threeRenderer, $fbo } = webgl;

	const b = (buffers.selectiveNormal = $fbo.createBuffer({ name: 'Selective Normal' }));

	Object.assign(uniforms, {
		tSelectiveNormal: { value: texture, type: 't' },
	});

	function render(scene, renderer) {
		if (!enabled.value || !objectsToRender.length) {
			uniforms.tSelectiveNormal.value = DUMMY_RT.texture;
			return;
		}

		renderer = renderer ?? $threeRenderer;

		renderer.setRenderTarget(b);
		renderer.clear();

		scene.base.traverse((o) => {
			// if (o.userData?.isDebug) o.visible = false;

			if (o.isMesh || o.isLine) {
				if (objects[o.uuid]) {
					objects[o.uuid].visible = o.visible;
					objects[o.uuid].material = o.material;
				} else {
					objects[o.uuid] = {
						visible: o.visible,
						material: o.material,
					};
				}

				if (objectsToRender.includes(o)) {
					o.material = OVERRIDE_MATERIAL;
				} else {
					o.material = BLACK_MATERIAL;
				}
			}
		});

		scene.triggerRender();

		texture = b.texture;
		uniforms.tSelectiveNormal.value = texture;
		renderer.setRenderTarget(null);

		scene.base.traverse((o) => {
			if (o.isMesh || o.isLine) {
				const m = objects[o.uuid];
				if (!m) return; // In case the object was removed from the scene of added to
				o.material = m.material;
				o.visible = m.visible;
			}
		});
	}

	return api;
};
