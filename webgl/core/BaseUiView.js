import { watch } from 'vue';
import { Object3D } from 'three';

import BaseComponent from '#webgl/core/BaseComponent';

import { deferredPromise } from '#utils/async/deferredPromise.js';

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

		if (!this.props) this.props = props;
	}

	beforeInit() {
		const scene = this.scene ?? this.webgl.$getCurrentScene();
		this.camera = scene.getCurrentCamera();

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

	afterInit() {
		const { $viewport, $subtitles } = this.webgl;

		$viewport.size.watchImmediate(this.resize);
	}

	resize() {
		console.log(`[BaseUiView] Resize ${this.name} View`);
	}

	show() {
		this.base.visible = true;
	}

	hide() {
		this.base.visible = false;
	}
}
