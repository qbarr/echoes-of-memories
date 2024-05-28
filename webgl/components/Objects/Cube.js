import { BoxGeometry, Mesh, MeshNormalMaterial } from 'three';
import { BaseInteractiveObject } from './base/BaseInteractiveObject';

export class Cube extends BaseInteractiveObject {
	init() {
		// this.needBloom = true;

		const geometry = new BoxGeometry(1, 1, 1);
		const material = new MeshNormalMaterial();
		const mesh = new Mesh(geometry, material);

		this.base.add(mesh);

		this.padding.set(1);
	}

	update() {
		this.base.rotation.y += 0.01;
		this.base.position.y = Math.sin(this.base.rotation.y);
	}
}
