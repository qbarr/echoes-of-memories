import { watch } from 'vue';
import { Object3D, Color, Vector3 } from 'three';

import { UiBackground, UiText, UiButton } from '../components';
import { BaseUiView } from '#webgl/core/BaseUiView.js';

export class Pause extends BaseUiView {
	init() {
		const { $viewport, $subtitles } = this.webgl;
		const { x: vw, y: vh } = $viewport.size.value;

		this.vw = vw;
		this.vh = vh;

		this.createTitle();
		this.createButton();

		this.goToGame = this.goToGame.bind(this);
		this.goToSettings = this.goToSettings.bind(this);
		this.goToCredits = this.goToCredits.bind(this);
	}

	createTitle() {
		this.title = this.add(UiText, {
			text: {
				name: 'UiPauseTitle',
				content: '-----PAUSE-----',
				color: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
			},
			justifyContent: 'left',
		});
		this.title.base.position.add(new Vector3(-7, 6, 0));
	}

	createButton() {
		const { left } = this.camera.base;
		const padding = 8;

		this.backButton = this.add(UiButton, {
			text: {
				name: 'UiBackButton',
				content: 'REPRENDRE',
			},
			justifyContent: 'left',
			callback: this.goToGame,
		});
		this.settingsButton = this.add(UiButton, {
			text: {
				name: 'UiSettingsButton',
				content: 'PARAMETRES',
			},
			justifyContent: 'left',
			callback: this.goToSettings,
		});
		this.creditsButton = this.add(UiButton, {
			text: {
				name: 'UiCreditsButton',
				content: 'CREDITS',
			},
			justifyContent: 'left',
			callback: this.goToCredits,
		});

		this.translate(this.backButton, { x: -7, y: 0 });
		this.translate(this.settingsButton, { x: -7, y: -5 });
		this.translate(this.creditsButton, { x: -7, y: -10 });
	}

	afterInit() {
		this.hide();
		this.bindEvents();
	}

	bindEvents() {
		document.addEventListener('keydown', this.onKeyDown.bind(this));
	}

	onKeyDown(event) {
		const { id: currentState } = this.scene.$statesMachine.currentState;
		console.log('currentState:', currentState);
		if (event.code === 'KeyP' && currentState === 'hud')
			this.scene.$setState('pause');
	}

	goToGame() {
		this.scene.$setState('hud');
	}

	goToSettings() {
		this.scene.$setState('settings');
	}

	goToCredits() {
		this.scene.$setState('credits');
	}
}
