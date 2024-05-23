
import BaseScene from '#webgl/core/BaseScene';
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';

import { UICamera } from '../Cameras/UICamera';
import { MSDFTextMesh } from '../Text';



export default class UIScene extends BaseScene {
	init() {
		this.camera = this.add(UICamera);

		this.add(MSDFTextMesh, {
			font: 'VCR_OSD_MONO',
			content: 'Home',
		});

		// const cube = new Mesh(
		// 	new BoxGeometry(1, 1, 1),
		// 	new MeshBasicMaterial({ color: 0x00ff00 })
		// );
		// this.addObject3D(cube);
	}

	async enter() {
		this.log('enter');
	}

	async leave() {
		this.log('leave');
		// await wait(1000)
	}

	update() {
	}
}

