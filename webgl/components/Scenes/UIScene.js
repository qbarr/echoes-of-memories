import BaseScene from '#webgl/core/BaseScene';
import {
	AdditiveBlending,
	Mesh,
	MeshBasicMaterial,
	PlaneGeometry,
	ShaderMaterial,
} from 'three';
import { UICamera } from '../Cameras/UICamera';

import { Subtitles } from '../Interface/Subtitles';

import { Pause as PauseScreen } from '../Interface/views/Pause';
import { Warning as WarningScreen } from '../Interface/views/Warning';
import { Splash as SplashScreen } from '../Interface/views/Splash';
import { Credits as CreditsScreen } from '../Interface/views/Credits';
import { Hud as HudScreen } from '../Interface/views/Hud';
import { Settings as SettingsScreen } from '../Interface/views/Settings';

export default class UIScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		const { $assets, $theatre } = this.webgl;

		this.camera = this.add(UICamera);

		this.$project = $theatre.get('Ui');

		this.subtitles = this.add(Subtitles);

		// HUD
		this.hudScreen = this.add(HudScreen);
		this.crosshair = this.hudScreen.crosshair;

		// Views
		this.pauseScreen = this.add(PauseScreen);
		this.warningScreen = this.add(WarningScreen);
		this.creditsScreen = this.add(CreditsScreen);
		this.splashScreen = this.add(SplashScreen);
		this.settingsScreen = this.add(SettingsScreen);
	}

	afterInit() {
		this.$statesMachine = this.webgl.$statesMachine.create('Interface', {
			filter: 'interface',
		});
		this.$setState = this.$statesMachine.setState.bind(this.$statesMachine);

		this.$setState('hud');
	}

	async enter() {
		this.log('enter');
	}

	async leave() {
		this.log('leave');
	}

	update() {}
}
