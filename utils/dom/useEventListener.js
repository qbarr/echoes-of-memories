const HANDLERS = new WeakMap();
HANDLERS.set(window, {});
HANDLERS.set(document, {});

const NOOP = () => {};

export function useEventListener(handler, listener, callback = NOOP, opts = {}) {
	opts.passive = opts.passive ?? true;

	if (!HANDLERS.has(handler)) HANDLERS.set(handler, {});
	const h = HANDLERS.get(handler);

	if (!h[ listener ]) {
		const o = h[ listener ] = {};
		Object.assign(o, {
			triggerCallbacks: event => o.list.forEach(({ callback: cb }) => cb(event)),
			list: [],
		});

		handler.addEventListener(listener, o.triggerCallbacks, opts);
	}

	const instance = { callback, opts };
	h[ listener ].list.push(instance);

	return () => {
		const o = h[ listener ];
		const index = o.list.indexOf(instance);
		if (index > -1) o.list.splice(index, 1);

		if (o.list.length === 0) {
			handler.removeEventListener(listener, o.triggerCallbacks);
			delete h[ listener ];

			if (Object.keys(h).length === 0) HANDLERS.delete(handler);
		}
	};
}
