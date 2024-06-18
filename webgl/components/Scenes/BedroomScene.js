import BaseScene from '#webgl/core/BaseScene';

import { MeshBasicMaterial, Sprite, SpriteMaterial, Vector3 } from 'three';
import { scenesDatas } from './datas';

export default class BedroomScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		const { $assets, $theatre } = this.webgl;

		this._hasStarted = false;

		this.$project = $theatre.get('Bedroom');

		const datas = scenesDatas.bedroom;
		const scene = $assets.objects.bedroom.model.scene;

		// Get raycastables and remove them from the scene
		scene.traverse((child) => {
			if (!child.isMesh || !child.material) return;
			if (child.name.includes('raycastable')) {
				const idRef = child.name.split('_')[0];
				const o = datas[idRef];
				o.raycastMesh = child;
				child.visible = false;
			}
		});

		const textures = $assets.textures['bedroom'];

		// Get textures for meshes
		const _textures = {
			mursetsol: new MeshBasicMaterial({ map: textures['floor_wall_map'] }),
			objets: new MeshBasicMaterial({ map: textures['objects_map'] }),
		};
		[
			'crucifix',
			'platine',
			'vinyles',
			'photodefamille',
			'testament',
			'guitare',
			'nounours',
			'livres',
			'peinture',
			'couverture',
			'posters',
			'drowninggirl',
		].forEach((k) => (_textures[k] = _textures.objets));

		// Assign textures to datas
		Object.keys(datas).forEach((k) => {
			Object.assign(datas[k], { texture: _textures[k] });
		});

		const _objects = [];

		scene.traverse((child) => {
			if (!child.isMesh || !child.material) return;
			if (child.name.includes('raycastable')) return;

			const data = datas[child.name];
			if (data) {
				const { class: Class, texture } = data;
				child.material = texture;
				if (Class) {
					const obj = new Class({ name: child.name, mesh: child, data });
					_objects.push(obj);
				}
			}
		});
		_objects.forEach((o) => this.add(o));

		this.base.add(scene);

		this.webgl.$hooks.afterStart.watchOnce(this.createSheets.bind(this));
	}

	async createSheets() {
		this.$sheet = this.$project.getSheet('Enter');
		await this.$sheet.attachAudio('bedroom/enter');
		this.$sheet.$addCamera();
		this.$sheet.$composer(['global', 'lut', 'bloom', 'bokeh', 'crt', 'depth']);
	}

	async enter() {
		this._hasStarted = true;

		const { $povCamera, $app, $scenes } = this.webgl;
		$povCamera.onSceneSwitch(this);

		const uiScene = $scenes.ui.component;
		uiScene.subtitles.setColor($app.$store.subtitles.colors.yellow);

		/// #if __DEBUG__
		$povCamera.$setState('free');
		$povCamera.setPosition([-8.67082, 0, 4.88725]);
		/// #endif
	}

	async start() {}

	// async leave() {
	// 	const { $composer, $scenes } = this.webgl;

	// 	const animations = await Promise.all([
	// 		$composer.$crt.glitch(),
	// 		$composer.$lut.animateSaturation(0),
	// 		this.animateOpacity(1),
	// 	])
	// }

	// async animateOpacity(to) {
	// 	return new Promise((resolve) => {
	// 		this.opacityTween = raftween({
	// 			from: this.sprite.material.opacity,
	// 			to,
	// 			target: this.sprite.material,
	// 			property: 'opacity',
	// 			duration: 3,
	// 			onComplete: resolve,
	// 			easing: easings.inOutQuad
	// 		})
	// 	})
	// }
}
