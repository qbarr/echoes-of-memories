import { shallowRef } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import { routes } from './routes'


export function routerPlugin() {
	const notFoundComponent = routes.find(r => r?.notFound)?.component;
	if (!notFoundComponent) {
		routes.push({
			path: '/:pathMatch(.*)*',
			redirect: '/'
		});
	}

	const history = createWebHistory()
	const api = createRouter({ history, routes })

	const originInstall = api.install

	api.install = function install(app) {
		// Add the router to the app
		app.provide('router', api)

		// Install the router
		originInstall.call(this, app)

		const _app = app.config.globalProperties

		// Add a previous route property
		_app.$router.previousRoute = shallowRef()
		_app.$previousRoute = null

		// Add a "first route" ref
		// To try to answer this issue
		// https://github.com/vuejs/vue-router/issues/1377
		api.firstRoute = shallowRef()

		api.beforeEach((to, from) => {
			api.firstRoute.value = { to, from }
		})

		api.afterEach((to, from, failure) => {
			if (!failure) {
				api.firstRoute.value = null
				_app.$previousRoute = from
				_app.$router.previousRoute.value = from
			}
		})

		delete api.install
	}

	return api
}
