import { presetsShader } from '#utils/presets/shaders.js';
import { w } from '#utils/state/index.js';
import { BufferAttribute, Uniform, Vector2 } from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { getDeathRanges } from './deathRanges';

export function gpgpuPlugin(webgl) {
	const list = w([]);
	const api = { create, createPooling, list, render };
	let index = 0;
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
			gpgpu.attributesTexture.image.data[i4 + 2] =
				baseGeometry.instance.attributes.death.array[i];
			gpgpu.attributesTexture.image.data[i4 + 3] = 0;
		}
	}

	function fillDustParticles(gpgpu, baseGeometry, count) {
		gpgpu.dustTexture = gpgpu.computation.createTexture();

		for (let i = 0; i < count; i++) {
			const i3 = i * 3;
			const i4 = i * 4;

			gpgpu.dustTexture.image.data[i4 + 0] =
				baseGeometry.instance.attributes.position.array[i3 + 0];
			gpgpu.dustTexture.image.data[i4 + 1] =
				baseGeometry.instance.attributes.position.array[i3 + 1];
			gpgpu.dustTexture.image.data[i4 + 2] =
				baseGeometry.instance.attributes.position.array[i3 + 2];
			gpgpu.dustTexture.image.data[i4 + 3] = Math.random();
		}
	}

	function precomputeParticles(instance, shader, timePauseCompute) {
		const baseGeometry = {};
		baseGeometry.instance = instance;
		baseGeometry.count = instance.attributes.position.count;
		const gpgpu = create(baseGeometry.count);
		gpgpu.instance = baseGeometry.instance;
		//dirty mais nsm
		const additiveDustParticles = 50000;
		fillPositionTexture(gpgpu, baseGeometry);
		fillDustParticles(gpgpu, baseGeometry, additiveDustParticles);

		//
		gpgpu.timePauseCompute = timePauseCompute;
		gpgpu.forceCompute = w(false);
		gpgpu.savedRenderTargets = {
			particles: null,
			dustParticles: null,
		};
		initBase(shader, gpgpu);
		list.set([...list.get(), gpgpu]);
		return gpgpu;
	}

	function initBase(shader, gpgpu) {
		gpgpu.variables.particles = gpgpu.computation.addVariable(
			'uParticles',
			shader,
			gpgpu.baseTexture,
		);

		gpgpu.variables.dustParticles = gpgpu.computation.addVariable(
			'uDustParticles',
			presetsShader.gpgpu.dust,
			gpgpu.dustTexture,
		);

		gpgpu.computation.setVariableDependencies(gpgpu.variables.particles, [
			gpgpu.variables.particles,
		]);
		gpgpu.computation.setVariableDependencies(gpgpu.variables.dustParticles, [
			gpgpu.variables.dustParticles,
		]);
		// Uniforms
		gpgpu.variables.particles.material.uniforms = {
			uTime: new Uniform(0),
			uDeltaTime: new Uniform(0),
			uBase: new Uniform(gpgpu.baseTexture),
			uAttributes: new Uniform(gpgpu.attributesTexture),
			uFlowFieldFrequency: { value: 0.21 },
			uFlowFieldStrength: { value: 2.3 },
			uFlowFieldInfluence: { value: 1.0 },

			uPercentRange: new Uniform(0),
			uDeathRange: new Uniform(0),
			uIsMorphing: new Uniform(false),
			uMorphEnded: new Uniform(false),
			//  uPaint = new Uniform(paintTexture),
			uResolution: new Uniform(
				new Vector2(
					webgl.$viewport.size.get().x * webgl.$viewport.pixelRatio.get(),
					webgl.$viewport.size.get().y * webgl.$viewport.pixelRatio.get(),
				),
			),
		};

		gpgpu.variables.dustParticles.material.uniforms = {
			...gpgpu.variables.particles.material.uniforms,
			uFlowFieldFrequency: { value: 0.5 },
			uFlowFieldStrength: { value: 2 },
			uFlowFieldInfluence: { value: 1.5 },
		};

		gpgpu.computation.init();
		return gpgpu;
	}

	function precomputeMemories() {
		const flashbacks = ['meal', 'truck', 'war'];
		// let instances = []
		// console.log(webgl.$assets.objects.flashbacks)
		flashbacks.forEach((flashback, index) => {
			const scene = webgl.$assets.objects.flashbacks[flashback].scene;
			let instances = scene.children.map((child, i) => {
				if (!child.isMesh) return;
				child.updateWorldMatrix(true, false);

				child.geometry.applyMatrix4(child.matrixWorld);
				const death = [];
				for (let i = 0; i < child.geometry.attributes.position.count; i++) {
					death.push(getDeathRanges(child.name, index));
				}
				child.geometry.attributes.death = new BufferAttribute(
					new Float32Array(death),
					1,
				);

				return child.geometry.clone();
			});

			instances = BufferGeometryUtils.mergeGeometries(instances);
			precomputeParticles(instances, presetsShader.gpgpu.base, 15);
		});
	}

	function render() {
		list.get().forEach((gpgpu) => {
			const elapsed = webgl.$time.elapsed * 0.001;
			gpgpu.variables.particles.material.uniforms.uTime.value = elapsed;
			gpgpu.variables.particles.material.uniforms.uDeltaTime.value =
				webgl.$time.dt * 0.001;
			// if(elapsed >= 5 && !gpgpu.savedRenderTargets.particles) {

			// 	gpgpu.savedRenderTargets.particles = gpgpu.computation.getCurrentRenderTarget(gpgpu.variables.particles)

			// 	// renderTargetTextureToJPG(gpgpu.savedRenderTargets.particles)
			// 	//

			// }
			// console.log(gpgpu.variables.particles.material.uniforms.uPercentRange.value)
			if (elapsed < 10 || gpgpu.forceCompute.get()) gpgpu.computation.compute();
		});
	}

	function createSheets() {
		const project = webgl.$theatre.get('Flashback');
		if (!project) return;

		const sheets = [
			project.getSheet('flashback_photo'),
			project.getSheet('flashback_crucifix'),
			project.getSheet('flashback_war'),
		];

		// this.$sheet.$bool('Screen / Tape Played', { value: false }).onChange((v) => {
		// 	if (!v) this.screen.setInstructionsScreen();
		// 	else this.screen.setSplashScreen();
		// });
		sheets.forEach((sheet, index) => {
			const gpgpu = list.get()[index];
			const modelUniforms = gpgpu.variables.particles.material.uniforms;
			const dustUniforms = gpgpu.variables.dustParticles.material.uniforms;
			// sheet.$float('Particles / ModelUniforms / uFlowFieldFrequencyModel',  modelUniforms.uFlowFieldFrequency, {
			// 	range: [0, 1],
			// });
			// sheet.$float('Particles / ModelUniforms / uFlowFieldStrengthModel',  modelUniforms.uFlowFieldStrength, {
			// 	range: [0, 10],
			// });
			// sheet.$float('Particles / ModelUniforms / uFlowFieldInfluenceModel',  modelUniforms.uFlowFieldInfluence, {
			// 	range: [0, 1],
			// });
			// sheet.$float('Particles / ModelUniforms / uPercentRangeModel',  modelUniforms.uPercentRange, {
			// 	range: [0, 10],
			// });
			// sheet.$float('Particles / ModelUniforms / uDeathRangeModel',  modelUniforms.uDeathRange, {
			// 	range: [0, 1],
			// });
			// sheet.$bool('Particles / ModelUniforms / uMorphEndedModel',  modelUniforms.uMorphEnded)

			// sheet.$float('Particles / DustUniforms / uFlowFieldFrequencyDust',  dustUniforms.uFlowFieldFrequency, {
			// 	range: [0, 1],
			// });
			// sheet.$float('Particles / DustUniforms / uFlowFieldStrengthDust',  dustUniforms.uFlowFieldStrength, {
			// 	range: [0, 10],
			// });
			// sheet.$float('Particles / DustUniforms / uFlowFieldInfluenceDust',  dustUniforms.uFlowFieldInfluence, {
			// 	range: [0, 10],
			// });

			sheet.$group('Particles', [
				{
					id: 'modelUniforms',
					child: {
						uFlowFieldFrequencyModel: {
							value: modelUniforms.uFlowFieldFrequency,
							range: [0, 1],
						},
						uFlowFieldStrengthModel: {
							value: modelUniforms.uFlowFieldStrength,
							range: [0, 10],
						},
						uFlowFieldInfluenceModel: {
							value: modelUniforms.uFlowFieldInfluence,
							range: [0, 1],
						},
						uPercentRangeModel: {
							value: modelUniforms.uPercentRange,
							range: [0, 10],
						},
						uDeathRangeModel: {
							value: modelUniforms.uDeathRange,
							range: [0, 1],
						},
						uMorphEndedModel: {
							value: modelUniforms.uMorphEnded,
							type: 'boolean',
						},
					},
				},
				{
					id: 'dustUniforms',
					child: {
						uFlowFieldFrequencyDust: {
							value: dustUniforms.uFlowFieldFrequency,
							range: [0, 1],
						},
						uFlowFieldStrengthDust: {
							value: dustUniforms.uFlowFieldStrength,
							range: [0, 10],
						},
						uFlowFieldInfluenceDust: {
							value: dustUniforms.uFlowFieldInfluence,
							range: [0, 1],
						},
					},
				},
			]);
		});
	}

	// function dataTextureToJPG(dataTexture) {
	// 	const canvas = document.createElement('canvas');
	// 	canvas.width = dataTexture.image.width;
	// 	canvas.height = dataTexture.image.height;
	// 	const context = canvas.getContext('2d');

	// 	const imageData = context.createImageData(dataTexture.image.width, dataTexture.image.height);
	// 	console.log(imageData, dataTexture.image)
	// 	imageData.data.set(dataTexture.image.data);
	// 	context.putImageData(imageData, 0, 0);

	// 	// Exporter en image JPEG
	// 	const jpegUrl = canvas.toDataURL('image/jpeg');

	// 	// Créer un lien pour télécharger l'image
	// 	const link = document.createElement('a');
	// 	link.href = jpegUrl;
	// 	link.download = 'texture.jpg';
	// 	link.click();
	// }
	/// #if __DEBUG__
	function devTools() {
		list.get().forEach((gpgpu, i) => {
			const modelUniforms = list.get()[0].variables.particles.material.uniforms;
			const gui = webgl.$gui.addFolder({
				title: `🎉 GPGPU${i} flashback${i}`,
				index: 7,
			});

			const add = (
				obj,
				{ value = 'value', label, min = 0, max = 1, step = 0.01 } = {},
				_gui = gui,
			) => {
				gui.addBinding(obj, value, { label, min, max, step });
			};

			add(modelUniforms.uFlowFieldFrequency, { label: 'uFlowFieldFrequency' });
			add(modelUniforms.uFlowFieldStrength, { label: 'uFlowFieldStrength' });
			add(modelUniforms.uFlowFieldInfluence, { label: 'uFlowFieldInfluence' });
			add(modelUniforms.uPercentRange, { label: 'uPercentRange', min: 0, max: 10 });
			add(modelUniforms.uDeathRange, { label: 'uDeathRange' });
			add(modelUniforms.uMorphEnded, { label: 'uMorphEnded' });
		});
	}
	/// #endif
	function renderTargetTextureToJPG(renderTarget) {
		const width = renderTarget.width;
		const height = renderTarget.height;
		const { $threeRenderer: renderer } = webgl;

		// Création d'un canvas pour copier la texture
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d');

		// Lecture des pixels de la texture du render target
		const buffer = new Uint8Array(width * height * 4);

		renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, buffer);

		// Création d'une ImageData et copie des pixels dedans
		const imageData = context.createImageData(width, height);
		imageData.data.set(buffer);

		// Les données des pixels sont retournées verticalement, nous devons donc les retourner
		const flippedImageData = context.createImageData(width, height);
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const destIndex = (y * width + x) * 4;
				const srcIndex = ((height - y - 1) * width + x) * 4;
				flippedImageData.data[destIndex] = imageData.data[srcIndex];
				flippedImageData.data[destIndex + 1] = imageData.data[srcIndex + 1];
				flippedImageData.data[destIndex + 2] = imageData.data[srcIndex + 2];
				flippedImageData.data[destIndex + 3] = imageData.data[srcIndex + 3];
			}
		}
		context.putImageData(flippedImageData, 0, 0);

		// Exporter en image JPEG
		const jpegUrl = canvas.toDataURL('image/jpeg');

		// Créer un lien pour télécharger l'image
		const link = document.createElement('a');
		link.href = jpegUrl;
		link.download = 'render_target_texture.jpg';
		link.click();
	}

	return {
		install: () => {
			webgl.$gpgpu = api;
			webgl.$hooks.beforeStart.watchOnce(precomputeMemories);
			webgl.$hooks.afterStart.watchOnce(() => {
				setTimeout(() => {
					createSheets();
					__DEBUG__ && devTools();
				}, 500);
			});
		},
		load: () => {},
	};
}
