import BaseScene from '#webgl/core/BaseScene';
import { MainCamera } from '../Cameras/MainCamera';

import { MeshBasicMaterial } from 'three';
import { Cube } from '../Objects/Cube';

export default class MainScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		this.camera = this.add(MainCamera);

		const { $assets } = this.webgl;

		const chambre = $assets.objects['chambre-model'].scene;
		const textures = $assets.textures['chambre'];

		const floor_wall_mat = new MeshBasicMaterial({
			map: textures['floor_wall_map'],
		});

		const objects_mat = new MeshBasicMaterial({
			map: textures['objects_map'],
		});

		// console.log(textures['floor_wall_map']);

		chambre.traverse((child) => {
			if (!child.isMesh || !child.material) return;

			// console.log(child.name, child);
			if (child.name === 'mursetsol') {
				child.material = floor_wall_mat;
			} else {
				child.material = objects_mat;
			}
		});
		chambre.scale.setScalar(3);
		this.base.add(chambre);

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
