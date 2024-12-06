import { BaseBedroomInteractiveObject } from '../base/BaseInteractiveObject';

export class Guitare extends BaseBedroomInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.audioId = 'bedroom/guitare';
		this.objectName = 'guitare';
	}
}
