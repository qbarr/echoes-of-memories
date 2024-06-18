import { presetsShader } from '#utils/presets/shaders.js';
import BaseComponent from '#webgl/core/BaseComponent.js';
import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	Group,
	Object3D,
	Points,
	ShaderMaterial,
	Uniform,
	Vector2,
} from 'three';

export class Particles extends BaseComponent {
	init() {
		const { vertex, fragment } = this.props.options;

		this.shader = {
			vertex: vertex || presetsShader.particles.base.vertex,
			fragment: fragment || presetsShader.particles.base.fragment,
		};

		this.initParticles();
		this.initDustParticles();

		this.textures = {
			particles: null,
			dustParticles: null,
		};
	}

	initParticles() {
		const { scene, gpgpu } = this.props;

		const { $viewport, $assets } = this.webgl;
		const particles = {};

		// Geometry
		const particlesUvArray = new Float32Array(gpgpu.count * 2);
		const sizesArray = new Float32Array(gpgpu.count);

		for (let y = 0; y < gpgpu.size; y++) {
			for (let x = 0; x < gpgpu.size; x++) {
				const i = y * gpgpu.size + x;
				const i2 = i * 2;

				// UV
				const uvX = (x + 0.5) / gpgpu.size;
				const uvY = (y + 0.5) / gpgpu.size;

				particlesUvArray[i2 + 0] = uvX;
				particlesUvArray[i2 + 1] = uvY;

				// Size
				sizesArray[i] = Math.random();
			}
		}

		let colorsArray = [];
		for (let i = 0; i < gpgpu.count; i++) {
			const i3 = i * 3;
			const i4 = i * 4;

			colorsArray[i4 + 0] = 1;
			colorsArray[i4 + 1] = 1;
			colorsArray[i4 + 2] = 1;
			colorsArray[i4 + 3] = 1;
		}
		colorsArray = new BufferAttribute(new Float32Array(colorsArray), 4);
		if (gpgpu.instance) colorsArray = gpgpu.instance.attributes.color;
		// console.log(gpgpu.instance.attributes)
		// const newColor = new BufferAttribute(
		// 	gpgpu.instance.attributes.color.map(),
		// 	4
		// )
		particles.geometry = new BufferGeometry();
		particles.geometry.setDrawRange(0, gpgpu.count);
		particles.geometry.setAttribute(
			'aParticlesUv',
			new BufferAttribute(particlesUvArray, 2),
		);
		particles.geometry.setAttribute('aSize', new BufferAttribute(sizesArray, 1));
		particles.geometry.setAttribute('aColor', colorsArray);
		// console.log(colorsArray)
		const propsMaterial = this.props.material || {};
		const propsUniforms = Object.assign({}, propsMaterial?.uniforms) || {};
		delete propsMaterial?.uniforms;
		// Material

		particles.material = new ShaderMaterial({
			vertexShader: this.shader.vertex,
			fragmentShader: this.shader.fragment,
			uniforms: {
				uSize: new Uniform(0.03),
				uResolution: new Uniform(
					new Vector2(
						$viewport.size.get().x * $viewport.pixelRatio.get(),
						$viewport.size.get().y * $viewport.pixelRatio.get(),
					),
				),
				uParticlesTexture: new Uniform(),
				...propsUniforms,
			},
			transparent: true,
			// blending: AdditiveBlending,
			// depthWrite: false,
			// depthTest: false,
			...propsMaterial,
		});

		particles.points = new Points(particles.geometry, particles.material);
		particles.points.frustumCulled = false;
		this.particleMaterial = particles.material;
		this.base = new Group();
		this.addObject3D(particles.points);
	}

	initDustParticles() {
		const { scene, gpgpu } = this.props;

		const { $viewport, $assets } = this.webgl;
		const particles = {};

		// Geometry
		const count = 100000;
		const particlesUvArray = new Float32Array(count * 2);
		const sizesArray = new Float32Array(count);
		const size = Math.ceil(Math.sqrt(count));

		for (let y = 0; y < size; y++) {
			for (let x = 0; x < size; x++) {
				const i = y * size + x;
				const i2 = i * 2;

				// UV
				const uvX = (x + 0.5) / size;
				const uvY = (y + 0.5) / size;

				particlesUvArray[i2 + 0] = uvX;
				particlesUvArray[i2 + 1] = uvY;

				// Size
				sizesArray[i] = Math.random();
			}
		}
		// console.log(sizesArray)

		particles.geometry = new BufferGeometry();
		// const colorsArray = new Float32Array(count * 3)

		// for(let i = 0; i < count; i++) {
		// 	colorsArray[i * 3 + 0] = .5 + (Math.random() * .5)
		// 	colorsArray[i * 3 + 1] = .5 + (Math.random() * .5)
		// 	colorsArray[i * 3 + 2] = .5 + (Math.random() * .5)
		// }
		const colorsArray = gpgpu.instance.attributes.color.array.slice(0, count * 4);
		// console.log(gpgpu.instance.attributes.color)
		// const colorsArray
		particles.geometry.setDrawRange(0, count);
		particles.geometry.setAttribute(
			'aParticlesUv',
			new BufferAttribute(particlesUvArray, 2),
		);
		particles.geometry.setAttribute('aSize', new BufferAttribute(sizesArray, 1));
		particles.geometry.setAttribute('aColor', new BufferAttribute(colorsArray, 4));
		// console.log(colorsArray)
		const propsMaterial = this.props.material || {};
		const propsUniforms = Object.assign({}, propsMaterial?.uniforms) || {};
		delete propsMaterial?.uniforms;
		// Material

		particles.material = new ShaderMaterial({
			vertexShader: this.shader.vertex,
			fragmentShader: this.shader.fragment,
			uniforms: {
				uSize: new Uniform(0.03),
				uResolution: new Uniform(
					new Vector2(
						$viewport.size.get().x * $viewport.pixelRatio.get(),
						$viewport.size.get().y * $viewport.pixelRatio.get(),
					),
				),
				uParticlesTexture: new Uniform(),
				// ...propsUniforms
			},
			transparent: true,
			// blending: AdditiveBlending,
			// depthWrite: false,
			// depthTest: false,
			// ...propsMaterial
		});
		particles.points = new Points(particles.geometry, particles.material);
		particles.points.frustumCulled = false;
		this.dustMaterial = particles.material;
		this.addObject3D(particles.points);
		this.gpgpu = gpgpu;
	}

	update() {
		const elapsed = this.webgl.$time.elapsed;
		const modelParticlesTexture = this.gpgpu.computation.getCurrentRenderTarget(
			this.gpgpu.variables.particles,
		).texture;
		const dustParticlesTexture = this.gpgpu.computation.getCurrentRenderTarget(
			this.gpgpu.variables.dustParticles,
		).texture;
		this.particleMaterial.uniforms.uParticlesTexture.value = modelParticlesTexture;
		this.dustMaterial.uniforms.uParticlesTexture.value = dustParticlesTexture;
	}
}
