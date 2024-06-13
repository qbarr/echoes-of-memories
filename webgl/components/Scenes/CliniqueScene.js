import BaseScene from '#webgl/core/BaseScene';

import { MeshBasicMaterial } from 'three';
import { useTheatre } from '#webgl/utils/useTheatre.js';
import { scenesDatas } from './datas';
import { types } from '@theatre/core';
import { TheatreSheet } from '#webgl/plugins/theatre/utils/TheatreSheet.js';

export default class CliniqueScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		const { $assets } = this.webgl;

		const scene = $assets.objects['clinique-model'].scene;
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

		// Override $theatre
		useTheatre(this, 'Clinique-Scene');
		useTheatre(this, 'Clinique-Camera');

		this.webgl.$hooks.afterStart.watchOnce(this.createSheets.bind(this));
	}

	async createSheets() {
		const { clinique, bedroom } = scenesDatas;

		const cameraProject = this.$theatre['Clinique-Camera'];

		/// #if __DEBUG__
		// Need an await only if we use @theatre/studio
		await cameraProject.ready;
		/// #endif

		const introSheet = new TheatreSheet('intro', { project: cameraProject });
		this.$sheets['Clinique-Camera'].intro = introSheet;

		const audio = (await import('/assets/audios/clinique/intro.wav')).default;
		await introSheet.attachAudio(audio, 1);
		introSheet.$target('camera', this.webgl.$povCamera.target, {
			nudgeMultiplier: 0.01,
		});
		introSheet.$composer(['global', 'bokeh', 'lut', 'bloom', 'rgbShift']);
	}

	async launch() {
		await this.$sheets['Clinique-Camera'].intro.play();
		console.log('intro played');

		this.log('TUTO INTERACTION');
		// interactions enabled
	}

	async enter() {
		this.log('enter');
		this.webgl.$povCamera.onSceneSwitch(this);
		this.camera = this.add(this.webgl.$povCamera);
		// this.camera.setPosition([-2.71175, 3.13109, 4.39142]);

		setTimeout(() => {
			this.launch();
		}, 1000);
	}

	async leave() {
		this.log('leave');
	}

	update() {}
}
