import { BaseBedroomInteractiveObject } from '../base/BaseInteractiveObject';

export class Nounours extends BaseBedroomInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.objectName = 'nounours';
		this.audioId = 'bedroom/nounours';
	}
}
