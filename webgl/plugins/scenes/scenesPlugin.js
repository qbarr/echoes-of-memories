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

	console.log('scenesPlugin');

	const api = {
		list: [],

		create,
		set,
		switch: set,

		update,
		render,
	}

	function create(name, Class) {
		const Scene = new Class();
		Scene.triggerInit();

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


		let CELLS_PER_ROW = 3
		const rows = Math.ceil(api.list.length / CELLS_PER_ROW)
		const cells = Array.from({ length: rows * CELLS_PER_ROW }, (_, i) => {
			const scene = api.list[i]
			if (!scene) return null
			return { title: scene.name, value: scene.component }
		}).filter(Boolean)
		CELLS_PER_ROW = Math.min(CELLS_PER_ROW, cells.length)

		gui.addBlade({
			view: 'buttongrid',
			size: [ CELLS_PER_ROW, rows ],
			cells: (x, y) => cells[ y * CELLS_PER_ROW + x ],
			label: 'Scenes',
		}).on('click', ({ index }) => {
			const { value } = cells[index[1] * CELLS_PER_ROW + index[0]]
			set(value)
		})
	}
	/// #endif

	return {
		install: () => {
			webgl.$scenes = api;
		},
		load: () => {
			webgl.$hooks.afterStart.watchOnce(() => {
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
		}
	}
}
