import BaseScene from '#webgl/core/BaseScene';
import { UICamera } from '../Cameras/UICamera';

import { Subtitles } from '../Interface/Subtitles.js';
import { Credits as CreditsScreen } from '../Interface/views/Credits.js';
import { Hud as HudScreen } from '../Interface/views/Hud.js';
import { Pause as PauseScreen } from '../Interface/views/Pause.js';
import { Settings as SettingsScreen } from '../Interface/views/Settings.js';
import { Splash as SplashScreen } from '../Interface/views/Splash.js';
import { Warning as WarningScreen } from '../Interface/views/Warning.js';
import { Generique as GeneriqueScreen } from '../Interface/views/Generique.js';

import { w } from '#utils/state/index.js';

export default class UIScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		const { $assets, $theatre } = this.webgl;

		this.camera = this.add(UICamera);

		this.$project = $theatre.get('Ui');

		this.subtitles = this.add(Subtitles);

		this.screens = ['SplashScreen', 'WarningScreen', 'PauseScreen', 'GeneriqueScreen'];
		this.menus = ['CreditsScreen', 'SettingsScreen'];

		this.currentScreen = w(null);
		this.currentMenu = w(null);

		// HUD
		this.hudScreen = this.add(HudScreen);
		this.crosshair = this.hudScreen.crosshair;

		// Views
		this.splashScreen = this.add(SplashScreen, { name: 'SplashScreen' });
		this.warningScreen = this.add(WarningScreen, { name: 'WarningScreen' });
		this.pauseScreen = this.add(PauseScreen, { name: 'PauseScreen' });

		// Menu
		this.creditsScreen = this.add(CreditsScreen, { name: 'CreditsScreen' });
		this.settingsScreen = this.add(SettingsScreen, { name: 'SettingsScreen' });

		// Generique
		this.generiqueScreen = this.add(GeneriqueScreen, { name: 'GeneriqueScreen' });
	}

	afterInit() {
		const { $theatre } = this.webgl;

		this.$statesMachine = this.webgl.$statesMachine.create('Interface', {
			filter: 'interface',
		});
		this.$setState = this.$statesMachine.setState.bind(this.$statesMachine);
		this.webgl.$hooks.afterStart.watchOnce(this.createSheets.bind(this));
	}

	createSheets() {
		this.$splashScreenEnter = this.splashScreen.createSheet({
			id: 'SplashScreen',
			name: 'Enter',
		});
		this.$splashScreenLeave = this.splashScreen.createSheet({
			id: 'SplashScreen',
			name: 'Leave',
		});

		this.$warningScreenEnter = this.warningScreen.createSheet({
			id: 'WarningScreen',
			name: 'Enter',
		});

		this.$pauseScreenEnter = this.pauseScreen.createSheet({
			id: 'PauseScreen',
			name: 'Enter',
		});
		this.$pauseScreenToMenu = this.pauseScreen.createSheet({
			id: 'PauseScreen',
			name: 'ToMenu',
		});
		this.$pauseScreenToHud = this.pauseScreen.createSheet({
			id: 'PauseScreen',
			name: 'ToHud',
		});

		this.$setState('splash');
	}

	async enter() {
		this.log('enter');
	}

	async leave() {
		this.log('leave');
	}

	update() {}
}
