import Home from '#app/pages/Home.vue'

export const routes = [
	{ path: '/', name: 'Home', component: Home, default: true },
	// { path: '/', name: 'Home', component: Home, to: [ '*' ], from : [ '*' ] },
	// { path: '/:pathMatch(.*)*', name: '404', component: Error, 404: true },
]
