import BaseComponent from '#webgl/core/BaseComponent';
import { AdditiveBlending, AlwaysDepth, AmbientLight, BufferAttribute, BufferGeometry, Clock, Color, Float32BufferAttribute, InstancedBufferAttribute, InstancedBufferGeometry, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, NeverDepth, PlaneGeometry, Points, PointsMaterial, ShaderMaterial, SphereGeometry, TorusKnotGeometry, Uniform, Vector2, Vector3 } from 'three';
import Gpgpu from '../Gpgpu/Gpgpu';
import { presetsShader } from '#utils/presets/shaders.js';
export class Particles extends BaseComponent {

	init() {
		const { vertex, fragment } = this.props

		this.shader = {
			vertex: vertex || presetsShader.particles.base.vertex,
			fragment: fragment || presetsShader.particles.base.fragment
		}
	}

	afterInit() {
		const { instance, count, options, position, boundingBox, gpgpu } = this.props
		this.instance = instance
		this.boundingBox = boundingBox
		const _count = this.instance ? this.instance.attributes.position.count : count
		this.gpgpu = this.add(Gpgpu, _count, gpgpu)
		if (this.instance) this.gpgpu.setupFromInstance(this.instance)
		else if (this.boundingBox) this.gpgpu.setupFromBox(this.boundingBox, options)
		else this.gpgpu.setupFromEmitter(position, options)
		this.createParticles(this.gpgpu.base)
	}

	createParticles(gpgpu) {
		const { $viewport, $assets } = this.webgl
		const particles = {}

		// Geometry
		const particlesUvArray = new Float32Array(gpgpu.count * 2)
		const sizesArray = new Float32Array(gpgpu.count)

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

		particles.geometry.setDrawRange(0, gpgpu.count)
		particles.geometry.setAttribute('aParticlesUv', new BufferAttribute(particlesUvArray, 2))
		particles.geometry.setAttribute('aSize', new BufferAttribute(sizesArray, 1))
		if (this.instance) particles.geometry.setAttribute('aColor', this.instance.attributes.color)

		const propsMaterial = this.props.material || {}
		const propsUniforms = Object.assign({}, propsMaterial?.uniforms) || {}
		delete propsMaterial?.uniforms
		// Material
		particles.material = new ShaderMaterial({
			vertexShader: this.shader.vertex,
			fragmentShader: this.shader.fragment,
			uniforms:
			{
				uSize: new Uniform(0.03),
				uResolution: new Uniform(
					new Vector2(
						$viewport.size.get().x * $viewport.pixelRatio.get(),
						$viewport.size.get().y * $viewport.pixelRatio.get()
					)
				),
				uParticlesTexture: new Uniform(),
				...propsUniforms
			},
			transparent: true,
			// depthWrite: false,
			// depthTest: false,
			...propsMaterial
		})

		particles.points = new Points(particles.geometry, particles.material)
		this.particleMaterial = particles.material
		this.base = particles.points
	}

	update() {
		this.particleMaterial.uniforms.uParticlesTexture.value = this.gpgpu.base.computation.getCurrentRenderTarget(this.gpgpu.base.variables.particles).texture
	}
}
