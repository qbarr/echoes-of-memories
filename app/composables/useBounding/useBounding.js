import { onBeforeUnmount, onMounted, reactive, shallowRef, unref } from 'vue';

import { useEventListener } from '#app/composables/useEventListener/useEventListener';
import { useSize } from '../useSize/useSize';
// import { useIntersectionObserver } from '../useIntersection/useIntersectionObserver';
// import { useResizeObserver } from '../useResizeObserver/useResizeObserver';

const computeBoundingClient = (node, bounding = {}) => {
	if (!node) return;
	const b = node.getBoundingClientRect();
	return Object.assign(bounding, {
		width: b.width,
		height: b.height,
		bottom: b.bottom,
		top: b.top,
		left: b.left,
		right: b.right,
		x: b.x,
		y: b.y,
	});
};

const getNode = (root) => {
	let node = unref(root);
	return node.$el ?? node;
}

export function useBounding(root, { updateOnResize = true, updateOnScroll = true } = {}) {
	let node = null;
	const bounding = reactive({});
	const isVisible = shallowRef(false);

	const update = (force = false) => {
		if (!node) return;
		if (!isVisible.value && !force) return;
		return computeBoundingClient(node, bounding);
	};

	useSize({ ref: root, cb: update });

	// useIntersectionObserver()
	// 	.observe(root, {
	// 		onEnter: () => isVisible.value = true,
	// 		onLeave: () => isVisible.value = false,
	// 	});

	// if (updateOnResize) useResizeObserver().observe(root, update);
	// if (updateOnScroll) useEventListener(window, 'scroll', update);

	onMounted(() => {
		node = getNode(root);
		computeBoundingClient(node, bounding);
	});

	onBeforeUnmount(() => {
		isVisible.value = false;
		node = null;
	});

	return { bounding, isVisible, update: () => update(true) };
}
