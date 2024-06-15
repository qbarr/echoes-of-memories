import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Door extends BaseInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.audio = null;
	}
}
