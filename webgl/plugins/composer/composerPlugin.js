import createFilter from '#webgl/utils/createFilter';

import CompositeFragment from './CompositePass.frag?hotshader';
import { useUnrealBloom } from './UnrealBloom';

export function composerPlugin(webgl) {
	const buffers = {};
	const filters = {};

	const uniforms = {};
	const defines = {};

	const api = {
		buffers,
		filters,

		uniforms,
		defines,

		resize,
		update,
		render,
	};

	function init() {
		const { $assets, $threeRenderer, $renderer, $hooks, $fbo } = webgl;
		const { textures } = $assets;

		buffers.main = $fbo.createBuffer({ name: 'Main' });
		buffers.selectiveBloom = $fbo.createBuffer({ name: 'Selective Bloom' });
		buffers.depth = $fbo.createBuffer({ name: 'Detph' });
		// buffers.ui = $fbo.createBuffer({ name: 'UI' });

		Object.assign(uniforms, {
			...webgl.uniforms,
			tMap: { value: buffers.main.texture, type: 't' },
			tMapBloom: { value: buffers.selectiveBloom.texture, type: 't' },
		});

		Object.assign(defines, { ...webgl.defines });

		filters.main = createFilter({ uniforms, defines });
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

	function update() {
		const { $scenes } = webgl;
		$scenes.ui.component.triggerUpdate();
	}

	function render() {
		const { $scenes } = webgl;
		const scene = webgl.$getCurrentScene();
		const renderer = webgl.$threeRenderer;

		// Render raw scene to main buffer
		renderer.setRenderTarget(buffers.main);
		renderer.clear();
		scene.toggleSelectedBloom(false);
		scene.triggerRender();
		uniforms.tMap.value = buffers.main.texture;

		// Render selected bloom to selectiveBloom buffer
		renderer.setRenderTarget(buffers.selectiveBloom);
		renderer.clear();
		scene.toggleSelectedBloom(true);
		scene.triggerRender();
		renderer.clearDepth();
		$scenes.ui.component.triggerRender();
		uniforms.tMapBloom.value = buffers.selectiveBloom.texture;

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
