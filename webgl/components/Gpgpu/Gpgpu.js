import BaseComponent from '#webgl/core/BaseComponent.js';
import particlesShader from '#webgl/shaders/gpgpu/particles.glsl'
import emitShader from '#webgl/shaders/gpgpu/particles-system/emit.glsl'
import cameraShader from '#webgl/shaders/gpgpu/particles-system/camera.glsl'
import { Clock, Uniform, Vector2 } from 'three';

export default class Gpgpu extends BaseComponent {

	constructor(count) {
		super()
		this.isUpdating = false
		this.gpgpu = this.webgl.$gpgpu.create(count)
		this.base = this.gpgpu
		this.clock = new Clock()
		this.previousTime = 0
	}

	setupFromBox(box, { velocity, color, size, life, delay, random }) {
		for(let i = 0; i < this.gpgpu.count; i++) {
			const i3 = i * 3
			const i4 = i * 4
			this.gpgpu.baseTexture.image.data[i4 + 0] = box.min.x + Math.random() * (box.max.x - box.min.x)
			this.gpgpu.baseTexture.image.data[i4 + 1] = box.min.y + Math.random() * (box.max.y - box.min.y)
			this.gpgpu.baseTexture.image.data[i4 + 2] = box.min.z + Math.random() * (box.max.z - box.min.z)
			this.gpgpu.baseTexture.image.data[i4 + 3] = Math.random()
		}
		const cameraPosition =  this.webgl.$getCurrentScene().getCurrentCamera().base.position

		const uniforms = {
			uBoundingBoxX: new Uniform(new Vector2(box.min.x, box.max.x)),
			uBoundingBoxY: new Uniform(new Vector2(box.min.y, box.max.y)),
			uBoundingBoxZ: new Uniform(new Vector2(box.min.z, box.max.z)),
			uCameraPosition: new Uniform(cameraPosition)
		}

		this.setupBase(emitShader, { uniforms })

		return this.gpgpu

	}

	setupFromEmitter(position, { velocity, color, size, life, delay, random }) {

		for(let i = 0; i < this.gpgpu.count; i++)
		{
			const i3 = i * 3
			const i4 = i * 4

			this.gpgpu.baseTexture.image.data[i4 + 0] = position.x
			this.gpgpu.baseTexture.image.data[i4 + 1] = position.y
			this.gpgpu.baseTexture.image.data[i4 + 2] = position.z
			this.gpgpu.baseTexture.image.data[i4 + 3] = 0
		}

		this.setupBase(emitShader)

		return this.gpgpu
	}

	setupFromInstance(instance) {
		const baseGeometry = {}
		baseGeometry.instance = instance
		baseGeometry.count = baseGeometry.instance.attributes.position.count

		for(let i = 0; i < this.gpgpu.count; i++)
		{
			const i3 = i * 3
			const i4 = i * 4

			this.gpgpu.baseTexture.image.data[i4 + 0] = baseGeometry.instance.attributes.position.array[i3 + 0]
			this.gpgpu.baseTexture.image.data[i4 + 1] = baseGeometry.instance.attributes.position.array[i3 + 1]
			this.gpgpu.baseTexture.image.data[i4 + 2] = baseGeometry.instance.attributes.position.array[i3 + 2]
			this.gpgpu.baseTexture.image.data[i4 + 3] = Math.random()
		}


		this.setupBase(emitShader)
		return this.gpgpu
	}

	setupBase(shader, options = {}) {
		const { $viewport, $assets } = this.webgl
		if(!options.uniforms) options.uniforms = {}

		this.gpgpu.variables.particles = this.gpgpu.computation.addVariable('uParticles', shader, this.gpgpu.baseTexture)
		this.gpgpu.computation.setVariableDependencies(this.gpgpu.variables.particles, [ this.gpgpu.variables.particles ])
		// Uniforms
		this.gpgpu.variables.particles.material.uniforms =  {
			uTime: new Uniform(0),
			uDeltaTime: new Uniform(0),
			uBase: new Uniform(this.gpgpu.baseTexture),
			uFlowFieldInfluence: new Uniform(0.4),
			uFlowFieldStrength: new Uniform(2),
			uFlowFieldFrequency: new Uniform(0.5),
		//  uPaint = new Uniform(paintTexture),
			uResolution: new Uniform(
				new Vector2(
					$viewport.size.get().x * $viewport.pixelRatio.get(),
					$viewport.size.get().y * $viewport.pixelRatio.get()
				)
			),
			...options.uniforms

		}
		this.gpgpu.computation.init()
		this.debug()
	}

	debug() {
		const folder = this.webgl.$gui.addFolder({
			title: '🔮 Uniforms gpgpu',
			index: 1,
		})

		const _debug = {
			uFlowFieldFrequency: 0.5,
			uFlowFieldStrength: 2,
			uFlowFieldInfluence: 0.4,
		}

		folder.addBinding(
			_debug,
			'uFlowFieldFrequency',
			{ min: 0, max: 1 }
		).on('change', (e) => {
			console.log(this.gpgpu.variables.particles.material.uniforms.uFlowFieldFrequency.value)
			this.gpgpu.variables.particles.material.uniforms.uFlowFieldFrequency.value = e.value
		})
		console.log(this.gpgpu.variables.particles.material.uniforms)
		folder.addBinding(
			_debug,
			'uFlowFieldStrength',
			{ min: 0, max: 10 }
		).on('change', (e) => {
			this.gpgpu.variables.particles.material.uniforms.uFlowFieldStrength.value = e.value
		})

		folder.addBinding(
			_debug,
			'uFlowFieldInfluence',
			{ min: 0, max: 1 }
		).on('change', (e) => {
			this.gpgpu.variables.particles.material.uniforms.uFlowFieldInfluence.value = e.value
		})

	}

	update() {
		const elapsedTime = this.clock.getElapsedTime()
		const deltaTime = elapsedTime - this.previousTime
		this.previousTime = elapsedTime


		Object.values(this.gpgpu.variables).forEach(variable => {
			if(variable.material.uniforms.uTime) variable.material.uniforms.uTime.value = elapsedTime
			if(variable.material.uniforms.uDeltaTime) variable.material.uniforms.uDeltaTime.value = deltaTime
		})
		this.gpgpu.computation.compute()

	}
}
