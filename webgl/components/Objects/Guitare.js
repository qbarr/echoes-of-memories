import { BaseInteractiveObject } from './base/BaseInteractiveObject';

export class Guitare extends BaseInteractiveObject {
	static isSimpleObject = true;

	init() {
		const m = (this.mesh = this.props.mesh);

		this.base.position.copy(m.position.clone());
		this.base.rotation.copy(m.rotation.clone());

		m.position.set(0, 0, 0);
		m.rotation.set(0, 0, 0);

		this.base.add(m);
	}
}
