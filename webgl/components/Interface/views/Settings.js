import { Color, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from 'three';

import { clamp } from '#utils/maths/map.js';
import { BaseUiView } from '#webgl/core/BaseUiView.js';
import { UiButton, UiText } from '../components';

const levelsCount = 8;
const vols = new Array(levelsCount).fill(1).map((_, i) => i / (levelsCount - 1));

export class Settings extends BaseUiView {
	init() {
		const { $viewport, $subtitles } = this.webgl;
		const { x: vw, y: vh } = $viewport.size.value;

		this.vw = vw;
		this.vh = vh;

		this.index = 0;

		this.onAudioSettingDown = this.onAudioSettingDown.bind(this);
		this.onAudioSettingUp = this.onAudioSettingUp.bind(this);
		this.onSubSettingClick = this.onSubSettingClick.bind(this);

		this.goToPause = this.goToPause.bind(this);

		this.createTitle();
		this.createSettings();
	}

	createTitle() {
		this.title = this.add(UiText, {
			text: {
				name: 'UiSettingsTitle',
				content: '-----PARAMETRES-----',
				color: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
			},
			justifyContent: 'left',
		});
		this.title.base.position.add(new Vector3(-7, 6, 0));
	}

	createSettings() {
		this.createAudioController();
		this.createSubtitlesController();
		this.createBackButton();
	}

	createAudioController() {
		this.audioController = {
			text: null,
			downButton: null,
			upButton: null,
			// levels: [
			// 	{ s: 1, v: 0.125, m: null },
			// 	{ s: 1, v: 0.25, m: null },
			// 	{ s: 1, v: 0.375, m: null },
			// 	{ s: 1, v: 0.5, m: null },
			// 	{ s: 1, v: 0.625, m: null },
			// 	{ s: 1, v: 0.75, m: null },
			// 	{ s: 1, v: 0.875, m: null },
			// ],
			levels: vols.map((v) => ({ s: 1, v, m: null })),
		};

		this.audioController.text = this.add(UiText, {
			text: {
				name: 'UiTextAudioController',
				content: 'AUDIO......',
			},
			justifyContent: 'left',
		});
		this.audioController.text.base.position.add(new Vector3(0, 0, 0));

		this.audioController.levels.forEach((level, i) => {
			if (i === levelsCount - 1) return;

			const mat = new MeshBasicMaterial({ color: 0xffffff });
			const geo = new PlaneGeometry(2, 4);
			const mesh = new Mesh(geo, mat);
			mesh.position.set(-2.5 + i * 2.5, 1.5, 0);
			mesh.scale.setScalar(level.s);
			this.base.add(mesh);
			level.m = mesh;
		});

		this.audioController.downButton = this.add(UiButton, {
			text: {
				name: 'UiButtonAudioControllerDown',
				content: '-',
			},
			forceHover: true,
			callback: this.onAudioSettingDown,
		});
		this.audioController.upButton = this.add(UiButton, {
			text: {
				name: 'UiButtonAudioControllerUp',
				content: '+',
			},
			forceHover: true,
			callback: this.onAudioSettingUp,
		});

		this.translate(this.audioController.text, { x: -7.5 });
		this.translate(this.audioController.downButton, { x: -6 });
		this.translate(this.audioController.upButton, { x: levelsCount * 2.15 - 1 });

		this.index = this.findClosestIndexByVolume();
		this.updateVolume();
	}

	createSubtitlesController() {
		this.subtitlesController = {
			text: null,
			button: null,
		};

		this.subtitlesController.text = this.add(UiText, {
			text: {
				name: 'UiTextSubtitlesController',
				content: 'SOUS-TITRES........',
			},
			justifyContent: 'left',
		});
		this.subtitlesController.button = this.add(UiButton, {
			text: {
				name: 'UiButtonSubtitlesController',
				content: 'ON',
			},
			callback: this.onSubSettingClick,
		});

		this.translate(this.subtitlesController.text, { x: -6.6, y: -5 });
		this.translate(this.subtitlesController.button, { x: 15, y: -5 });
	}

	createBackButton() {
		this.backButton = this.add(UiButton, {
			text: {
				name: 'UiBackButton',
				content: 'RETOUR',
			},
			justifyContent: 'left',
			callback: this.goToPause,
		});

		this.translate(this.backButton, { x: -8, y: -10 });
	}

	onAudioSettingDown() {
		const { levels } = this.audioController;
		const index = clamp(this.index - 1, 0, levels.length - 1);
		if (index !== this.index) {
			this.index = index;
			this.updateVolume();
		}
	}

	onAudioSettingUp() {
		const { levels } = this.audioController;
		const index = clamp(this.index + 1, 0, levels.length - 1);
		if (index !== this.index) {
			this.index = index;
			this.updateVolume();
		}
	}

	updateVolume() {
		const { $audio } = this.webgl;
		const { levels } = this.audioController;

		levels.forEach((level, i) => {
			level.m && level.m.scale.setScalar(i < this.index ? 1 : 0.3);
		});

		const level = levels[this.index];

		$audio.setVolume(level.v);
	}

	findClosestIndexByVolume() {
		const { $audio } = this.webgl;
		const { levels } = this.audioController;

		const volume = $audio.volume.get();
		let index = 0;
		levels.forEach((level, i) => {
			if (Math.abs(level.v - volume) < Math.abs(levels[index].v - volume)) {
				index = i;
			}
		});
		return index;
	}

	onSubSettingClick() {
		// if (!this?.parent?.base.visible) return;

		const { $subtitles } = this.webgl;
		const { UiText } = this.subtitlesController.button;

		$subtitles.enabled.set(!$subtitles.enabled.value);
		$subtitles.enabled.value ? UiText.text.edit('ON') : UiText.text.edit('OFF');
	}

	goToPause() {
		this.scene.$setState('pause');
	}

	afterInit() {
		this.hide();
	}
}
