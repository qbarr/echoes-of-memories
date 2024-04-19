import { TorusGeometry, Mesh, MeshBasicMaterial, Color, BoxGeometry } from 'three';

import { webgl } from '#webgl/core';
import BaseCamera from '#webgl/core/BaseCamera';
import BaseScene from '#webgl/core/BaseScene';


export default class Scene extends BaseScene {
	mixins = [ 'debugCamera' ]

	init() {
		this.camera = this.add(BaseCamera);
		this.camera.base.position.set(0, 0.2, 1).multiplyScalar(5);
		this.camera.base.lookAt(0, 0, 0);

		this.meshColor = new Color(0xfec238);

		this.mesh = new Mesh(
			new BoxGeometry(1, 1, 1),
			new MeshBasicMaterial({ color: this.meshColor })
		);

		this.addObject3D(this.mesh);
	}

	update() {
		this.meshColor.offsetHSL(0.003, 0, 0);
		this.mesh.material.color = this.meshColor;
		this.mesh.rotation.y -= 0.01;
		this.mesh.rotation.x = Math.cos(webgl.$time.elapsed * 0.0003) * 0.9;
	}
}
