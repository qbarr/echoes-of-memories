import { BaseBedroomInteractiveObject } from '../base/BaseInteractiveObject';

export class Livres extends BaseBedroomInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.objectName = 'livre';
		this.audioId = 'bedroom/livre';
	}
}
