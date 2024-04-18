import { getCurrentInstance, reactive, inject } from 'vue';
import mainStore from '#app/store.js';

const isObject = v => typeof v === 'object' && !Array.isArray(v) && v !== null;
let singleton = {};

function storePlugin() {
	let store;

	return { install };

	function install(app) {
		let store = typeof mainStore === 'function' ? mainStore(app) : mainStore;
		if (!isObject(store)) store = {};
		store = reactive(store);
		app.config.globalProperties.$store = store;
		app.provide('store', store);
		singleton = store;
		if (typeof __DEBUG__ !== 'undefined' && __DEBUG__) {
			window.$store = store;
		}
	}
}

function useStore() {
	return getCurrentInstance() ? inject('store') : singleton;
}

export { storePlugin, useStore };
