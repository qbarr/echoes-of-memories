import BaseScene from '#webgl/core/BaseScene';
import { POVCamera } from '../Cameras/POVCamera';

import { MeshBasicMaterial } from 'three';
import { Guitare } from '../Objects/Guitare';
import { Guitare2 } from '../Objects/Guitare2';
import { Guitare3 } from '../Objects/Guitare3';

const objects = {
	crucifix: { class: null },
	platine: { class: Guitare2 },
	vinyles: { class: Guitare3 },
	photodefamille: { class: null },
	testament: { class: null },
	guitare: { class: Guitare },
	nounours: { class: null },
	livres: { class: null },
	peinture: { class: null },
	couverture: { class: null },
	posters: { class: null },
	drowninggirl: { class: null },
};

export default class BedroomScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		// this.camera = this.add(MainCamera);
		this.camera = this.add(POVCamera);

		const { $assets } = this.webgl;

		const chambre = $assets.objects['chambre-model'].scene;
		const textures = $assets.textures['chambre'];

		const floor_wall_mat = new MeshBasicMaterial({
			map: textures['floor_wall_map'],
		});

		const objects_mat = new MeshBasicMaterial({
			map: textures['objects_map'],
		});

		// chambre.scale.setScalar(3);

		const _objects = [];

		chambre.traverse((child) => {
			if (!child.isMesh || !child.material) return;

			if (child.name === 'mursetsol') {
				child.material = floor_wall_mat;
			} else {
				child.material = objects_mat;

				const o = objects[child.name];
				if (o && o?.class) {
					const obj = new o.class({ name: child.name, mesh: child });
					_objects.push(obj);
				}
			}
		});

		_objects.forEach((o) => this.add(o));

		this.base.add(chambre);
	}

	async enter() {
		this.log('enter');
	}

	async leave() {
		this.log('leave');
	}

	update() {}
}