import { Object3D, PlaneGeometry, MeshNormalMaterial, Mesh } from 'three';
import BaseComponent from '#webgl/core/BaseComponent';

export class Grid extends BaseComponent {
	constructor(props = {}) {
		super(props);

		this.base = new Object3D();
	}

	init() {
		const geo = new PlaneGeometry(100, 100, 10, 10);
		const mat = new MeshNormalMaterial({
			wireframe: true,
		});
		const mesh = new Mesh(geo, mat);
		mesh.rotation.x = -Math.PI / 2;
		mesh.position.y = -2;
		this.base.add(mesh);
	}
}
