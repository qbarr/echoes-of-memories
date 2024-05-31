import { IcosahedronGeometry, Mesh, MeshNormalMaterial, SphereGeometry } from 'three';
import { BaseSoundObject } from './base/BaseSoundObject';

export class Sphere extends BaseSoundObject {
	init() {
		const geometry = new SphereGeometry(1, 32, 32);
		const material = new MeshNormalMaterial();
		const mesh = new Mesh(geometry, material);
		mesh.position.set(0, 0, 0);
		this.base.add(mesh);
	}

	update() {
		// console.log('[Subtitles] update');

		this.base.rotation.x += 0.005;
		this.base.position.x = Math.sin(this.base.rotation.x) * Math.cos(this.base.rotation.x) * 20;

		this.base.rotation.z += 0.005;
		this.base.position.z = Math.cos(this.base.rotation.z) * 20;
	}
}
