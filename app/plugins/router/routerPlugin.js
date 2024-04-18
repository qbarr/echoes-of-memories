import { shallowRef, watch } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import { routes } from './routes'

/// #if __DEBUG__
/// #code import { storageSync, w } from '#utils/state'
/// #endif

const bypassDefaultRoute = __DEBUG__
	? storageSync(':router-bypassDefaultRoute', w(false))
	: { value: false }

export function routerPlugin() {
	const notFoundComponent = routes.find(r => r?.notFound)?.component;
	if (!notFoundComponent) {
		routes.push({
			path: '/:pathMatch(.*)*',
			redirect: '/',
			notFound: true,
		});
	}

	const defaultRoute = routes.find(r => r?.default) ?? routes[0]
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

		__DEBUG__ && addRoutesToGui(_app)

		// Push to the default route
		if (!bypassDefaultRoute.value) api.push(defaultRoute.path)

		delete api.install
	}

	return api
}

/// #if __DEBUG__
function addRoutesToGui(app) {
	const $gui = app.$gui.app
	const $router = app.$router
	const $currentRoute = app.$router.currentRoute

	const gui = $gui.addFolder({ title: 'Routes' })


	gui.addBinding(bypassDefaultRoute, 'value', {
		label: 'Bypass Default Route'
	})

	const o = { name: '' }
	const routeMonitor = gui.addBinding(o, 'name', {
		label: 'Current Route',
		readonly: true,
	})
	watch($currentRoute, ({ name }) => o.name = name)


	let CELLS_PER_ROW = 3
	const rows = Math.ceil(routes.length / CELLS_PER_ROW)
	const cells = Array.from({ length: rows * CELLS_PER_ROW }, (_, i) => {
		const route = routes[i]
		if (route?.notFound || !route) return null
		return { title: route.name, path: route.path }
	}).filter(Boolean)
	CELLS_PER_ROW = Math.min(CELLS_PER_ROW, cells.length)

	gui.addBlade({
		view: 'buttongrid',
		size: [CELLS_PER_ROW, rows],
		cells: (x, y) => cells[y * CELLS_PER_ROW + x],
		label: 'Routes',
	}).on('click', ({ index }) => {
		const { path } = cells[index[1] * CELLS_PER_ROW + index[0]]
		if ($currentRoute.value.path === path) return
		$router.push(path)
	})
}
/// #endif
