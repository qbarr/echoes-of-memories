import { BaseBedroomInteractiveObject } from '../base/BaseInteractiveObject';

export class Vinyles extends BaseBedroomInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.audioId = 'bedroom/vinyle';
		this.objectName = 'vinyle';
	}
}
