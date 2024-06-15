import BaseScene from '#webgl/core/BaseScene';

import { TheatreSheet } from '#webgl/plugins/theatre/utils/TheatreSheet.js';
import { MeshBasicMaterial, Object3D } from 'three';
import { scenesDatas } from './datas';

const BLACK_MAT = new MeshBasicMaterial({ color: 0x000000 });

export default class TVRoomScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		const { $assets, $theatre } = this.webgl;

		this.$project = $theatre.get('TV-Room');

		const scene = $assets.objects['tv-room'].model.scene;
		const textures = $assets.textures['tv-room'];

		const vhsMap = $assets.textures.clinique.cassette_map;

		const _textures = {
			sol: new MeshBasicMaterial({ map: textures['sol_map'] }),
			objets: new MeshBasicMaterial({ map: textures['atlas_map'] }),
			ecran: new MeshBasicMaterial({ map: textures['atlas_map'] }),
			VHS: new MeshBasicMaterial({ map: vhsMap }),
		};

		const datas = scenesDatas['tv-room'];
		Object.keys(datas).forEach((k) => {
			Object.assign(datas[k], { texture: _textures[k] });
		});

		const _objects = [];
		this.interactiveObjects = {};

		scene.traverse((child) => {
			if (!child.isMesh || !child.material) return;
			this.log(child.name);
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

		this.hide();
		this.webgl.$hooks.afterStart.watchOnce(this.createSheets.bind(this));
	}

	hide() {
		this.base.visible = false;
	}

	show() {
		this.base.visible = true;
	}

	async createSheets() {
		const enterSheet = this.$project.getSheet('enter');

		await enterSheet.attachAudio('tv-room/enter');
		enterSheet.$bool('Reveal Scene', { value: false }).onChange((v) => {
			v ? this.show() : this.hide();
			this.log('Reveal Scene', v);
		});
		enterSheet.$addCamera();
	}

	async enter() {
		this.webgl.$povCamera.onSceneSwitch(this);
	}

	async leave() {
		this.log('leave');
	}

	update() {}
}
