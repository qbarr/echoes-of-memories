import { watch, getCurrentInstance, onUnmounted } from 'vue';

function isObject(obj) {
	if (typeof obj === 'object' && obj != null) return true;
	else return false;
}

function surcharge(ctx, method, cb) {
	const orig = ctx[ method ].bind(ctx);
	ctx[ method ] = (...args) => cb(ctx, orig, ...args);
}

function surchargeObj(obj, surcharges) {
	for (const k in surcharges) {
		if (!obj[ k ]) continue;
		surcharge(obj, k, surcharges[ k ]);
	}
}

function addOnDispose(field) {
	const viewProps = field.controller.viewProps;
	if (!viewProps || field.onDispose) return;
	field.onDispose = cb => field.controller.viewProps.handleDispose(
		(...args) => cb(field, ...args)
	);
	field.onDispose(f => (f.disposed = f.destroyed = true));
	addAutoDispose(field);
}

function addVueReactivity(field, cb, cb2) {
	if (!cb2) cb2 = () => field.refresh();
	const unwatch = watch(cb, cb2);
	field.onDispose(unwatch);
}

function addSignalReactivity(field, signal, params, readOnly) {
	let force = true;
	const refresh = (v) => {
		params.value = v;
		force = false;
		field.refresh();
	};
	if (!readOnly) {
		field.on('change', v => {
			signal.set(v.value, force);
			force = true;
		});
	}
	const watcher = signal.watch(refresh);
	field.onDispose(watcher.unwatch);
}

function addAutoDispose(field) {
	if (field.dispose && getCurrentInstance()) {
		onUnmounted(() => field.dispose());
	}
}

export {
	surcharge,
	surchargeObj,
	addOnDispose,
	addVueReactivity,
	addSignalReactivity
};
