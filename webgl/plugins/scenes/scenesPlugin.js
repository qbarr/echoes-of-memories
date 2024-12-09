import { w } from '#utils/state';
/// #if __DEBUG__
/// #code import { storageSync } from '#utils/state';
/// #endif

const NOOP = (v) => v;

export function scenesPlugin(webgl) {
	const current = w(null);
	/// #if __DEBUG__
	/// #code const savedCurrentScene = storageSync('webgl:scenesPlugin:current', w(null));
	/// #endif

	const api = {
		list: [],

		get current() {
			return current.value;
		},
		_current: current,

		create,
		set,
		switch: set,
		get,

		getSceneByComponent,

		update,
		render,
	};

	function init() {
		api.list.forEach((scene) => scene.component.triggerInit());
	}

	function create(name, Class, opts = {}) {
		const Scene = new Class();

		const s = (api[name] = {
			...opts,

			name,
			id: Symbol(name),
			isActive: true,
			needsUpdate: true,
			needsRender: true,
			component: Scene,

			enter: Scene.triggerEnter.bind(Scene),
			leave: Scene.triggerLeave.bind(Scene),
			update: Scene.triggerUpdate.bind(Scene),
			render: Scene.triggerRender.bind(Scene),
		});

		api.list.push(s);

		return s;
	}

	function getSceneByComponent(component) {
		return api.list.find((s) => s.component === component);
	}

	function get(id) {
		if (!api[id]) throw new Error(`Scene with id ${id} not found`);
		return api[id].component;
	}

	async function set(scene, force = false) {
		if (typeof scene === 'string') scene = api[scene];
		if (scene.isScene) scene = getSceneByComponent(scene);
		if (!scene) return;

		const prevScene = api.current;
		const nextScene = scene;

		if (prevScene === nextScene && !force) return;

		if (prevScene) {
			await prevScene.leave({ to: nextScene });

			prevScene.isActive = false;
			prevScene.needsUpdate = false;
			prevScene.needsRender = false;

			prevScene.component.detach();
		}

		/// #if __DEBUG__
		/// #code savedCurrentScene.set(nextScene.name);
		/// #endif
		current.set(nextScene);

		nextScene.component.attach();

		await nextScene.enter({ from: prevScene });
		nextScene.isActive = true;
		nextScene.needsUpdate = true;
		nextScene.needsRender = true;
	}

	function update() {
		const scene = current.value;
		if (!scene) return;
		scene.needsUpdate && scene.update();
	}

	function render() {
		const scene = current.value;
		if (!scene) return;
		scene.needsRender && scene.render();
	}

	/// #if __DEBUG__
	function devtools() {
		const gui = webgl.$gui.addFolder({ title: '🐠 Scenes', index: 1 });

		const o = { name: '' };
		const sceneMonitor = gui.addBinding(o, 'name', {
			label: 'Current Scene',
			readonly: true,
		});

		const select = gui
			.addBlade({
				view: 'list',
				label: 'Scenes',
				options: api.list.map((scene) => ({
					text: scene.name,
					value: scene.name,
				})),
				value: current.value.name,
			})
			.on('change', ({ value }) => set(value));

		current.watchImmediate(({ name }) => {
			o.name = name;
			select.value = name;
		});
	}
	/// #endif

	return {
		install: () => {
			webgl.$scenes = api;
			webgl.$getCurrentScene = () => api.current.component;
		},
		load: () => {
			webgl.$hooks.beforeStart.watchOnce(() => {
				init();

				if (!current.value) {
					/// #if __DEBUG__
					if (api[savedCurrentScene.value]) set(savedCurrentScene.value, true);
					else set(api.list[0], true);
					/// #else
					let scene = api.list.find((s) => s.default === true);
					scene = scene || api.list[0];
					set(scene, true);
					/// #endif
				}

				for (let i = 0; i < api.list.length; i++) {
					const scene = api.list[i];
					if (scene.isActive) continue;
					scene.component.detach();
				}

				__DEBUG__ && devtools();
			});
		},
	};
}
