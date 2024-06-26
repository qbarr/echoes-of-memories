import { deferredPromise } from '#utils/async/deferredPromise.js';
import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class TV extends BaseInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.isAlreadySit = false;
		this.hasReadInstructions = false;

		this.onKeyDown = this.awaitPlayOut.bind(this);
	}

	async createSheets() {
		this.$sheetSitDown = this.$project.getSheet('Seat-Down');
		this.$sheetSitDown.$addCamera();

		this.$sheetReadInstructions = this.$project.getSheet('Read-Instructions');
		await this.$sheetReadInstructions.attachAudio('tv-room/instructions');
		this.$sheetReadInstructions.$addCamera();

		this.$sheetIn = this.$project.getSheet('Read-Instructions-In');
		this.$sheetIn.$addCamera();

		this.$sheetOut = this.$project.getSheet('Read-Instructions-Out');
		this.$sheetOut.$addCamera();
	}

	async onClick() {
		super.onClick();
		this.disableInteraction();

		const { lecteur } = this.scene.interactiveObjects;
		const { $povCamera } = this.webgl;

		$povCamera.$setState('cinematic');

		if (!this.isAlreadySit) {
			await this.$sheetSitDown.play();
			this.isAlreadySit = true;
		}

		if (this.hasReadInstructions) {
			await this.$sheetIn.play();
			$povCamera.$setState('focus');

			this.dp = deferredPromise();
			window.addEventListener('keydown', this.onKeyDown);
			await this.dp;
		} else {
			await this.$sheetReadInstructions.play();
			this.hasReadInstructions = true;
		}

		console.log('enable lecteur', lecteur);
		this.enableInteraction();
		lecteur.enableInteraction();

		$povCamera.$setState('free');
	}

	awaitPlayOut(ev) {
		if (ev.code === 'Space') {
			this.$sheetOut.play().then(this.dp.resolve);
			window.removeEventListener('keydown', this.onKeyDown);
		}
	}
}
