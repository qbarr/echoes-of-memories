import { wait } from '#utils/async';

async function enter({ machine, from }) {
	const { $app, $scenes } = this.$webgl;
	const { $store } = $app;

	console.log('splash enter', $store.isPaused);
	$store.isPaused = true;

	const scene = $scenes.ui.component;

	const { $splashScreenEnter } = scene;

	if ($splashScreenEnter) $splashScreenEnter.play();
	await wait(500);
	scene.splashScreen.show();
}

function update() {}

async function leave({ machine }) {
	const { $app, $scenes } = this.$webgl;
	const { $store } = $app;

	$store.isPaused = false;

	const scene = $scenes.ui.component;

	const { $splashScreenEnter } = scene;

	// $splashScreenEnter.play({ direction: 'reverse' });
	// await wait(500);
	scene.splashScreen.hide();
}

export default { enter, leave, update };
