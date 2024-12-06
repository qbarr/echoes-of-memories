import { BaseBedroomInteractiveObject } from '../base/BaseInteractiveObject';

export class Platine extends BaseBedroomInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.audioId = 'bedroom/platine';
		this.objectName = 'platine';
	}
}
