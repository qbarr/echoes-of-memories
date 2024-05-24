import { BoxGeometry, Mesh, MeshNormalMaterial } from 'three';
import { BaseInteractiveObject } from './base/BaseInteractiveObject';

export class Cube extends BaseInteractiveObject {
	init() {
		const geometry = new BoxGeometry(1, 1, 1);
		const material = new MeshNormalMaterial();
		const mesh = new Mesh(geometry, material);
		mesh.position.set(0, 0, 0);
		this.base.add(mesh);

		this.padding.set(1)
	}
}
