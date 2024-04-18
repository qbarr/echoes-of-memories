import { app } from '#app/core'
import { routes } from './routes'


export function addRouteGuard(router) {
	const HOME_ROUTE = (routes.find(r => r?.default) ?? routes[0]).name

	routes.forEach(r => {
		r.to = r.to ?? [ '*' ]
		r.from = r.from ?? [ '*' ]
	});

	app.$router.beforeEach((to, from, next) => {
		const toName = to.name
		const fromName = from.name

		const toRoute = routes.find(route => route.name === toName)
		const fromRoute = routes.find(route => route.name === fromName)

		if(!from.name || to.name === HOME_ROUTE) {
			if (toRoute.from.includes('*')) next()
			else next({ name: HOME_ROUTE })
		} else if (
			(toRoute.from.includes(fromName) || toRoute.from.includes('*'))
			&& (fromRoute.to.includes(toName) || fromRoute.to.includes('*'))
		) {
			next()
		} else {
			__DEBUG__ && console.log('Route guard: redirecting to', fromName);
			next({ name: fromName })
		}
	})
}
