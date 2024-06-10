import BaseComponent from '#webgl/core/BaseComponent.js';
import { Clock, Uniform, Vector2 } from 'three';
import { presetsShader } from '#utils/presets/shaders.js';
import { Vector3 } from 'three';

export default class Gpgpu extends BaseComponent {

	constructor(count, options) {
		super()
		this.isUpdating = false
		this.gpgpu = this.webgl.$gpgpu.create(count)
		this.options = options
		this.base = this.gpgpu
		this.clock = new Clock()
		this.previousTime = 0
	}

	setupFromBox(box, opts = {}) {
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
			uCameraPosition: new Uniform(cameraPosition),
			uFlowFieldStrength: new Uniform(1.2),
			uFlowFieldInfluence: new Uniform(0.8),
		}


		this.setupBase(presetsShader.gpgpu.base, { uniforms })

		return this.gpgpu

	}

	setupFromEmitter(position = new Vector3(0), opts) {

		for(let i = 0; i < this.gpgpu.count; i++)
		{
			const i3 = i * 3
			const i4 = i * 4

			this.gpgpu.baseTexture.image.data[i4 + 0] = position.x
			this.gpgpu.baseTexture.image.data[i4 + 1] = position.y
			this.gpgpu.baseTexture.image.data[i4 + 2] = position.z
			this.gpgpu.baseTexture.image.data[i4 + 3] = 0
		}

		this.setupBase(presetsShader.gpgpu.base)

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


		this.setupBase(presetsShader.gpgpu.base)
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
			...options.uniforms,
			// ...this.options.uniforms

		}
		this.gpgpu.computation.init()

		/// #if __DEBUG__
		this.devTools()
		/// #endif
	}

	/// #if __DEBUG__
	devTools() {
		const folder = this.webgl.$gui.addFolder({
			title: '🔮 Uniforms gpgpu',
			index: 1,
		})
		const uniforms = this.gpgpu.variables.particles.material.uniforms
		const _debug = {
			uFlowFieldFrequency: uniforms.uFlowFieldFrequency.value,
			uFlowFieldStrength: uniforms.uFlowFieldStrength.value,
			uFlowFieldInfluence: uniforms.uFlowFieldInfluence.value,
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
	/// #endif

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
