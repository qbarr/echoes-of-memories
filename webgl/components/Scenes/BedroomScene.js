import BaseScene from '#webgl/core/BaseScene';
import { POVCamera } from '../Cameras/POVCamera';

import { MeshBasicMaterial, Object3D } from 'three';
import { Guitare } from '../Objects/Guitare';
import { useTheatre } from '#webgl/utils/useTheatre.js';
import { BaseInteractiveObject } from '../Objects/base/BaseInteractiveObject';
import { scenesDatas } from './datas';

export default class BedroomScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		const { $assets } = this.webgl;
		const datas = scenesDatas.bedroom;
		const scene = $assets.objects['chambre-model'].scene;

		// Get raycastables and remove them from the scene
		const _raycastables = [];
		scene.traverse((child) => {
			if (!child.isMesh || !child.material) return;
			if (child.name.includes('raycastable')) {
				const idRef = child.name.split('_')[0];
				const o = datas[idRef];
				o.raycastMesh = child;
				child.visible = false;
				_raycastables.push(child);
			}
		});
		// scene.remove(..._raycastables);

		const textures = $assets.textures['chambre'];

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

		// Override $theatre
		this.$theatre = useTheatre(this, 'Bedroom-Scene');
	}

	async enter() {
		this.log('enter');
		// this.camera = this.add(this.webgl.$povCamera);
		this.webgl.$povCamera.onSceneSwitch(this);
		this.camera = this.add(this.webgl.$povCamera);
		// this.camera.setPosition([-8.67082, 0, 4.88725]);
	}

	async leave() {
		this.log('leave');
	}

	update() {}
}
