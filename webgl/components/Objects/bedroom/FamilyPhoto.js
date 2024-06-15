import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class FamilyPhoto extends BaseInteractiveObject {
	init() {
		this.isInteractiveObject = true;
		this.audio = null;
	}
}
