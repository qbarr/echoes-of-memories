import BaseScene from '#webgl/core/BaseScene';
import { Color } from 'three';
import { UICamera } from '../Cameras/UICamera';
import { MSDFTextMesh } from '../Text';
import { map } from '#utils/maths';

import { Subtitles } from '../Subtitles/Subtitles';

export default class UIScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		this.camera = this.add(UICamera);

		// this.t = this.add(MSDFTextMesh, {
		// 	font: 'VCR_OSD_MONO',
		// 	content: 'lorem ipsum dolot sit amet, consectetur adipiscing elit.',
		// 	width: 400,
		// 	centerMesh: true,
		// 	align: 'left',
		// });

		this.add(Subtitles);
	}

	async enter() {
		this.log('enter');
	}

	async leave() {
		this.log('leave');
	}

	update() {}
}
