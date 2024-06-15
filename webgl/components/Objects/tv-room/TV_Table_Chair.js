import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

// oe nsm le nom
export class TV_Table_Chair extends BaseInteractiveObject {
	init() {
		this.isSimpleObject = true;
		// this.audioId = 'common/footstep';
	}

	createSheets() {
		this.$sheet = this.$project.getSheet('goTo-center');
		// this.$sheet.attachAudio(this.audioId);
		this.$sheet.$addCamera();
	}

	reset() {
		super.reset();
	}
}
