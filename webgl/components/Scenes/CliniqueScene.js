import BaseScene from '#webgl/core/BaseScene';

import { TheatreSheet } from '#webgl/plugins/theatre/utils/TheatreSheet.js';
import { MeshBasicMaterial, Object3D } from 'three';
import { scenesDatas } from './datas';

export default class CliniqueScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		const { $assets } = this.webgl;

		const scene = $assets.objects.clinique.model.scene;
		const textures = $assets.textures['clinique'];

		const _textures = {
			pipesacrak: new MeshBasicMaterial({
				map: textures['bed_board_map'],
			}),
			murs: new MeshBasicMaterial({
				map: textures['murs_map'],
			}),
			tableaux: new MeshBasicMaterial({
				map: textures['door_tableaux_map'],
			}),
			computers: new MeshBasicMaterial({
				map: textures['computers_map'],
			}),
			cassette: new MeshBasicMaterial({
				map: textures['cassette_map'],
			}),
			contrat: new MeshBasicMaterial({
				map: textures['contrat_map'],
			}),
		};
		_textures.ecrans = _textures.computers;
		_textures.porte = _textures.tableaux;

		const datas = scenesDatas.clinique;
		Object.keys(datas).forEach((k) => {
			Object.assign(datas[k], { texture: _textures[k] });
		});

		const _objects = [];

		scene.traverse((child) => {
			if (!child.isMesh || !child.material) return;
			// this.log(child.name);
			// this.log(datas[child.name]);
			if (datas[child.name]) {
				const { class: Class, texture } = datas[child.name];
				child.material = texture;
				if (Class) {
					const obj = new Class({ name: child.name, mesh: child });
					_objects.push(obj);
				}
			}
		});

		_objects.forEach((o) => this.add(o));
		this.base.add(scene);

		// console.log(this.webgl.$statesMachine);
		// this.$statesMachine = this.webgl.$statesMachine.create('Clinique', { filter: 'clinique' });

		// this.webgl.$hooks.afterStart.watchOnce(this.createSheets.bind(this));
		this.createSheets();
	}

	async createSheets() {
		const { clinique, bedroom } = scenesDatas;

		const cameraProject = this.webgl.$theatre.get('Clinique-Camera');

		const introSheet = cameraProject.getSheet('intro');

		// const audio = (await import('/assets/audios/clinique/intro.wav')).default;
		const audio = this.webgl.$assets.audios['clinique']['intro'];
		await introSheet.attachAudio(audio, 1);
		introSheet.$compound('Camera', {
			position: { value: this.webgl.$povCamera.target },
			lat: this.webgl.$povCamera.controls.lat,
			lon: this.webgl.$povCamera.controls.lon,
		});
		introSheet.$composer(['global', 'bokeh', 'lut', 'bloom', 'rgbShift']);
	}

	async enter() {
		this.webgl.$povCamera.onSceneSwitch(this);
		this.camera = this.add(this.webgl.$povCamera);
		// this.camera.setPosition([-2.71175, 3.13109, 4.39142]);

		/// #if !__DEBUG__
		setTimeout(() => {
			this.webgl.$setState('intro');
		}, 1000);
		/// #endif
	}

	async leave() {
		this.log('leave');
	}

	update() {}
}
