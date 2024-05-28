import BaseScene from '#webgl/core/BaseScene';
import { UICamera } from '../Cameras/UICamera';
import { MSDFTextMesh } from '../Text';

export default class UIScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		this.camera = this.add(UICamera);

		this.text = this.add(MSDFTextMesh, {
			font: 'VCR_OSD_MONO',
			content: 'UI Scene',
			centerMesh: true,
		});
		this.text.position.set(0, -40, 0);
	}
}
