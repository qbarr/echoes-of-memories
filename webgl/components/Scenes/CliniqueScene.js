import BaseScene from '#webgl/core/BaseScene';

import { TheatreSheet } from '#webgl/plugins/theatre/utils/TheatreSheet.js';
import { Mesh, MeshBasicMaterial, Object3D } from 'three';
import { scenesDatas } from './datas';
import { wait } from '#utils/async/wait.js';
import { useAnimationsMixer } from '#webgl/utils/useAnimationsMixer.js';

export default class CliniqueScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		const { $assets, $theatre, $audio, $hooks, $composer } = this.webgl;

		this._hasStarted = false;

		this.$project = $theatre.get('Clinique');

		this._scene3D = $assets.objects.clinique.model;
		const scene = this._scene3D.scene;
		this.$mixer = useAnimationsMixer(this._scene3D, {
			rename: (v) => v.replace('Action', '').split('.')[0],
		});

		const textures = $assets.textures['clinique'];

		const _materials = {
			pipesacrak: new MeshBasicMaterial({ map: textures['atlas_map'] }),
			murs: new MeshBasicMaterial({ map: textures['murs_map'] }),
			tableaux: new MeshBasicMaterial({ map: textures['door_tableaux_map'] }),
			computers: new MeshBasicMaterial({ map: textures['computers_map'] }),
			cassette: new MeshBasicMaterial({ map: textures['cassettepostit_map'] }),
			contrat: new MeshBasicMaterial({ map: textures['contrat_map'] }),
		};
		_materials.ecrans = _materials.computers;
		_materials.porte = _materials.tableaux;

		const _emissiveMaterials = {
			contrat: new MeshBasicMaterial({ map: textures['contrat_emissive'] }),
		};

		const datas = scenesDatas.clinique;
		this.datas = datas;
		Object.keys(datas).forEach((k) => {
			Object.assign(datas[k], { material: _materials[k] });
			if (_emissiveMaterials[k])
				Object.assign(datas[k], { emissiveMaterial: _emissiveMaterials[k] });
		});

		this._allMeshes = [];
		const _objects = [];
		this.interactiveObjects = {};

		scene.traverse((child) => {
			if (!child.isMesh || !child.material) return;

			if (datas[child.name]) {
				const { class: Class, material } = datas[child.name];
				child.material = material;
				this._allMeshes.push(child);
				if (Class) {
					const obj = new Class({ name: child.name, mesh: child });
					this.interactiveObjects[child.name] = obj;
					_objects.push(obj);
				}
			}
		});

		_objects.forEach((o) => this.add(o));
		this.base.add(scene);

		$hooks.afterStart.watchOnce(this.createSheets.bind(this));
		$composer.$hooks.beforeRenderEmissive.watch(this.onBeforeRenderEmissive.bind(this)); // prettier-ignore
		$composer.$hooks.afterRenderEmissive.watch(this.onAfterRenderEmissive.bind(this)); // prettier-ignore
	}

	onBeforeRenderEmissive() {
		for (let i = 0; i < this._allMeshes.length; i++) {
			const mesh = this._allMeshes[i];
			const data = this.datas[mesh.name];
			if (data?.emissiveMaterial) mesh.material = data.emissiveMaterial;
		}
	}

	onAfterRenderEmissive() {
		for (let i = 0; i < this._allMeshes.length; i++) {
			const mesh = this._allMeshes[i];
			const data = this.datas[mesh.name];
			if (data?.material) mesh.material = data.material;
		}
	}

	async createSheets() {
		this.$bgm = this.webgl.$audio.play('clinique/bgm', { volume: 1 });
		this.$bgm.pause({ fade: 0 });

		this.$sheet = this.$project.getSheet('intro');
		await this.$sheet.attachAudio('clinique/intro');
		this.$sheet.$addCamera();
		this.$sheet.$composer(['global', 'bokeh', 'lut', 'bloom', 'rgbShift']);
	}

	async enter() {
		this._hasStarted = false;

		const { $scenes, $povCamera, $app } = this.webgl;
		$povCamera.onSceneSwitch(this);

		/// #if __DEBUG__
		// $povCamera.setPosition([1.6618, 3.09741, 5.98017]);
		// $povCamera.$setState('free');
		/// #endif

		const uiScene = $scenes.ui.component;
		uiScene.subtitles.setColor($app.$store.subtitles.colors.white);
	}

	async leave() {
		const { $povCamera } = this.webgl;
		if (!$povCamera.controls.state.is($povCamera.controls.states.GENERIQUE))
			this.$bgm.stop({ fade: 2000 });
	}

	async start(force) {
		if (this._hasStarted && !force) return;
		if (this._hasStarted) {
			this.$sheet.stop();
			await wait(1);
		}
		this._hasStarted = true;

		const { cassette, porte, contrat } = this.interactiveObjects;
		const { $povCamera, $audio, $raycast } = this.webgl;

		$povCamera.$setState('cinematic');
		$povCamera.isSfxActive = false; // force to disable sfx

		cassette.reset();
		cassette.show();

		// cassette.enableInteraction();
		contrat.disableInteraction();
		porte.disableInteraction();

		this.$sheet.reset();
		this.$bgm.play({ fade: 4000 });

		$raycast.enable();
		await this.$sheet.play();

		cassette.enableInteraction();
		$povCamera.$setState('focus');
	}

	reset() {
		const { cassette, porte } = this.interactiveObjects;
		cassette.reset();
		porte.reset();
	}
}
