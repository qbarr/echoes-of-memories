import { fastBind } from '#utils/optims';
import BaseMixin from '#webgl/mixins/BaseMixin';

export default class DebugCameraMixin extends BaseMixin {
	created() {
		const el = this.base;
		if (!el.isScene) return;
		if (this.options.extendProto) {
			this.extendProto('registerDebugCamera', registerDebugCamera);
			this.extendProto('unregisterDebugCamera', unregisterDebugCamera);
			this.extendProto('addDebugCameraTarget', addDebugCameraTarget);
			this.extendProto('removeDebugCameraTarget', removeDebugCameraTarget);
		} else {
			el.registerDebugCamera = fastBind(registerDebugCamera, el, 1);
			el.unregisterDebugCamera = fastBind(unregisterDebugCamera, el, 0);
			el.addDebugCameraTarget = fastBind(addDebugCameraTarget, el, 2);
			el.removeDebugCameraTarget = fastBind(removeDebugCameraTarget, el, 1);
		}
	}

	used() {
		const el = this.base;
		if (!el.isScene) return;
		el.registerDebugCamera({ scene: el });
	}

	unused() {
		const el = this.base;
		if (!el.isScene) return;
		// el.unregisterDebugCamera();
	}

	componentAttached() {
		const el = this.base;
		if (!el.isScene) return;
		el.registerDebugCamera({ scene: el });
	}

	componentDetached() {
		const el = this.base;
		if (!el.isScene) return;
		// el.unregisterDebugCamera();
	}
}

function registerDebugCamera(data) {
	this.debugCamera = this.webgl.$debugCamera.registerScene(data);
}

function unregisterDebugCamera() {
	this.webgl.$debugCamera.unregisterScene(this.name);
}

function addDebugCameraTarget(obj, props) {
	if (!obj) return;
	if (!props) return;
	if (!props.name) return;
	if (!this.debugCamera) return;
	this.debugCamera.addTarget(obj, props);
}

function removeDebugCameraTarget(name) {
	if (!name) return;
	if (!this.debugCamera) return;
	this.debugCamera.removeTarget(name);
}
