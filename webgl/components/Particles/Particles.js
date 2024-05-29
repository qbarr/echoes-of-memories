import BaseComponent from '#webgl/core/BaseComponent';
import { AmbientLight, BufferAttribute, BufferGeometry, Clock, Float32BufferAttribute, InstancedBufferAttribute, InstancedBufferGeometry, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, PlaneGeometry, Points, PointsMaterial, ShaderMaterial, SphereGeometry, TorusKnotGeometry, Uniform, Vector2, Vector3 } from 'three';
import vertexShader from '#webgl/shaders/particles/vertex.glsl'
import fragmentShader from '#webgl/shaders/particles/fragment.glsl'

import particlesShader from '#webgl/shaders/gpgpu/particles.glsl'
import { GPUComputationRenderer, MeshSurfaceSampler } from 'three/examples/jsm/Addons';
import { gpgpuPlugin } from '#webgl/plugins/gpgpu/gpgpuPlugin';

export class Particles extends BaseComponent {

	afterInit() {
		this.createGPGPU2()
	}

	createGPGPU2() {

		const { $viewport, $gpgpu } = this.webgl
		const baseGeometry = {}
		baseGeometry.instance = this.webgl.$assets.objects.scene1.scene.children[0].geometry.clone()
		baseGeometry.count = baseGeometry.instance.attributes.position.count
		const gpgpu = $gpgpu.create({ instance: baseGeometry.instance })
			/**
		 * GPU Compute
		 */
		// Setup

		gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.count))
		gpgpu.computation = new GPUComputationRenderer(gpgpu.size, gpgpu.size, this.webgl.$renderer.instance)
		// Base particles
		const baseParticlesTexture = gpgpu.computation.createTexture()

		for(let i = 0; i < baseGeometry.count; i++)
		{
			const i3 = i * 3
			const i4 = i * 4

			// Position based on geometry
			baseParticlesTexture.image.data[i4 + 0] = baseGeometry.instance.attributes.position.array[i3 + 0]
			baseParticlesTexture.image.data[i4 + 1] = baseGeometry.instance.attributes.position.array[i3 + 1]
			baseParticlesTexture.image.data[i4 + 2] = baseGeometry.instance.attributes.position.array[i3 + 2]
			baseParticlesTexture.image.data[i4 + 3] = Math.random()
		}

		// Particles variable
		gpgpu.particlesVariable = gpgpu.computation.addVariable('uParticles', particlesShader, baseParticlesTexture)
		gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [ gpgpu.particlesVariable ])

		// Uniforms
		gpgpu.particlesVariable.material.uniforms.uTime = new Uniform(0)
		gpgpu.particlesVariable.material.uniforms.uDeltaTime = new Uniform(0)
		gpgpu.particlesVariable.material.uniforms.uBase = new Uniform(baseParticlesTexture)
		gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence = new Uniform(0.4)
		gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength = new Uniform(2)
		gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency = new Uniform(0.5)
		// gpgpu.particlesVariable.material.uniforms.uPaint = new Uniform(paintTexture)
		gpgpu.particlesVariable.material.uniforms.uResolution = new Uniform(
			new Vector2(
				$viewport.size.get().x * $viewport.pixelRatio.get(),
				$viewport.size.get().y * $viewport.pixelRatio.get()
			)
		)

		// Init
		gpgpu.computation.init()

		// Debug
		gpgpu.debug = new Mesh(
			new PlaneGeometry(3, 3),
			new MeshBasicMaterial({ map: gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture })
		)
		gpgpu.debug.position.x = 3
		gpgpu.debug.visible = false
		// this.parent.add(gpgpu.debug)

		/**
		 * Particles
		 */
		const particles = {}

		// Geometry
		const particlesUvArray = new Float32Array(baseGeometry.count * 2)
		const sizesArray = new Float32Array(baseGeometry.count)

		for(let y = 0; y < gpgpu.size; y++)
		{
			for(let x = 0; x < gpgpu.size; x++)
			{
				const i = (y * gpgpu.size + x);
				const i2 = i * 2

				// UV
				const uvX = (x + 0.5) / gpgpu.size;
				const uvY = (y + 0.5) / gpgpu.size;

				particlesUvArray[i2 + 0] = uvX;
				particlesUvArray[i2 + 1] = uvY;

				// Size
				sizesArray[i] = Math.random()
			}
		}

		particles.geometry = new BufferGeometry()

		particles.geometry.setDrawRange(0, baseGeometry.count)
		particles.geometry.setAttribute('aParticlesUv', new BufferAttribute(particlesUvArray, 2))
		particles.geometry.setAttribute('aColor', baseGeometry.instance.attributes.color)
		particles.geometry.setAttribute('aSize', new BufferAttribute(sizesArray, 1))

		// Material
		particles.material = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms:
			{
				uSize: new Uniform(0.03),
				uResolution: new Uniform(
					new Vector2(
						$viewport.size.get().x * $viewport.pixelRatio.get(),
						$viewport.size.get().y * $viewport.pixelRatio.get()
					)
				),
				uParticlesTexture: new Uniform()
			}
		})

		// Points
		particles.points = new Points(particles.geometry, particles.material)
		this.base = particles.points
		this.gpgpu = gpgpu
		this.material = particles.material
	}

	createGPGPU() {
		const { $viewport } = this.webgl
		const baseGeometry = {}
		baseGeometry.instance = this.webgl.$assets.objects.scene1.scene.children[0].geometry.clone()
		baseGeometry.count = baseGeometry.instance.attributes.position.count

		/**
		 * GPU Compute
		 */
		// Setup
		const gpgpu = {}
		gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.count))
		gpgpu.computation = new GPUComputationRenderer(gpgpu.size, gpgpu.size, this.webgl.$renderer.instance)
		// Base particles
		const baseParticlesTexture = gpgpu.computation.createTexture()

		for(let i = 0; i < baseGeometry.count; i++)
		{
			const i3 = i * 3
			const i4 = i * 4

			// Position based on geometry
			baseParticlesTexture.image.data[i4 + 0] = baseGeometry.instance.attributes.position.array[i3 + 0]
			baseParticlesTexture.image.data[i4 + 1] = baseGeometry.instance.attributes.position.array[i3 + 1]
			baseParticlesTexture.image.data[i4 + 2] = baseGeometry.instance.attributes.position.array[i3 + 2]
			baseParticlesTexture.image.data[i4 + 3] = Math.random()
		}

		// Particles variable
		gpgpu.particlesVariable = gpgpu.computation.addVariable('uParticles', particlesShader, baseParticlesTexture)
		gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [ gpgpu.particlesVariable ])

		// Uniforms
		gpgpu.particlesVariable.material.uniforms.uTime = new Uniform(0)
		gpgpu.particlesVariable.material.uniforms.uDeltaTime = new Uniform(0)
		gpgpu.particlesVariable.material.uniforms.uBase = new Uniform(baseParticlesTexture)
		gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence = new Uniform(0.4)
		gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength = new Uniform(2)
		gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency = new Uniform(0.5)
		// gpgpu.particlesVariable.material.uniforms.uPaint = new Uniform(paintTexture)
		gpgpu.particlesVariable.material.uniforms.uResolution = new Uniform(
			new Vector2(
				$viewport.size.get().x * $viewport.pixelRatio.get(),
				$viewport.size.get().y * $viewport.pixelRatio.get()
			)
		)

		// Init
		gpgpu.computation.init()

		// Debug
		gpgpu.debug = new Mesh(
			new PlaneGeometry(3, 3),
			new MeshBasicMaterial({ map: gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture })
		)
		gpgpu.debug.position.x = 3
		gpgpu.debug.visible = false
		// this.parent.add(gpgpu.debug)

		/**
		 * Particles
		 */
		const particles = {}

		// Geometry
		const particlesUvArray = new Float32Array(baseGeometry.count * 2)
		const sizesArray = new Float32Array(baseGeometry.count)

		for(let y = 0; y < gpgpu.size; y++)
		{
			for(let x = 0; x < gpgpu.size; x++)
			{
				const i = (y * gpgpu.size + x);
				const i2 = i * 2

				// UV
				const uvX = (x + 0.5) / gpgpu.size;
				const uvY = (y + 0.5) / gpgpu.size;

				particlesUvArray[i2 + 0] = uvX;
				particlesUvArray[i2 + 1] = uvY;

				// Size
				sizesArray[i] = Math.random()
			}
		}

		particles.geometry = new BufferGeometry()

		particles.geometry.setDrawRange(0, baseGeometry.count)
		particles.geometry.setAttribute('aParticlesUv', new BufferAttribute(particlesUvArray, 2))
		particles.geometry.setAttribute('aColor', baseGeometry.instance.attributes.color)
		particles.geometry.setAttribute('aSize', new BufferAttribute(sizesArray, 1))

		// Material
		particles.material = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms:
			{
				uSize: new Uniform(0.03),
				uResolution: new Uniform(
					new Vector2(
						$viewport.size.get().x * $viewport.pixelRatio.get(),
						$viewport.size.get().y * $viewport.pixelRatio.get()
					)
				),
				uParticlesTexture: new Uniform()
			}
		})

		// Points
		particles.points = new Points(particles.geometry, particles.material)
		this.base = particles.points
		this.gpgpu = gpgpu
		this.material = particles.material

	}

	update() {
		this.gpgpu.computation.compute()
		this.material.uniforms.uParticlesTexture.value = this.gpgpu.computation.getCurrentRenderTarget(this.gpgpu.particlesVariable).texture
		this.gpgpu.particlesVariable.material.uniforms.uTime.value = this.webgl.$time.elapsed
		this.gpgpu.particlesVariable.material.uniforms.uDeltaTime.value = this.webgl.$time.dt
	}
}
