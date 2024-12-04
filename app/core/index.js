// Separation from createApp to avoid circular dependency
// Breaking HMR
// Wrapper around vue.createApp with sensible defaults
// - Expose plugins globally to access them easily
// - Add beforeMount / afterMount hooks to App to be used
//   inside plugins or outside app

import { inject } from 'vue';

let appInstance;
const plugins = {};

export function useApp() {
	return inject('app', plugins);
}

export function getApp() {
	return plugins;
}

export function setApp(app) {
	appInstance = app;
	Object.assign(plugins, app.config.globalProperties);
}

export function getAppInstance() {
	return appInstance;
}

export const app = plugins;

