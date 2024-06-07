import BaseScene from '#webgl/core/BaseScene';
import {
	AdditiveBlending,
	Mesh,
	MeshBasicMaterial,
	PlaneGeometry,
	ShaderMaterial,
} from 'three';
import { UICamera } from '../Cameras/UICamera';

import { Subtitles } from '../Subtitles/Subtitles';

export default class UIScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		this.camera = this.add(UICamera);

		this.add(Subtitles);

		// Crosshair Test
		const icon = this.webgl.$assets.textures.interface;
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
						float d = max(abs(uv.x), abs(uv.y));
						if (d > 0.2) discard;
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
		this.crosshair = new Mesh(planeGeo, planeMat);
		this.crosshair.scale.setScalar(4);
		this.addObject3D(this.crosshair);
	}

	async enter() {
		this.log('enter');
	}

	async leave() {
		this.log('leave');
	}

	update() {}
}
