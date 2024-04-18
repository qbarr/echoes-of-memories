import { isReactive, isRef, reactive, watch } from 'vue';

import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { Pane } from 'tweakpane';

import { isRefOrReactive, toRawValue } from '#app/utils/reactivity.js';
import addBindingShortcuts from './bindingShortcuts.js';
import { addOnDispose, addSignalReactivity, addVueReactivity, surchargeObj } from './utils';

const LS_KEY_FOLDER = 'gui-folder-';
const LS_KEY_TAB = 'gui-tab-';
let tabID = 0;
let storage = localStorage;


// Extract and normalize args from tweakpane methods
// Auto-handle vue and store signal reactivity on top of it
function normalizeArgsAndReactivity(args) {
	let params = args[ 0 ];
	let key = args[ 1 ] ?? 'value';
	const opts = args[ 2 ] ?? {};
	const customInterval = opts.interval != null;
	const disableReactivity = !customInterval && opts.reactive === false;

	// Test to see if param is a store signal
	let storeSignal = null;
	if (!disableReactivity) {
		if (key === 'value' && params.isWritableSignal) {
			storeSignal = params;
		} else if (params[ key ] && params[ key ].isWritableSignal) {
			storeSignal = params[ key ];
			if (!opts.label) opts.label = key;
		}
		if (storeSignal) {
			params = { value: storeSignal.value };
			key = 'value';
		}
	}
	// Test for vue reactivity
	let vueWatcher = null;
	if (!disableReactivity && !storeSignal) {
		if (key === 'value' && isRef(params)) {
			vueWatcher = () => params.value;
		} else if (isRef(params[ key ])) {
			vueWatcher = () => params[ key ].value;
			if (!opts.label) opts.label = key;
		} else if (isReactive(params)) {
			vueWatcher = () => params[ key ];
		}
	}
	// Reasign values to arguments
	args[ 0 ] = params; args[ 1 ] = key; args[ 2 ] = opts;
	return { params, key, opts, args, vueWatcher, storeSignal };
}

const surcharges = {
	addFolder(parent, orig, ...args) {
		const opts = args[ 0 ] || {};
		const title = opts.title;
		const key = LS_KEY_FOLDER + title.toLowerCase().replace(/\W/g, '');
		if (title) opts.expanded = !!+(storage.getItem(key) | 0);
		const el = orig(...args);
		addOnDispose(el);
		if (title) el.on('fold', v => storage.setItem(key, +!!v.expanded));
		el.setBackground = bg => el.element.style.backgroundColor = bg;
		if (opts.bg) { el.setBackground(opts.bg) }
		addBindingShortcuts(el);
		surchargeObj(el, surcharges);
		return el;
	},
	addBinding(parent, orig, ...args) {
		const { params, opts, storeSignal, vueWatcher } = normalizeArgsAndReactivity(args);
		// Add reactivity to options
		let el;
		if (opts.options) {
			let options = opts.options;
			// Allow support for array lists for options
			const normOptions = () => {
				let o = options;
				if (Array.isArray(o)) o = Object.fromEntries(o.map(v => [ v, v ]));
				return o;
			};
			if (isRefOrReactive) {
				options = toRawValue(opts.options);
				const watchable = reactive({ o: opts.options });
				watch(() => watchable.o, v => {
					const no = normOptions(toRawValue(v));
					el.options = Object.entries(no).map(([ text, value ]) => ({ text, value }));
				}, { deep: true });
			}
			opts.options = normOptions();
		}
		if (opts.readonly && (storeSignal || vueWatcher)) opts.interval = 0;
		el = orig(...args);
		addOnDispose(el);
		if (storeSignal) addSignalReactivity(el, storeSignal, params, !!opts.readonly);
		else if (vueWatcher) addVueReactivity(el, vueWatcher);
		return el;
	},
	addButton(parent, orig, ...args) {
		const el = orig(...args);
		addOnDispose(el);
		return el;
	},
	addTab(parent, orig, ...args) {
		const id = ++tabID;
		const ls = LS_KEY_TAB + id + '-active-index';
		const el = orig(...args);
		addOnDispose(el);
		for (const p of el.pages) {
			addBindingShortcuts(p);
			surchargeObj(p, surcharges);
		}
		const v = storage.getItem(ls) | 0;
		if (v in el.pages) el.pages[ v ].selected = true;
		let pages = new Set();
		let called = false;
		refreshListeners();
		const origAdd = el.addPage.bind(el);
		const origRemove = el.removePage.bind(el);
		el.addPage = e => {
			const p = origAdd(e);
			addBindingShortcuts(p);
			surchargeObj(p, surcharges);
			refreshListeners();
			return p;
		};
		el.removePage = e => { const p = origRemove(e); refreshListeners(); return p };
		el.onDispose(() => {
			for (const page of pages) unlisten(page);
			for (const page of el.pages) unlisten(page);
		});
		function listen(p) {
			if (pages.has(p)) return;
			pages.add(p);
			p.controller.props.value('selected').emitter.on('change', change);
		}
		function unlisten(p) {
			pages.delete(p);
			p.controller.props.value('selected').emitter.off('change', change);
		}
		function refreshListeners() {
			for (const page of el.pages) !pages.has(page) && listen(page);
			for (const page of pages) !el.pages.includes(page) && unlisten(page);
		}
		function change() {
			if (called) return;
			called = true;
			Promise.resolve().then(onChange);
		}
		function onChange() {
			called = false;
			for (let i = 0; i < el.pages.length; i++) {
				const p = el.pages[ i ];
				if (p.selected) return storage.setItem(ls, i);
			}
		}
		return el;
	},
	addBlade(parent, orig, ...args) {
		const el = orig(...args);
		addOnDispose(el);
		return el;
	}
};

export function createPane(opts) {
	const pane = new Pane(opts);
	pane.registerPlugin(EssentialsPlugin);
	surchargeObj(pane, surcharges);
	return pane;
}


export function setStorage(s = localStorage) {
	storage = s;
}
