import { onBeforeUnmount, onMounted, unref } from 'vue';
import { useEventListener as rawUseEventListener } from '~app/utils/useEventListener';

export function useEventListener(handler, listener, callback, opts = {}) {
	let unwatch = null;

	onMounted(() => {
		let node = unref(handler);
		node = node.$el ?? node;

		if (Array.isArray(listener))
			unwatch = listener.map((l) => rawUseEventListener(node, l, callback, opts));
		else
			unwatch = rawUseEventListener(node, listener, callback, opts);
	});

	const destroy = () => {
		if (!unwatch) return;

		if (Array.isArray(unwatch)) unwatch.forEach((u) => u());
		else unwatch();

		unwatch = null;
	};

	onBeforeUnmount(destroy);

	return destroy;
}
