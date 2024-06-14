import BaseScene from '#webgl/core/BaseScene';
import {
	AdditiveBlending,
	Mesh,
	MeshBasicMaterial,
	PlaneGeometry,
	ShaderMaterial,
} from 'three';
import { UICamera } from '../Cameras/UICamera';

import { Subtitles } from '../Interface/Subtitles';
import { Crosshair } from '../Interface/Crosshair';

export default class UIScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		this.camera = this.add(UICamera);

		this.subtitles = this.add(Subtitles);
		this.crosshair = this.add(Crosshair);
	}

	async enter() {
		this.log('enter');
	}

	async leave() {
		this.log('leave');
	}

	update() {}
}
