import BaseScene from '#webgl/core/BaseScene';

import { TheatreSheet } from '#webgl/plugins/theatre/utils/TheatreSheet.js';
import { MeshBasicMaterial, Object3D } from 'three';
import { scenesDatas } from './datas';

export default class CliniqueScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		const { $assets, $theatre } = this.webgl;

		this.$project = $theatre.get('Clinique');

		const scene = $assets.objects.clinique.model.scene;
		const textures = $assets.textures['clinique'];

		const _textures = {
			pipesacrak: new MeshBasicMaterial({ map: textures['bed_board_map'] }),
			murs: new MeshBasicMaterial({ map: textures['murs_map'] }),
			tableaux: new MeshBasicMaterial({ map: textures['door_tableaux_map'] }),
			computers: new MeshBasicMaterial({ map: textures['computers_map'] }),
			cassette: new MeshBasicMaterial({ map: textures['cassette_map'] }),
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
			// this.log(child.name);
			// this.log(datas[child.name]);
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

		// console.log(this.webgl.$statesMachine);
		// this.$statesMachine = this.webgl.$statesMachine.create('Clinique', { filter: 'clinique' });

		this.webgl.$hooks.afterStart.watchOnce(this.createSheets.bind(this));
		// this.createSheets();
	}

	async createSheets() {
		this.$sheet = this.$project.getSheet('intro');
		// const audio = this.webgl.$assets.audios['clinique']['intro'];
		await this.$sheet.attachAudio('clinique/intro');
		this.$sheet.$addCamera();
		this.$sheet.$composer(['global', 'bokeh', 'lut', 'bloom', 'rgbShift']);
	}

	async enter() {
		this.log('enter');
		const { $scenes, $povCamera } = this.webgl;

		const { cassette, porte } = this.interactiveObjects;

		const uiScene = $scenes.ui.component;
		uiScene.subtitles.setColor('white');

		console.log('uiScene', uiScene);

		$povCamera.onSceneSwitch(this);

		setTimeout(async () => {
			$povCamera.$setState('cinematic');

			cassette.enableInteraction();
			cassette.reset();
			cassette.show();

			porte.disableInteraction();

			this.$sheet.reset();
			await this.$sheet.play();

			$povCamera.$setState('focus');
		}, 2000);
	}

	async leave() {
		this.log('leave');
	}

	update() {}
}
