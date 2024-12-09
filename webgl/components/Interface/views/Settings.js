import { Color, Mesh, MeshBasicMaterial, PlaneGeometry, Vector2, Vector3 } from 'three';

import { clamp } from '#utils/maths/map.js';
import { BaseUiView } from '#webgl/core/BaseUiView.js';
import { UiButton, UiText } from '../components';

const levelsCount = 8;
const vols = new Array(levelsCount).fill(1).map((_, i) => i / (levelsCount - 1));
const GLOBAL_OFFSET = new Vector2(5, 0);

export class Settings extends BaseUiView {
	init() {
		this.index = 0;

		this.onAudioSettingDown = this.onAudioSettingDown.bind(this);
		this.onAudioSettingUp = this.onAudioSettingUp.bind(this);
		this.onSubSettingClick = this.onSubSettingClick.bind(this);

		this.goToPause = this.goToPause.bind(this);

		this.createTitle();
		this.createSettings();
	}

	createTitle() {
		const { x: vw } = this.webgl.$viewport.size.value;

		this.title = this.add(UiText, {
			text: {
				name: 'UiSettingsTitle',
				content: '-----PARAMETRES-----',
				color: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
				align: 'center',
			},
			componentWidth: vw * .3
		});

		this.translate(this.title, { x: 0, y: 16 });
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
			levels: vols.map((v) => ({ s: 1, v, m: null })),
		};

		this.audioController.text = this.add(UiText, {
			text: {
				scale: .75,
				name: 'UiTextAudioController',
				content: 'AUDIO...',
				width: 700,
				centerMesh: { x: false, y: false },
				align: 'left',
			},
		});

		this.audioController.levels.forEach((level, i) => {
			if (i === levelsCount - 1) return;

			const mat = new MeshBasicMaterial({ color: 0xffffff });
			const geo = new PlaneGeometry(2, 4 * .75);
			const mesh = new Mesh(geo, mat);
			mesh.position.set(-2.5 + i * 2.5, 1.5 * .75, 0);
			mesh.position.x -= 6;
			mesh.position.x += GLOBAL_OFFSET.x
			mesh.scale.setScalar(level.s);
			this.base.add(mesh);
			level.m = mesh;
		});

		this.audioController.downButton = this.add(UiButton, {
			text: {
				scale: .75,
				name: 'UiButtonAudioControllerDown',
				content: '-',
			},
			forceHover: true,
			blurOnClick: false,
			callback: this.onAudioSettingDown,
		});
		this.audioController.upButton = this.add(UiButton, {
			text: {
				scale: .75,
				name: 'UiButtonAudioControllerUp',
				content: '+',
			},
			forceHover: true,
			blurOnClick: false,
			callback: this.onAudioSettingUp,
		});

		this.translate(this.audioController.text, { x: -29 + GLOBAL_OFFSET.x });
		this.translate(this.audioController.downButton, { x: -12 + GLOBAL_OFFSET.x });
		this.translate(this.audioController.upButton, { x: levelsCount * 2.15 - 7 + GLOBAL_OFFSET.x });

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
				scale: .75,
				name: 'UiTextSubtitlesController',
				content: 'SOUS-TITRES...',
				width: 700,
				centerMesh: { x: false, y: false },
				align: 'left',
			},
		});
		this.subtitlesController.button = this.add(UiButton, {
			text: {
				scale: .75,
				name: 'UiButtonSubtitlesController',
				content: 'ON',
			},
			callback: this.onSubSettingClick,
			blurOnClick: false,
		});

		this.translate(this.subtitlesController.text, { x: -29 + GLOBAL_OFFSET.x, y: -5 });
		this.translate(this.subtitlesController.button, { x: 0 + GLOBAL_OFFSET.x, y: -5 });
	}

	createBackButton() {
		const { x: vw } = this.webgl.$viewport.size.value;

		this.backButton = this.add(UiButton, {
			text: {
				scale: .75,
				name: 'UiBackButton',
				content: 'RETOUR',
			},
			justifyContent: 'right',
			componentWidth: vw * .75 / 2,
			callback: this.goToPause,
		});

		this.translate(this.backButton, { x: 0, y: -22 });

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
