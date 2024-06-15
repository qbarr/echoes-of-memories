import { presetsShader } from '#utils/presets/shaders.js';
import { w } from '#utils/state/index.js';
import { Uniform, Vector2 } from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';

export function gpgpuPlugin(webgl) {
	const computedsGPGPU = w([]);
	const api = { create, createPooling, computedsGPGPU, render };
	let index = 0
	api.pool = createPooling(100);
	api.pool.alloc(5);

	function createPooling(nbPixels) {
		const pool = [];

		function get() {
			const item = pool.pop() || create(nbPixels);
			return item;
		}

		function release(gpgpu) {
			pool.push(gpgpu);
			return gpgpu;
		}

		function alloc(count) {
			if (count <= 0) return;
			while (count--) release(create(nbPixels));
		}

		return { get, release, alloc, pool };
	}

	function create(count) {
		const gpgpu = {};
		gpgpu.variables = {};
		gpgpu.count = count;
		gpgpu.size = Math.ceil(Math.sqrt(count));
		gpgpu.computation = new GPUComputationRenderer(
			gpgpu.size,
			gpgpu.size,
			webgl.$renderer.instance,
		);
		gpgpu.baseTexture = gpgpu.computation.createTexture();

		return gpgpu;
	}

	function fillPositionTexture(gpgpu, baseGeometry) {
		const additiveDustParticles = 100;
		gpgpu.attributesTexture = gpgpu.computation.createTexture();

		for (let i = 0; i < gpgpu.count; i++) {
			const i3 = i * 3;
			const i4 = i * 4;

			const range = gpgpu.count / 10;
			const indexRange = i / range;

			const friction = Math.random() * 0.035 + 0.96;

			gpgpu.baseTexture.image.data[i4 + 0] =
				baseGeometry.instance.attributes.position.array[i3 + 0];
			gpgpu.baseTexture.image.data[i4 + 1] =
				baseGeometry.instance.attributes.position.array[i3 + 1];
			gpgpu.baseTexture.image.data[i4 + 2] =
				baseGeometry.instance.attributes.position.array[i3 + 2];
			gpgpu.baseTexture.image.data[i4 + 3] = Math.random();

			let distance = 10 + Math.random() * 4;
			if (Math.random() < 0.1) distance += 2 + Math.random() * 10;

			gpgpu.attributesTexture.image.data[i4 + 0] = indexRange; // assign a range to each particle
			gpgpu.attributesTexture.image.data[i4 + 1] = friction;
			gpgpu.attributesTexture.image.data[i4 + 2] = 0;
			gpgpu.attributesTexture.image.data[i4 + 3] = 0;
		}
	}


	function precomputeParticles(model, shader, timePauseCompute) {
		const boat  = webgl.$assets.objects['boat'].scene;
		const instance = boat.children[0].geometry.clone();
		const baseGeometry = {};
		baseGeometry.instance = instance;
		baseGeometry.count = baseGeometry.instance.attributes.position.count;
		const gpgpu = create(baseGeometry.count);
		gpgpu.instance = baseGeometry.instance;
		//dirty mais nsm

		fillPositionTexture(gpgpu, baseGeometry)
		gpgpu.otherTexture = gpgpu.computation.createTexture();

		//
		gpgpu.timePauseCompute = timePauseCompute;
		gpgpu.forceCompute = w(false);
		initBase(shader, gpgpu)
		computedsGPGPU.set([...computedsGPGPU.get(), gpgpu]);
		return gpgpu;
	}

	function initBase(shader, gpgpu) {
		gpgpu.variables.particles = gpgpu.computation.addVariable(
			'uParticles',
			shader,
			gpgpu.baseTexture,
		);
		gpgpu.variables.other = gpgpu.computation.addVariable(
			'uOther',
			shader,
			gpgpu.otherTexture,
		)
		gpgpu.computation.setVariableDependencies(gpgpu.variables.particles, [ gpgpu.variables.particles, gpgpu.variables.other ]);
		gpgpu.computation.setVariableDependencies(gpgpu.variables.other, [ gpgpu.variables.particles ]);
		// Uniforms
		gpgpu.variables.particles.material.uniforms = {
			uTime: new Uniform(0),
			uDeltaTime: new Uniform(0),
			uBase: new Uniform(gpgpu.baseTexture),
			uData : new Uniform(gpgpu.otherTexture),
			uAttributes: new Uniform(gpgpu.attributesTexture),
			uFlowFieldFrequency: { value: 0.21 },
			uFlowFieldStrength: { value: 2.3 },
			uFlowFieldInfluence: { value: 1.0 },

			uFlowFieldFrequency2: { value: 0.5 },
			uFlowFieldStrength2: { value: 2 },
			uFlowFieldInfluence2: { value: 1.5 },
			uPercentRange: new Uniform(0),
			uIsMorphing: new Uniform(false),
			//  uPaint = new Uniform(paintTexture),
			uResolution: new Uniform(
				new Vector2(
					webgl.$viewport.size.get().x * webgl.$viewport.pixelRatio.get(),
					webgl.$viewport.size.get().y * webgl.$viewport.pixelRatio.get()
				),
			),
		};

		gpgpu.computation.init();
		return gpgpu
	}

	function precomputeMemories() {
		const boat  = webgl.$assets.objects['boat'].scene;
		const instance = boat.children[0].geometry.clone();
		precomputeParticles(instance, presetsShader.gpgpu.base, 15);
	}

	// function getByScene(scene) {
	// 	// return computedsGPGPU.get().find(gpgpu => gpgpu.scene === 'boat');
	// }

	function render() {
		computedsGPGPU.get().forEach(gpgpu => {
			const elapsed = webgl.$time.elapsed * 0.001
			gpgpu.variables.particles.material.uniforms.uTime.value = elapsed;
			gpgpu.variables.particles.material.uniforms.uDeltaTime.value = webgl.$time.dt * 0.001;
			if(elapsed < gpgpu.timePauseCompute || gpgpu.forceCompute.get()) gpgpu.computation.compute()
		})
	}

	function createSheets(gpgpu) {
		const project = webgl.$theatre.get('Flashback');
		if (!project) return;
		const sheet = project.getSheet('flashbackIn');
		const uniforms = gpgpu.variables.particles.material.uniforms;

		sheet.$group('Uniforms', [
			{
				id: 'uniforms',
				child: {
					uFlowFieldFrequency: {
						value: uniforms.uFlowFieldFrequency,
						range: [0, 1],
					},
					uFlowFieldStrength: {
						value: uniforms.uFlowFieldStrength,
						range: [0, 10],
					},
					uFlowFieldInfluence: {
						value: uniforms.uFlowFieldInfluence,
						range: [0, 1],
					},
					uPercentRange: {
						value: uniforms.uPercentRange,
						range: [0, 10],
					},
				},
			}
		]);
		sheet.$compound('Camera', {
			position: { value: webgl.$povCamera.target },
			lat: webgl.$povCamera.controls.lat,
			lon: webgl.$povCamera.controls.lon,
		});
	}

	return {
		install: () => {
			webgl.$gpgpu = api;
			webgl.$hooks.beforeStart.watchOnce(precomputeMemories);
			webgl.$hooks.afterStart.watchOnce(() => {
				setTimeout(() => {
					createSheets(computedsGPGPU.get()[0])
				}, 500);
			});
		},
		load: () => {},
	};
}
