import BaseScene from '#webgl/core/BaseScene';

import { TheatreSheet } from '#webgl/plugins/theatre/utils/TheatreSheet.js';
import { Mesh, MeshBasicMaterial, Object3D } from 'three';
import { scenesDatas } from './datas';
import { wait } from '#utils/async/wait.js';
import { useAnimationsMixer } from '#webgl/utils/useAnimationsMixer.js';

export default class CliniqueScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		const { $assets, $theatre, $audio } = this.webgl;

		this._hasStarted = false;

		this.$project = $theatre.get('Clinique');

		this._scene3D = $assets.objects.clinique.model;
		const scene = this._scene3D.scene;
		this.$mixer = useAnimationsMixer(this._scene3D, {
			rename: (v) => v.replace('Action', '').split('.')[0],
		});

		const textures = $assets.textures['clinique'];

		const _textures = {
			pipesacrak: new MeshBasicMaterial({ map: textures['atlas_map'] }),
			murs: new MeshBasicMaterial({ map: textures['murs_map'] }),
			tableaux: new MeshBasicMaterial({ map: textures['door_tableaux_map'] }),
			computers: new MeshBasicMaterial({ map: textures['computers_map'] }),
			cassette: new MeshBasicMaterial({ map: textures['cassettepostit_map'] }),
			contrat: new MeshBasicMaterial({ map: textures['contrat_map'] }),
		};
		_textures.ecrans = _textures.computers;
		_textures.porte = _textures.tableaux;

		const datas = scenesDatas.clinique;
		Object.keys(datas).forEach((k) => {
			Object.assign(datas[k], { texture: _textures[k] });
		});

		const _objects = [];
		this.interactiveObjects = {};

		scene.traverse((child) => {
			if (!child.isMesh || !child.material) return;

			if (datas[child.name]) {
				const { class: Class, texture } = datas[child.name];
				child.material = texture;
				if (Class) {
					const obj = new Class({ name: child.name, mesh: child });
					this.interactiveObjects[child.name] = obj;
					_objects.push(obj);
				}
			}
		});

		_objects.forEach((o) => this.add(o));
		this.base.add(scene);

		this.webgl.$hooks.afterStart.watchOnce(this.createSheets.bind(this));
	}

	async createSheets() {
		this.$bgm = this.webgl.$audio.play('clinique/bgm', { volume: 2 });
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
		$povCamera.setPosition([1.6618, 3.09741, 5.98017]);
		$povCamera.$setState('free');
		/// #endif

		const uiScene = $scenes.ui.component;
		uiScene.subtitles.setColor($app.$store.subtitles.colors.white);
	}

	async leave() {
		this.log('leave');
	}

	async start(force) {
		if (this._hasStarted && !force) return;
		if (this._hasStarted) {
			this.$sheet.stop();
			await wait(1);
		}
		this._hasStarted = true;

		const { cassette, porte } = this.interactiveObjects;
		const { $povCamera, $audio } = this.webgl;

		$povCamera.$setState('cinematic');

		cassette.reset();
		cassette.show();

		// cassette.disableInteraction();
		porte.disableInteraction();

		this.$sheet.reset();
		this.$bgm.play();

		await this.$sheet.play();

		cassette.enableInteraction();
		$povCamera.$setState('focus');
	}
}
