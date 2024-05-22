import { TorusGeometry, Mesh, MeshBasicMaterial, Color, BoxGeometry } from 'three';

import { webgl } from '#webgl/core';
import BaseCamera from '#webgl/core/BaseCamera';
import BaseScene from '#webgl/core/BaseScene';
import { lerp } from '#utils/maths';
import { wait } from '#utils/async';



export default class TestScene extends BaseScene {
	mixins = [ 'debugCamera' ]

	init() {
		this.camera = this.add(BaseCamera);
		this.camera.base.position.set(0, 0.2, 1).multiplyScalar(5);
		this.camera.base.lookAt(0, 0, 0);

		this.meshColor = new Color(0x158bdc);

		this.mesh = new Mesh(
			new BoxGeometry(1, 1, 1),
			new MeshBasicMaterial({ color: this.meshColor })
		);

		this.addObject3D(this.mesh);

		this.scale = 0
	}

	async enter() {
		this.log('enter');
		this.mesh.scale.set(0, 0, 0)
		this.scale = 1
	}

	async leave() {
		this.log('leave');
		this.scale = 0
		await wait(1000)
	}

	update() {
		this.mesh.rotation.y -= 0.01;
		this.mesh.rotation.x = Math.cos(webgl.$time.elapsed * 0.0003) * 0.9;


		this.mesh.scale.x = lerp(this.mesh.scale.x, this.scale, 0.1)
		this.mesh.scale.y = lerp(this.mesh.scale.y, this.scale, 0.1)
		this.mesh.scale.z = lerp(this.mesh.scale.z, this.scale, 0.1)
	}
}
