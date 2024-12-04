import BaseScene from '#webgl/core/BaseScene';

import { MeshBasicMaterial } from 'three';

import { scenesDatas } from './datas';
import { w } from '#utils/state';

const BLACK_MAT = new MeshBasicMaterial({ color: 0x000000 });

export default class TVRoomScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		const { $assets, $theatre } = this.webgl;

		this.$project = $theatre.get('TV-Room');

		this._hasStarted = false;

		const scene = $assets.objects['tv-room'].model.scene;
		const textures = $assets.textures['tv-room'];

		const vhsMap = $assets.textures.clinique.cassette_map;

		const _textures = {
			sol: new MeshBasicMaterial({ map: textures['sol_map'] }),
			desk: new MeshBasicMaterial({ map: textures['atlas_map'] }),
			VHS: new MeshBasicMaterial({ map: vhsMap }),
		};

		['ecran', 'tv', 'lecteur', 'keyboard'].forEach(
			(k) => (_textures[k] = _textures.desk),
		);

		const datas = scenesDatas['tv-room'];
		scene.traverse((child) => {
			if (!child.isMesh || !child.material) return;
			if (child.name.includes('raycastable')) {
				const idRef = child.name.split('_')[0];
				const o = datas[idRef];
				o.raycastMesh = child;
				child.visible = false;
			}
		});
		Object.keys(datas).forEach((k) => {
			Object.assign(datas[k], { texture: _textures[k] });
		});

		const _objects = [];
		this.interactiveObjects = {};
		this.cassette = null;
		this.screen = null;

		scene.traverse((child) => {
			if (!child.isMesh || !child.material) return;
			if (child.name.includes('raycastable')) return;

			const data = datas[child.name];
			if (child.name === 'VHS') {
				this.cassette = child;
				this.cassette.visible = false;
			}

			if (data) {
				const { class: Class, texture } = data;
				child.material = texture;
				if (Class) {
					const obj = new Class({ name: child.name, mesh: child, data });
					this.interactiveObjects[child.name] = obj;
					if (child.name === 'ecran') this.screen = obj;
					_objects.push(obj);
				}
			}
		});

		_objects.forEach((o) => this.add(o));
		this.base.add(scene);

		this.webgl.$hooks.afterStart.watchOnce(this.createSheets.bind(this));
	}

	async createSheets() {
		this.$sheet = this.$project.getSheet('enter');

		await this.$sheet.attachAudio('tv-room/enter');
		this.$sheet.$addCamera();
		this.$sheet.$composer(['global']);
	}

	async enter() {
		this._hasStarted = false;

		const { $povCamera, $scenes, $app } = this.webgl;
		$povCamera.onSceneSwitch(this);

		const uiScene = $scenes.ui.component;
		uiScene.subtitles.setColor($app.$store.subtitles.colors.white);
	}

	async leave() {
		this.log('leave');
	}

	async start() {
		const { $povCamera, $raycast } = this.webgl;

		this._hasStarted = true;

		const { tv, lecteur, desk } = this.interactiveObjects;

		tv.disableInteraction();
		lecteur.disableInteraction();
		desk.disableInteraction();

		$povCamera.$setState('cinematic');

		await this.$sheet.play();

		desk.enableInteraction();
		// lecteur.enableInteraction();
		// tv.enableInteraction();
		$raycast.enable();
		$povCamera.$setState('focus');
	}

	reset() {
		this.screen.setInstructionsScreen();
	}
}
