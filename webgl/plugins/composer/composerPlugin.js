import { w } from '#utils/state';
import { WebGLRenderTarget } from 'three';
import { EffectComposer, RenderPass, ShaderPass } from 'three/examples/jsm/Addons.js';
import vertexShader from '#webgl/shaders/composer/vertex.glsl'
import fragmentShader from '#webgl/shaders/composer/fragment.glsl'
import { SelectiveBloomEffect } from 'postprocessing';

export function composerPlugin(webgl) {
	const api = { init, update }
	const target = new WebGLRenderTarget(700, 700, {
		count: 1
	})
	const shaderPass = new ShaderPass({
		uniforms: {
			tDepth: { value: target.texture },
			tDiffuse: { value: null }
		},
		vertexShader,
		fragmentShader
	}, 'tDiffuse')

	function init() {

	    const { $renderer, $scenes, $composer } = webgl
		const scene = $scenes.current.value.component
		const composer = new EffectComposer($renderer.instance);
		$renderer.instance.setRenderTarget(target)
		composer.renderToScreen = true

		const renderPass = new RenderPass(
			scene.base,
			scene.getCurrentCamera().base
		)
		console.log(renderPass)
		composer.addPass(renderPass)
		composer.addPass(shaderPass)
		shaderPass.renderToScreen = true
		$composer.instance = composer
	}

	function bloomEffect() {
		const { $renderer, $scenes, $composer } = webgl
		const scene = $scenes.current.value.component

		const selection = new Selection()
		const selectiveBloom = new SelectiveBloomEffect(scene.base, scene.getCurrentCamera().base, {
			intensity: 1.5
		})
		selectiveBloom.selection = selection
	}

	function update() {

		const { $renderer, $scenes, $composer } = webgl
		// webgl.scene.overrideMaterial = this.depthMaterial
		$renderer.instance.setRenderTarget(target)
		// this.shaderPass.uniforms.uTime.value += .1
		$renderer.instance.clear()
		// console.log(webgl.$scenes.current, webgl.$scenes.current.camera)
		// webgl.$renderer.instance.render(webgl.$scenes.current.value, webgl.$scenes.current.value.camera)
		// shaderPass.uniforms.tDepth.value = target.texture

		$renderer.instance.setRenderTarget(null)
		$renderer.instance.clear()
		$composer.instance.render()

	}

	return {
		install: () => {
			webgl.$composer = api;
		},
		load: () => {
			webgl.$hooks.afterStart.watchOnce(init)
			webgl.$hooks.beforeFrame.watch(update)

		}
	}
}
