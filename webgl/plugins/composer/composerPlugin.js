import createFilter from '#webgl/utils/createFilter';

import CompositeFragment from './CompositePass.frag?hotshader';
import { useUnrealBloom } from './UnrealBloom';

export function composerPlugin(webgl) {
	const buffers = {};
	const filters = {};

	const api = {
		buffers,
		filters,

		resize,
		update,
		render,
	};

	function init() {
		const { $assets, $threeRenderer, $renderer, $hooks, $fbo } = webgl;
		const { textures } = $assets;

		buffers.main = $fbo.createBuffer({
			name: 'Main',
		});

		const uniforms = (api.uniforms = {
			...webgl.uniforms,
			tMap: { value: buffers.main.texture, type: 't' },
		});

		const defines = (api.defines = {
			...webgl.defines,
		});

		filters.main = createFilter({
			// fragmentShader: CompositeFragment,
			uniforms,
			defines,
		});
		CompositeFragment.use(filters.main.material);

		useUnrealBloom(api);

		$renderer.drawingBufferSize.watchImmediate(resize);
		$hooks.beforeUpdate.watch(update);

		__DEBUG__ && devtools();
	}

	function resize({ width, height }) {
		if (!width || !height) return;

		buffers.main.setSize(width, height);
		api.$unrealBloom.resize(width, height);
	}

	function update() {}

	function render() {
		const scene = webgl.$getCurrentScene();
		const renderer = webgl.$threeRenderer;

		// Render raw scene to main buffer
		renderer.setRenderTarget(buffers.main);
		renderer.clear();
		scene?.triggerRender();
		api.uniforms.tMap.value = buffers.main.texture;

		api.$unrealBloom.render(scene);

		// Render composite pass
		renderer.setRenderTarget(null);
		filters.main.render();
	}

	/// #if __DEBUG__
	function devtools() {
		const gui = webgl.$gui.addFolder({ title: '✨ Composer', index: 5 });
		api.$unrealBloom.devtools(gui);
	}
	/// #endif

	return {
		install: () => {
			webgl.$composer = api;
		},
		load: () => {
			webgl.$hooks.afterStart.watchOnce(init);
		},
	};
}
