import { deferredPromise } from '#utils/async/deferredPromise.js';
import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class TV extends BaseInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.isAlreadySit = false;

		this.onKeyDown = this.awaitPlayOut.bind(this);
	}

	createSheets() {
		this.$sheetSitDown = this.$project.getSheet('Seat-Down');
		this.$sheetSitDown.$addCamera();

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

		await this.$sheetIn.play();
		$povCamera.$setState('focus');

		this.dp = deferredPromise();
		window.addEventListener('keydown', this.onKeyDown);
		await this.dp;

		console.log('HERE');
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

	reset() {
		super.reset();
	}
}
