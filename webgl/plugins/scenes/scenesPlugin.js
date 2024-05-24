import { w } from '#utils/state';
/// #if __DEBUG__
/// #code import { storageSync } from '#utils/state';
/// #endif


const NOOP = v => v;

export function scenesPlugin(webgl) {
	const current = w(null)
	/// #if __DEBUG__
	/// #code const savedCurrentScene = storageSync('webgl:scenesPlugin:current', w(null));
	/// #endif


	const api = {
		list: [],
		current,

		get current() {
			return current.value;
		},

		create,
		set,
		switch: set,
		get,

		update,
		render,
	}

	function init() {
		api.list.forEach(scene => scene.component.triggerInit());
	}

	function create(name, Class) {
		const Scene = new Class();

		const s = api[ name ] = {
			name,
			id: Symbol(name),
			isActive: true,
			needsUpdate: true,
			needsRender: true,
			component: Scene,

			leave: Scene.leave.bind(Scene),
			enter: Scene.enter.bind(Scene),
			update: Scene.triggerUpdate.bind(Scene),
			render: Scene.triggerRender.bind(Scene),
		};

		api.list.push(s);

		return s;
	}

	function getSceneByComponent(component) {
		return api.list.find(s => s.component === component);
	}

	function get(id) {
		if(!api[id]) throw new Error(`Scene with id ${id} not found`);
		return api[id].component;
	}

	async function set(scene, force = false) {
		if (typeof scene === 'string') scene = api[scene];
		if (scene.isScene) scene = getSceneByComponent(scene);
		if (!scene) return;

		const curScene = current.value;
		if (curScene === scene && !force) return;

		if (curScene) {
			await curScene.leave()
			curScene.isActive = false;
			curScene.needsUpdate = false;
			curScene.needsRender = false;

			curScene.component.detach();
		}

		/// #if __DEBUG__
		/// #code savedCurrentScene.set(scene.name);
		/// #endif
		current.set(scene);
		const nextScene = current.value;

		nextScene.component.attach();

		await nextScene.enter();
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
		const gui = webgl.$gui.addFolder({ title: 'Scenes' });

		const o = { name: '' }
		const sceneMonitor = gui.addBinding(o, 'name', {
			label: 'Current Scene',
			readonly: true,
		})
		current.watchImmediate(({ name }) => o.name = name)

		gui.addBlade({
			view: 'list',
			label: 'Scenes',
			options: api.list.map(scene => ({
				text: scene.name,
				value: scene.name,
			})),
			value: current.value.name,
		}).on('change', ({ value }) => set(value))
	}
	/// #endif

	return {
		install: () => {
			webgl.$scenes = api;
		},
		load: () => {
			webgl.$hooks.beforeStart.watchOnce(() => {
				init()

				if (!current.value) {
					set(savedCurrentScene.value ?? api.list[0], true);
				}

				for (let i = 0; i < api.list.length; i++) {
					const scene = api.list[i];
					if (scene.isActive) continue
					scene.component.detach();
				}

				__DEBUG__ && devtools();
			})

			webgl.$getCurrentScene = () => current.value.component;
		}
	}
}
