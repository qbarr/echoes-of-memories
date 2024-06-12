import BaseScene from '#webgl/core/BaseScene';
import { POVCamera } from '../Cameras/POVCamera';

import { Mesh, MeshBasicMaterial, PlaneGeometry, Sprite, SpriteMaterial, Vector3 } from 'three';
import { Guitare } from '../Objects/Guitare';
import { Guitare2 } from '../Objects/Guitare2';
import { Guitare3 } from '../Objects/Guitare3';
import { useTheatre } from './useTheatre';
import { raftween } from '#utils/anim/raftween.js';
import { easings } from '#utils/anim/easings.js';

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
		// this.camera = this.add(this.webgl.$povCamera);

		const { $assets } = this.webgl;

		const scene = $assets.objects['chambre-model'].scene;
		const textures = $assets.textures['chambre'];

		const floor_wall_mat = new MeshBasicMaterial({
			map: textures['floor_wall_map'],
		});

		const objects_mat = new MeshBasicMaterial({
			map: textures['objects_map'],
		});


		// scene.scale.setScalar(3);

		const _objects = [];

		scene.traverse((child) => {
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

		const materialSprite = new SpriteMaterial({
			color: 0x000000,
			transparent: true,
			opacity: 0
		})

		this.sprite = new Sprite(materialSprite)
		this.sprite.scale.setScalar(2)
		this.cameraDirection = new Vector3()

		// uncomment the following two lines to see the effect of the code

		this.base.add(this.sprite)
		this.base.add(scene);

		useTheatre(this, { id: 'Bedroom Scene' });
	}

	async enter() {
		this.log('enter');
		this.camera = this.add(this.webgl.$povCamera);

	}

	async leave() {
		const { $composer, $scenes } = this.webgl;

		const animations = await Promise.all([
			$composer.$crt.glitch(),
			$composer.$lut.animateSaturation(0),
			this.animateOpacity(1),
		])
	}

	async animateOpacity(to) {


		return new Promise((resolve) => {
			this.opacityTween = raftween({
				from: this.sprite.material.opacity,
				to,
				target: this.sprite.material,
				property: 'opacity',
				duration: 3,
				onComplete: resolve,
				easing: easings.inOutQuad
			})
		})
	}

	update() {
		this.camera.base.getWorldDirection( this.cameraDirection );
		this.sprite.position.copy( this.camera.base.position ).add( this.cameraDirection.multiplyScalar( 1.1 ))
		this.opacityTween?.update(this.webgl.$time.dt / 1000);
	}
}
