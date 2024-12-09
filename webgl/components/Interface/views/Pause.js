import { watch } from 'vue';
import { Object3D, Color, Vector3 } from 'three';

import { UiBackground, UiText, UiButton } from '../components';
import { BaseUiView } from '#webgl/core/BaseUiView.js';

export class Pause extends BaseUiView {
	init() {
		const { $viewport, $subtitles } = this.webgl;

		this.createTitle();
		this.createButton();

		this.goToGame = this.goToGame.bind(this);
		this.goToSettings = this.goToSettings.bind(this);
		this.goToCredits = this.goToCredits.bind(this);
	}

	createTitle() {
		const { x: vw } = this.webgl.$viewport.size.value;

		this.title = this.add(UiText, {
			text: {
				name: 'UiPauseTitle',
				content: '-----PAUSE-----',
				color: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
				align: 'center',
			},
			componentWidth: vw * .3
		});
		this.translate(this.title, { x: 0, y: 16 });
	}

	createButton() {
		const { x: vw } = this.webgl.$viewport.size.value;

		this.backButton = this.add(UiButton, {
			text: {
				name: 'UiBackButton',
				content: 'REPRENDRE',
				align: 'center',
			},
			justifyContent: 'center',
			componentWidth: vw * .3,
			callback: this.goToGame,
		});
		this.settingsButton = this.add(UiButton, {
			text: {
				name: 'UiSettingsButton',
				content: 'PARAMETRES',
				align: 'center',
			},
			justifyContent: 'center',
			componentWidth: this.vw,
			callback: this.goToSettings,
		});
		this.creditsButton = this.add(UiButton, {
			text: {
				name: 'UiCreditsButton',
				content: 'CREDITS',
				align: 'center',
			},
			justifyContent: 'center',
			componentWidth: this.vw,
			callback: this.goToCredits,
		});

		this.translate(this.backButton, { x: 0, y: 0 });
		this.translate(this.settingsButton, { x: 0, y: -5.5 });
		this.translate(this.creditsButton, { x: 0, y: -11 });
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
		const { $povCamera } = this.webgl;

		const _states = $povCamera.controls.states
		const _is = $povCamera.controls.state.is;
		if (_is(_states.GENERIQUE) || _is(_states.CINEMATIC)) return;
		if (currentState !== 'hud' && currentState !== 'pause') return;

		if (event.code === 'KeyP') {
			if (currentState === 'hud') this.scene.$setState('pause');
			else this.goToGame()
		}
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
