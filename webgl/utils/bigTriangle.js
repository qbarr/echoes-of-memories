// Create a big triangle for post-processing purpose
// Ref: https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/

import { BufferGeometry, BufferAttribute } from 'three';

const positions = new Int8Array([-1, -1, 4, -1, -1, 4]);
const bigTriangleGeometry = new BufferGeometry();
bigTriangleGeometry.setAttribute('position', new BufferAttribute(positions, 2));

const positions3D = new Int8Array([-1, -1, 0, 4, -1, 0, -1, 4, 0]);
const bigTriangleGeometry3D = new BufferGeometry();
bigTriangleGeometry3D.setAttribute('position', new BufferAttribute(positions3D, 3));

const bigTriangleVertexShader = [
	`precision highp float;`,
	`attribute lowp vec2 position;`,
	`varying highp vec2 vUv;`,
	`void main() {`,
	`vUv = position * 0.5 + 0.5;`,
	`gl_Position =  vec4(position, 0., 1);`,
	`}`,
].join('');

const bigTriangleVertexShader3D = [
	`varying highp vec2 vUv;`,
	`void main() {`,
	`vUv = position.xy * 0.5 + 0.5;`,
	`gl_Position =  vec4(position, 1);`,
	`}`,
].join('');

/* GLSL3 */
const bigTriangleVertexShaderGLSL3 = [
	`precision highp float;`,
	`in vec2 position;`,
	`out vec2 vUv;`,
	`void main() {`,
	`vUv = position * 0.5 + 0.5;`,
	`gl_Position =  vec4(position, 0., 1);`,
	`}`,
].join('');

const bigTriangleVertexShader3DGLSL3 = [
	`precision highp float;`,
	`in vec3 position;`,
	`out vec2 vUv;`,
	`void main() {`,
	`vUv = position.xy * 0.5 + 0.5;`,
	`gl_Position =  vec4(position, 1);`,
	`}`,
].join('');

export {
	bigTriangleGeometry,
	bigTriangleVertexShader,
	bigTriangleGeometry3D,
	bigTriangleVertexShader3D,
	bigTriangleVertexShaderGLSL3,
	bigTriangleVertexShader3DGLSL3,
};
