import BaseScene from '#webgl/core/BaseScene';
import { MainCamera } from '../Cameras/MainCamera';
import { MSDFTextMesh } from '../Text';

import { wait } from '#utils/async';
import { Cube } from '../Objects/Cube';
import { BoxGeometry, Color, Mesh, MeshBasicMaterial, Sphere, SphereGeometry, Vector3 } from 'three';
import { Particles } from '../Particles/Particles';
import { ParticlesSystem } from '../Particles/ParticlesSystem';

export default class MainScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		this.camera = this.add(MainCamera);
		const box = new BoxGeometry(7, 7, 7);
		box.computeBoundingBox();
		const mesh = new Mesh(box, new MeshBasicMaterial({ color: 'red', wireframe: true}));
		this.particles = this.add(ParticlesSystem, { instance: this.webgl.$assets.objects.scene1.scene.children[0].geometry.clone()})


		// this.particles = this.add(Particles, { count: 10000, position: new Vector3(0, 0, 0), options: {} })
		// this.particles = this.add(ParticlesSystem, { count: 300, boundingBox: box.boundingBox, options: {} })
		// mesh.scale.setScalar(0.2);
		// mesh.position.z -= 7
		// this.addObject3D(mesh);
		// this.direction = new Vector3()
		// this.mesh = mesh

		// 	font: 'VCR_OSD_MONO',
		// 	content: 'Home',
		// 	centerMesh: true,
		// 	color: new Color('blue'),
		// });
		// t.needBloom = true;

		// const cube1 = this.addObject3D(new Mesh(
		// 	new BoxGeometry(1, 1, 1),
		// 	new MeshBasicMaterial({ color: 'red' })
		// ));
		// const cube2 = this.add(Cube, { color: 'blue' });
		// cube2.base.position.x = 2;
		// const cube3 = this.add(Cube, { color: 'green' });
		// cube3.base.position.x = -2;
	}

	update() {
		// this.camera.base.getWorldDirection( this.direction )
		// this.mesh.position.copy( this.camera.base.position ).add(this.direction.multiplyScalar(2))
		// this.particles.particles.gpgpu.base.variables.particles.material.uniforms.uCameraPosition.value = this.camera.base.position
	}
}
