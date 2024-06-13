import { getApp } from '#app/core/index.js';
import { getWebGL } from '#webgl/core/index.js';
import { getProject } from '@theatre/core';
import { TheatreSheet } from './TheatreSheet';
import { createLogger } from '#utils/debug/logger.js';

export class TheatreProject {
	constructor(id) {
		this.$webgl = getWebGL();
		this.$app = getApp();

		Object.assign(this, createLogger(`TH.${id}`, '#000', '#70abff'));

		this.id = id;
		this.symbol = Symbol(id);
		this.$sheets = new Map();
		this._sheetsSymbols = {};

		this.state = null;
		const { $theatre } = this.$webgl;
		if ($theatre.states[id]) this.state = $theatre.states[id];

		this.instance = this.state
			? getProject(id, { state: this.state })
			: getProject(id);

		this.sheet = this.instance.sheet.bind(this.instance);

		$theatre.register(this);
	}

	get isReady() {
		return this.instance.isReady;
	}

	registerSheet(SheetClass) {
		this.$sheets.set(SheetClass._symbol, SheetClass);
		this._sheetsSymbols[SheetClass.id] = SheetClass._symbol;
		return SheetClass;
	}

	getSheet(id) {
		let sheet = null;
		if (!this._sheetsSymbols[id]) return new TheatreSheet(id, { project: this });
		return this.$sheets.get(this._sheetsSymbols[id]);
	}

	/// #if __DEBUG__
	devtools() {
		// Additional devtools if needed
	}
	/// #endif
}
