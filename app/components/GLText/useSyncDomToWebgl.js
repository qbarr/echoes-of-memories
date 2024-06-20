import { Frustum, Object3D, Vector2, Vector3 } from 'three';
import { onBeforeMount, onMounted, ref, shallowRef, unref } from 'vue';

import { useBounding } from '#app/composables/useBounding/useBounding';
import { app } from '#app/core';
import { map } from '#utils/maths';
import { webgl } from '#webgl/core';

const vec3a = new Vector3();
const vec3b = new Vector3();
const frustrum = new Frustum();
const dummy = new Object3D();

const getNode = (root) => {
	let node = unref(root);
	return node.$el ?? node;
};

export function useSyncDomWebGL($$ref, object) {
	let node = null;
	let resizeSignal = null;
	const isInViewport = shallowRef(false);
	const position = ref(new Vector3());
	const scale = ref(new Vector2(1, 1));

	const renderer = webgl.$threeRenderer;
	const scene = webgl.$scenes.get('ui');
	const camera = scene._cam.current.cam;

	const { bounding, update: updateBounding } = useBounding($$ref, {
		updateOnResize: true,
		updateOnScroll: false,
	});

	onMounted(async () => {
		node = getNode($$ref);

		if (object) {
			scene.isReady ?? (await scene.isReady);
			scene.add(object);
		}

		const dbs = webgl.$renderer.drawingBufferSize;
		resizeSignal = dbs.watchImmediate(resize, this);

		setTimeout(update, 100);
	});

	onBeforeMount(destroy);

	return {
		position,
		scale,
		update,
	};

	function resize() {
		updateBounding();
		update();
	}

	function destroy() {
		node = null;
		resizeSignal?.unwatch();
		scene.remove?.(object);
	}

	function updatePos() {
		if (!camera || !renderer) return;

		// const dbs = webgl.$renderer.drawingBufferSize;
		// const ratio = dbs.value.x / dbs.value.y;

		const { width: vpw, height: vph, viewportRatio } = app.$viewport;
		position.value.x = map(bounding.left, 0, vpw, -1, 1) * viewportRatio;
		position.value.y = map(bounding.bottom, 0, vph, 1, -1);

		// position.value.set(
		// 	map(bounding.x, 0, dbs.value.x, -1, 1) * ratio,
		// 	map(bounding.y, 0, dbs.value.y, 1, -1)
		// )

		// Update object position
		object?.position.copy(position.value);
	}

	function updateScale() {
		if (!camera || !renderer) return;

		const { width: vpw, height: vph, viewportRatio } = app.$viewport;

		scale.value.set(
			(bounding.width / vpw) * 2 * viewportRatio,
			(bounding.height / vph) * 2,
		);

		// object.updateGeo({ width: bounding.width });

		object?.scale.copy(scale.value);
	}

	function update() {
		updatePos();
		updateScale();
	}
}
