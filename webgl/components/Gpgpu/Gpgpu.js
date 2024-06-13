import BaseComponent from '#webgl/core/BaseComponent.js';
import { Clock, Uniform, Vector2 } from 'three';
import { presetsShader } from '#utils/presets/shaders.js';
import { Vector3 } from 'three';
import { raftween } from '#utils/anim/raftween.js';
import { bezier } from '#utils/anim/bezier.js';
import { easings } from '#utils/anim/easings.js';

export default class Gpgpu extends BaseComponent {

	constructor({ count, options }) {
		super()
		this.isUpdating = false
		this.gpgpu = this.webgl.$gpgpu.create(count)
		this.options = options
		this.base = this.gpgpu

		this.clock = new Clock()
		this.previousTime = 0
		this.tweens = []
		this.index = 0
	}




	setupFromBox(box, opts = {}) {
		const optsUniforms = opts.uniforms || {}
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
			// ...optsUniforms
		}


		this.setupBase(presetsShader.gpgpu.base, { uniforms })

		return this.gpgpu

	}

	setupFromEmitter(position = new Vector3(0), opts) {
		const uniforms = opts.uniforms || {}

		for(let i = 0; i < this.gpgpu.count; i++)
		{
			const i3 = i * 3
			const i4 = i * 4

			this.gpgpu.baseTexture.image.data[i4 + 0] = position.x
			this.gpgpu.baseTexture.image.data[i4 + 1] = position.y
			this.gpgpu.baseTexture.image.data[i4 + 2] = position.z
			this.gpgpu.baseTexture.image.data[i4 + 3] = 0
		}

		this.setupBase(presetsShader.gpgpu.base, { uniforms, ...opts })

		return this.gpgpu
	}

	setupFromInstance(instance, opts) {
		const uniforms = opts.uniforms || {}
		const baseGeometry = {}
		baseGeometry.instance = instance
		baseGeometry.count = baseGeometry.instance.attributes.position.count

		this.gpgpu.attributesTexture = this.gpgpu.computation.createTexture();
		this.gpgpu.baseModelTexture = this.gpgpu.computation.createTexture();


		const additiveDustParticles = 100

		for(let i = 0; i < this.gpgpu.count; i++)
		{
			const i3 = i * 3
			const i4 = i * 4

			const range = this.gpgpu.count / 10

			// const ease = bezier(easings.outSwift)
			const indexRange = i / range

			const friction = Math.random() * 0.035 + 0.96

			this.gpgpu.baseTexture.image.data[i4 + 0] = baseGeometry.instance.attributes.position.array[i3 + 0]
			this.gpgpu.baseTexture.image.data[i4 + 1] = baseGeometry.instance.attributes.position.array[i3 + 1]
			this.gpgpu.baseTexture.image.data[i4 + 2] = baseGeometry.instance.attributes.position.array[i3 + 2]
			this.gpgpu.baseTexture.image.data[i4 + 3] = Math.random()

			let distance =  10 + Math.random() * 4
			if (Math.random() < .1) distance += 2 + Math.random() * 10
			// this.gpgpu.baseTexture.image.data[i4 + 0] = Math.random() * distance - distance / 2
			// this.gpgpu.baseTexture.image.data[i4 + 1] = Math.random() * distance - distance / 2
			// this.gpgpu.baseTexture.image.data[i4 + 2] = Math.random() * distance - distance / 2
			// this.gpgpu.baseTexture.image.data[i4 + 3] = Math.random()


			this.gpgpu.attributesTexture.image.data[i4 + 0] = indexRange // assign a range to each particle
			this.gpgpu.attributesTexture.image.data[i4 + 1] = friction
			this.gpgpu.attributesTexture.image.data[i4 + 2] = 0
			this.gpgpu.attributesTexture.image.data[i4 + 3] = 0


		}
		this.setupBase(presetsShader.gpgpu.base, { uniforms, ...opts })
		return this.gpgpu
	}

	setupBase(shader, opts = {}) {
		const { $viewport, $assets } = this.webgl
		const uniforms = opts.uniforms || {}

		this.gpgpu.variables.particles = this.gpgpu.computation.addVariable('uParticles', shader, this.gpgpu.baseTexture)
		this.gpgpu.computation.setVariableDependencies(this.gpgpu.variables.particles, [ this.gpgpu.variables.particles ])
		// Uniforms
		this.gpgpu.variables.particles.material.uniforms =  {
			uTime: new Uniform(0),
			uDeltaTime: new Uniform(0),
			uBase: new Uniform(this.gpgpu.baseTexture),
			uAttributes: new Uniform(this.gpgpu.attributesTexture),
			uBaseModel: new Uniform(this.gpgpu.baseModelTexture),
			uFlowFieldFrequency: new Uniform(0.5),
			uFlowFieldInfluence: new Uniform(0.4),
			uFlowFieldStrength: new Uniform(2),
			uIsMorphing: new Uniform(false),
			uPercentRange: new Uniform(0),
		//  uPaint = new Uniform(paintTexture),
			uResolution: new Uniform(
				new Vector2(
					$viewport.size.get().x * $viewport.pixelRatio.get(),
					$viewport.size.get().y * $viewport.pixelRatio.get()
				)
			),
			...uniforms

		}

		this.gpgpu.computation.init()

		/// #if __DEBUG__
		this.devTools()
		/// #endif
	}

	/// #if __DEBUG__
	devTools() {
		const folder = this.webgl.$gui.addFolder({
			title: '🎉 Particles',
			index: 1,
		})
		const uniforms = this.gpgpu.variables.particles.material.uniforms
		const _debug = {
			uFlowFieldFrequency: uniforms.uFlowFieldFrequency.value,
			uFlowFieldStrength: uniforms.uFlowFieldStrength.value,
			uFlowFieldInfluence: uniforms.uFlowFieldInfluence.value,
			uIsMorphing: uniforms.uIsMorphing.value,
		}

		folder.addBinding(
			_debug,
			'uFlowFieldFrequency',
			{ min: 0, max: 1 }
		).on('change', (e) => {

			this.gpgpu.variables.particles.material.uniforms.uFlowFieldFrequency.value = e.value
		})

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

		folder.addBinding(
			_debug,
			'uIsMorphing'
		).on('change', (e) => {
			this.gpgpu.variables.particles.material.uniforms.uIsMorphing.value = e.value

		})

	}
	/// #endif

	// uniformsTo(uniforms) {
	// 	Object.keys(uniforms).forEach((uniformKey, i) => {
	// 		const tween = raftween({
	// 			from: this.gpgpu.variables.particles.material.uniforms[uniformKey].value,
	// 			to: uniforms[uniformKey].value,
	// 			duration: 5,
	// 			onProgress: (progress, value) => {
	// 				this.gpgpu.variables.particles.material.uniforms[uniformKey].value = value
	// 			}
	// 		})
	// 		this.tweens.push(tween)
	// 		tween.play()
	// 	})

	// }

	update() {
		// console.log(this.index)
		this.index++

		Object.values(this.gpgpu.variables).forEach(variable => {
			if(variable.material.uniforms.uTime) variable.material.uniforms.uTime.value = this.webgl.$time.elapsed / 1000
			if(variable.material.uniforms.uDeltaTime) variable.material.uniforms.uDeltaTime.value = this.webgl.$time.dt / 1000
			// if(variable.material.uniforms.uPercentRange) variable.material.uniforms.uPercentRange.value += 0.04
		})

		this.tweens.forEach(tween => tween.update(this.webgl.$time.dt / 1000))
		this.gpgpu.computation.compute()
	}
}
