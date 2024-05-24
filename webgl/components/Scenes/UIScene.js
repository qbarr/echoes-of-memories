
import BaseScene from '#webgl/core/BaseScene';
import { BoxGeometry, Mesh } from 'three';
import { UICamera } from '../Cameras/UICamera';
import { MSDFTextMesh } from '../Text';
import { map } from '#utils/maths';


export default class UIScene extends BaseScene {
	mixins = [ 'debugCamera' ]

	init() {
		this.camera = this.add(UICamera);

		// this.add(MSDFTextMesh, {
		// 	font: 'VCR_OSD_MONO',
		// 	content: 'Home',
		// 	centerMesh: true,
		// });

		// const cubeGeo = new BoxGeometry(.3,.3,.3);
		// this.cubeMesh1 = new Mesh(cubeGeo)
		// this.cubeMesh2 = new Mesh(cubeGeo)
		// this.cubeMesh3 = new Mesh(cubeGeo)
		// this.cubeMesh4 = new Mesh(cubeGeo)

		// const dbs = this.webgl.$renderer.drawingBufferSize;
		// const ratio = dbs.value.x / dbs.value.y;

		// this.cubeMesh1.position.set(-1 * ratio, -1, 0);
		// this.cubeMesh2.position.set(1 * ratio, -1, 0);
		// this.cubeMesh3.position.set(-1 * ratio, 1, 0);
		// this.cubeMesh4.position.set(1 * ratio, 1, 0);

		// this.base.add(this.cubeMesh1, this.cubeMesh2, this.cubeMesh3, this.cubeMesh4);
	}

	async enter() {
		this.log('enter');
	}

	async leave() {
		this.log('leave');
	}

	update() {
		// const dbs = this.webgl.$renderer.drawingBufferSize;
		// const ratio = dbs.value.x / dbs.value.y;

		// this.cubeMesh1.position.set(-1 * ratio, -1, 0);
		// this.cubeMesh2.position.set(1 * ratio, -1, 0);
		// this.cubeMesh3.position.set(-1 * ratio, 1, 0);
		// this.cubeMesh4.position.set(1 * ratio, 1, 0);
	}
}

