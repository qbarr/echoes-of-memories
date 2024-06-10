import { w } from '#utils/state/index.js';
import { storageSync } from '#utils/state/signalExtStorageSync.js';
import { webgl } from '#webgl/core';
import { CameraHelper } from 'three';

export const useCameraHelper = (Class) => {
	const camera = Class.base;

	const enabled = storageSync(
		'webgl:' + Class.name + ':cameraHelper:enabled',
		w(false),
	);

	const cameraHelper = new CameraHelper(camera);
	enabled.watchImmediate((v) => {
		cameraHelper.visible = v;
	});
	camera.add(cameraHelper);

	const gui = Class.gui.addFolder({ title: 'Helper' });
	gui.add(enabled, 'value', { label: 'Enabled' });

	function update() {
		cameraHelper.update();
	}

	function destroy() {
		camera.remove(cameraHelper);
		gui.remove();
		webgl.$hooks.afterUpdate.remove(update);
	}

	console.log(webgl.$scenes);
	webgl.$scenes._current.watchImmediate((scene) => {
		if (!scene) return;
		if (!scene.component.base) return;
		scene.component.base.add(cameraHelper);
	});

	webgl.$hooks.afterUpdate.watch(update);

	return { destroy };
};
