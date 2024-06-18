import BaseScene from '#webgl/core/BaseScene';

import { MeshBasicMaterial, Sprite, SpriteMaterial, Vector3 } from 'three';
import { scenesDatas } from './datas';

export default class BedroomScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		const { $assets, $theatre, $hooks, $composer } = this.webgl;

		this._hasStarted = false;

		this.$project = $theatre.get('Bedroom');

		const datas = scenesDatas.bedroom;
		this.datas = datas;
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

		const _emissiveMaterials = {
			objets: new MeshBasicMaterial({ map: textures['objects_emissive'] }),
			mursetsol: new MeshBasicMaterial({ map: textures['floor_wall_emissive'] }),
		};

		// Get textures for meshes
		const _materials = {
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
		].forEach((k) => {
			_materials[k] = _materials.objets;
			_emissiveMaterials[k] = _emissiveMaterials.objets;
		});

		// Assign emissive materials to datas
		// Assign textures to datas
		Object.keys(datas).forEach((k) => {
			Object.assign(datas[k], {
				material: _materials[k],
				emissiveMaterial: _emissiveMaterials[k],
			});
		});

		console.log(datas);

		this._allMeshes = [];
		const _objects = [];

		scene.traverse((child) => {
			if (!child.isMesh || !child.material) return;
			if (child.name.includes('raycastable')) return;

			const data = datas[child.name];
			if (data) {
				const { class: Class, material } = data;
				child.material = material;
				this._allMeshes.push(child);
				if (Class) {
					const obj = new Class({ name: child.name, mesh: child, data });
					_objects.push(obj);
				}
			}
		});
		_objects.forEach((o) => this.add(o));

		this.base.add(scene);

		$hooks.afterStart.watchOnce(this.createSheets.bind(this));

		$composer.$hooks.beforeRenderEmissive.watch(this.onBeforeRender.bind(this));
		$composer.$hooks.afterRenderEmissive.watch(this.onAfterRender.bind(this));
	}

	onBeforeRender() {
		for (let i = 0; i < this._allMeshes.length; i++) {
			const mesh = this._allMeshes[i];
			const data = this.datas[mesh.name];
			// console.log(mesh.name, data?.emissiveMaterial, 'before');
			if (data?.emissiveMaterial) {
				mesh.material = data.emissiveMaterial;
			}
		}
	}

	onAfterRender() {
		for (let i = 0; i < this._allMeshes.length; i++) {
			const mesh = this._allMeshes[i];
			const data = this.datas[mesh.name];
			if (data?.material) {
				mesh.material = data.material;
			}
		}
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
