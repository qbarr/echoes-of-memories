import { BaseBedroomInteractiveObject } from '../base/BaseInteractiveObject';

export class Peinture extends BaseBedroomInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.audioId = 'bedroom/peinture';
		this.objectName = 'peinture';
	}
}
