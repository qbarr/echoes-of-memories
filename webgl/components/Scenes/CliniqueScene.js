import BaseScene from '#webgl/core/BaseScene';
import { POVCamera } from '../Cameras/POVCamera';

import { MeshBasicMaterial } from 'three';
import { useTheatre } from './useTheatre';

export default class CliniqueScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		// this.camera = this.add(MainCamera);
		// this.camera = this.add(POVCamera);
		// this.camera = this.add(this.webgl.$povCamera);

		const { $assets } = this.webgl;

		const scene = $assets.objects['clinique-model'].scene;
		const textures = $assets.textures['clinique'];

		const floor_wall_mat = new MeshBasicMaterial({
			map: textures['floor_wall_map'],
		});

		const objects_mat = new MeshBasicMaterial({
			map: textures['objects_map'],
		});

		const big_objects_mat = new MeshBasicMaterial({
			map: textures['big_objects_map'],
		});

		// ! À scale dans Blender
		scene.scale.setScalar(3);

		const _objects = [];

		scene.traverse((child) => {
			if (!child.isMesh || !child.material) return;

			console.log(child.name, child);
			if (child.name === 'chambremurs') {
				child.material = floor_wall_mat;
			} else if (child.name === 'objetsnombreux') {
				child.material = objects_mat;
			} else if (child.name === 'objetsbases') {
				child.material = big_objects_mat;
			}
		});

		// _objects.forEach((o) => this.add(o));
		this.base.add(scene);

		useTheatre(this, { id: 'Clinique Scene' });
	}

	async enter() {
		this.log('enter');
		this.camera = this.add(this.webgl.$povCamera);
	}

	async leave() {
		this.log('leave');
	}

	update() {}
}
