import { getWebGL } from '#webgl/core';
import { RawShaderMaterial, ShaderMaterial, Mesh, Camera, Scene, GLSL3 } from 'three';
import {
	bigTriangleGeometry,
	bigTriangleVertexShader,
	bigTriangleGeometry3D,
	bigTriangleVertexShader3D,
	bigTriangleVertexShaderGLSL3,
	bigTriangleVertexShader3DGLSL3,
} from './bigTriangle';

const presets = {
	raw: {
		Class: RawShaderMaterial,
		vertexShader: bigTriangleVertexShader,
		geometry: bigTriangleGeometry,
		screen: null,
	},
	normal: {
		Class: ShaderMaterial,
		vertexShader: bigTriangleVertexShader3D,
		geometry: bigTriangleGeometry3D,
		screen: null,
	},
	rawGLSL3: {
		Class: RawShaderMaterial,
		vertexShader: bigTriangleVertexShaderGLSL3,
		geometry: bigTriangleGeometry,
		screen: null,
	},
	normalGLSL3: {
		Class: ShaderMaterial,
		vertexShader: bigTriangleVertexShader3DGLSL3,
		geometry: bigTriangleGeometry3D,
		screen: null,
	},
};

const cam = new Camera();
const defaultFragment =
	'precision highp float;' + 'varying vec2 vUv;' + 'void main(){gl_FragColor=vec4(vUv,0.,1.);}';

let webgl;

export default function createFilter({
	useRawShader = true,
	vertexShader,
	fragmentShader,
	renderer,
	...materialOpts
} = {}) {
	if (!webgl) webgl = getWebGL();

	renderer = renderer ?? webgl.$threeRenderer;

	const useGLSL3 = materialOpts?.glslVersion === GLSL3;
	const preset = useRawShader
		? presets['raw' + (useGLSL3 ? 'GLSL3' : '')]
		: presets['normal' + (useGLSL3 ? 'GLSL3' : '')];

	const material = new preset.Class(
		Object.assign(
			{},
			{
				vertexShader: preset.vertexShader,
				fragmentShader: defaultFragment,
				depthTest: false,
				depthWrite: false,
				transparent: true,
			},
			materialOpts,
		),
	);

	if (vertexShader) {
		if (vertexShader.use) vertexShader.use(material);
		else material.vertexShader = vertexShader;
	}

	if (fragmentShader) {
		if (fragmentShader.use) fragmentShader.use(material);
		else material.fragmentShader = fragmentShader;
	}

	let screen = preset.screen;
	if (!screen) {
		screen = preset.screen = new Mesh(preset.geometry, material);
		screen.frustumCulled = false;
		screen.matrixAutoUpdate = false;
		screen.matrixWorldAutoUpdate = false;
	}

	const obj = {
		cam,
		screen,
		material,
		uniforms: material.uniforms,
		u: material.uniforms,

		render() {
			const prevSort = renderer.sortObjects;
			const prevShadowMap = renderer.shadowMap.enabled;
			const prevAutoClear = renderer.autoClear;
			renderer.sortObjects = false;
			renderer.shadowMap.enabled = false;
			renderer.autoClear = false;

			screen.material = material;
			renderer.render(screen, cam);

			renderer.sortObjects = prevSort;
			renderer.shadowMap.enabled = prevShadowMap;
			renderer.autoClear = prevAutoClear;
		},
	};

	return obj;
}
