function addAppHooks(app) {
	const beforeMounts = [];
	const afterMounts = [];
	const origMount = app.mount.bind(app);
	app.mount = newMount.bind(app);
	app.$onBeforeMount = onBeforeMount;
	app.$onAfterMount = onAfterMount;

	Object.defineProperties(app.config.globalProperties, {
		onBeforeMount: {
			enumerable: false,
			get() { return onBeforeMount },
		},
		onAfterMount: {
			enumerable: false,
			get() { return onAfterMount },
		}
	});

	function onBeforeMount(cb, prepend) {
		prepend ? beforeMounts.unshift(cb) : beforeMounts.push(cb);
	}

	function onAfterMount(cb, prepend) {
		prepend ? afterMounts.unshift(cb) : afterMounts.push(cb);
	}

	async function newMount(a, b) {
		for (const cb of beforeMounts) await cb(app);
		origMount(a, b);
		for (const cb of afterMounts) await cb(app);
		afterMounts.length = beforeMounts.length = 0;
	}
}

export { addAppHooks };
