import { watch } from 'vue';
import { Object3D, Vector3 } from 'three';

import BaseComponent from '#webgl/core/BaseComponent';
import { UiBackground } from '../components/Interface/components/UiBackground';
import { deferredPromise } from '#utils/async/deferredPromise.js';
import { w } from '#utils/state/index.js';

export class BaseUiView extends BaseComponent {
	constructor(props = {}) {
		super(props);
		this.isView = true;
		this.base = new Object3D();
		this.isReady = deferredPromise();

		this.$hooks = {};

		this.resize = this.resize.bind(this);
		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);

		this.createSheet = this.createSheet.bind(this);

		if (!this.props) this.props = props;
	}

	beforeInit() {
		const scene = this.scene ?? this.webgl.$getCurrentScene();
		const { $theatre } = this.webgl;

		__DEBUG__ && this.debug();

		this.camera = scene.getCurrentCamera();

		this.$project = $theatre.get('Interface');
	}

	debug() {
		/// #if __DEBUG__
		const $gui = this.webgl.$app.$gui.app;

		this.gui = $gui.addFolder({ title: '🖥️ ' + this.name });
		let CELLS_PER_ROW = 2;
		const cells = [
			{
				title: 'Show',
				action: this.show,
			},
			{
				title: 'Hide',
				action: this.hide,
			},
		];
		const rows = Math.ceil(cells.length / CELLS_PER_ROW);
		CELLS_PER_ROW = Math.min(CELLS_PER_ROW, cells.length);

		this.gui
			.addBlade({
				view: 'buttongrid',
				size: [CELLS_PER_ROW, rows],
				cells: (x, y) => cells[y * CELLS_PER_ROW + x],
				label: 'Actions',
			})
			.on('click', ({ index }) => {
				const { action } = cells[index[1] * CELLS_PER_ROW + index[0]];
				action();
			});
		/// #endif
	}

	createSheet({ id, name = '' }) {
		if (!id.length) return;

		const sheet = this.$project.getSheet(id + name);
		// await this.$onEnterSheet.attachAudio('sfx/glitch');

		sheet.$composer(['global', 'bokeh', 'rgbShift', 'crt']);

		return sheet;
	}

	afterInit() {
		const { $viewport, $subtitles } = this.webgl;

		$viewport.size.watchImmediate(this.resize);
	}

	resize() {
		console.log(`[BaseUiView] Resize ${this.name} View`);
	}

	show() {
		this.base.visible = true;

		this.children.forEach((child) => {
			child.visible = true;

			if (child.show) {
				child.show();
			}
		});

		// console.log(`VIEW ${this.name} SHOW`);
	}

	hide() {
		this.base.visible = false;

		this.children.forEach((child) => {
			child.visible = true;
			if (child.hide) {
				child.hide();
			}
		});

		// console.log(`VIEW ${this.name} HIDE`);
	}

	translate(obj, pos = { x: 0, y: 0, z: 0 }) {
		obj.base.position.add(new Vector3(pos.x, pos.y, pos.z));
	}
}
