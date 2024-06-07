import BaseScene from '#webgl/core/BaseScene';
import { MainCamera } from '../Cameras/MainCamera';
import { POVCamera } from '../Cameras/POVCamera';

import { AdditiveBlending, Box3, MeshBasicMaterial } from 'three';
import { Cube } from '../Objects/Cube';
import { BoxGeometry } from 'three';
import { Mesh } from 'three';
import { Particles } from '../Particles/Particles';
import { Vector3 } from 'three';
import { presetsShader } from '#utils/presets/shaders.js';
import { uniforms } from '../Text';


export default class MainScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		// this.camera = this.add(MainCamera);
		this.camera = this.add(POVCamera);

		const { $assets, $gpgpu } = this.webgl;
		// console.log($assets.objects, chambre)
		const boat = $assets.objects['boat'].scene;
		const chambre = $assets.objects['chambre-model'].scene;
		const textures = $assets.textures['chambre'];

		const floor_wall_mat = new MeshBasicMaterial({
			map: textures['floor_wall_map'],
		});

		const objects_mat = new MeshBasicMaterial({
			map: textures['objects_map'],
		});

		const boundingBox = {
			min: new Vector3(-12, -12, -12),
			max: new Vector3(12, 12, 12),
		}

		// const particles = this.add(Particles, { instance: boat.children[0].geometry.clone() })
		// const particles = this.add(Particles, {
		// 	count: 2000,
		// 	boundingBox,
		//  	...presetsShader.particles.emissive,
		// 	material: {
		// 		depthWrite: false,
		// 		uniforms: {
		// 			uSize: { value: 0.03 }
		// 		},
		// 		blending: AdditiveBlending
		// 	}
		// })


		// const particlePooling = this.add(Particles, { gpgpu:   })

		chambre.traverse((child) => {
			if (!child.isMesh || !child.material) return;

			// console.log(child.name, child);
			if (child.name === 'mursetsol') {
				child.material = floor_wall_mat;
			} else {
				child.material = objects_mat;
			}
		});
		chambre.scale.setScalar(3)
		this.base.add(chambre)
		// this.add(Cube);
		// this.add(Sphere);
	}

	async enter() {
		this.log('enter');
	}

	async leave() {
		this.log('leave');
	}

	update() {}
}
