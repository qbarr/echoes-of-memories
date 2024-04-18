import Game from '#app/pages/Game.vue'
import Home from '#app/pages/Home.vue'

export const routes = [
	{ path: '/', name: 'Home', component: Home, default: true },
	{ path: '/game', name: 'Game', component: Game },
	// { path: '/', name: 'Home', component: Home, to: [ '*' ], from : [ '*' ] },
]
