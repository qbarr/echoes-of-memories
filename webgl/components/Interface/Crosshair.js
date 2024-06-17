import BaseComponent from '#webgl/core/BaseComponent.js';
import { AdditiveBlending, Mesh, PlaneGeometry, ShaderMaterial } from 'three';

import { watch } from 'vue';

export class Crosshair extends BaseComponent {
	init() {
		const icon = this.webgl.$assets.textures.interface.eye;
		const ratio = icon.image.width / icon.image.height;
		const planeGeo = new PlaneGeometry(1, 1);
		const planeMat = new ShaderMaterial({
			vertexShader: /* glsl */ `
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: /* glsl */ `
				uniform sampler2D tMap;
				uniform float uRatio;
				uniform int uType;
				varying vec2 vUv;
				void main() {
					vec2 uv = vUv;
					if (uType == 1) {
						// circle
						vec2 p = uv - 0.5;
						float d = length(p);
						if (d > .07) discard;
						gl_FragColor = vec4(1.0);
					} else {
						uv -= 0.5;
						uv.y *= uRatio;
						uv += 0.5;
						gl_FragColor = texture2D(tMap, uv);
						gl_FragColor.a = smoothstep(0.5, 0.6, gl_FragColor.a);
					}
				}
			`,
			uniforms: {
				tMap: { value: icon },
				uType: { value: 1 },
				uRatio: { value: ratio },
			},
			transparent: true,
			blending: AdditiveBlending,
		});
		this.base = new Mesh(planeGeo, planeMat);
		this.base.scale.setScalar(2);
		this.base.position.set(0, 0, -0.5);

		// const { isPaused } = this.webgl.$app.$store;
		// watch(this.webgl.$app.$store.isPaused, (paused) => {
		// 	console.log('isPaused:', paused);
		// 	this.setVisible(!paused);
		// });
	}

	toggleHover(hover) {
		this.base.material.uniforms.uType.value = hover ? 0 : 1;
	}

	setVisible(visible) {
		this.base.visible = visible;
	}
}
