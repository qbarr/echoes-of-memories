precision highp float;

#include <packing>
#include <props>

// uniform sampler2D tMap;
uniform sampler2D tSelectiveNormal;
uniform sampler2D tDepth;

uniform sampler2D tCloudNoiseMap;

uniform float uCameraNear;
uniform float uCameraFar;
uniform vec2 uSketchOffset;

in vec2 vUv;
out vec4 FragColor;

vec2 grad(vec2 z) {
	// 2D to 1D  (feel free to replace by some other)
	int n = int(z.x) + int(z.y) * 11111;

	// Hugo Elias hash (feel free to replace by another one)
	n = (n << 13) ^ n;
	n = (n * (n * n * 15731 + 789221) + 1376312589) >> 16;

	#if 0

	// simple random vectors
	return vec2(cos(float(n)), sin(float(n)));

	#else

	// Perlin style vectors
	n &= 7;
	vec2 gr = vec2(n & 1, n >> 1) * 2.0 - 1.0;
	return (n >= 6) ? vec2(0.0, gr.x) : (n >= 4) ? vec2(gr.x, 0.0) : gr;
	#endif
}

float noise(in vec2 p) {
	vec2 i = vec2(floor(p));
	vec2 f = fract(p);

	vec2 u = f * f * (3.0 - 2.0 * f);// feel free to replace by a quintic smoothstep instead

	return mix(mix(dot(grad(i + vec2(0, 0)), f - vec2(0.0, 0.0)), dot(grad(i + vec2(1, 0)), f - vec2(1.0, 0.0)), u.x), mix(dot(grad(i + vec2(0, 1)), f - vec2(0.0, 1.0)), dot(grad(i + vec2(1, 1)), f - vec2(1.0, 1.0)), u.x), u.y);
}

float valueAtPoint(sampler2D image, vec2 coord, vec2 texel, vec2 point) {
	vec3 luma = vec3(0.299, 0.587, 0.114);

	luma.x *= sin(uTime * .0015);
	luma.y *= cos(uTime * .0015);
	luma.z *= sin(uTime * .0015) * cos(uTime * .0015);

	return dot(texture(image, coord + texel * point).xyz, luma);
}

float diffuseValue(int x, int y) {
	float cutoff = 40.0;
	float offset = 0.5 / cutoff;
	float noiseValue = clamp(texture(tCloudNoiseMap, vUv).r, 0.0, cutoff) / cutoff - offset;

	return valueAtPoint(tSelectiveNormal, vUv + noiseValue * uSketchOffset * .5, vec2(1.0 / uResolution.x, 1.0 / uResolution.y), vec2(x, y)) * 0.6;
}

float normalValue(int x, int y) {
	float cutoff = 50.0;
	float offset = 0.5 / cutoff;
	float noiseValue = clamp(texture(tCloudNoiseMap, vUv).r, 0.0, cutoff) / cutoff - offset;

	return valueAtPoint(tSelectiveNormal, vUv + noiseValue * uSketchOffset * .5, vec2(1. / uResolution.x, 1. / uResolution.y), vec2(x, y)) * 0.3;
}

float getValue(int x, int y) {
	float noiseValue = noise(gl_FragCoord.xy);
	noiseValue = noiseValue * 2.0 - 1.0;
	noiseValue *= 10.0;

	return diffuseValue(x, y) + normalValue(x, y) * noiseValue;
}

float getPixelDepth(int x, int y) {
	float fragCoordZ = texture(tDepth, vUv + vec2(x, y) * 1.0 / uResolution.xy).x;
	float viewZ = perspectiveDepthToViewZ(fragCoordZ, uCameraNear, uCameraFar);
	return viewZToOrthographicDepth(viewZ, uCameraNear, uCameraFar);
}

vec3 getSurfaceValue(int x, int y) {
	// return texture(tSelectiveNormal, vUv + vec2(x, y) / uResolution.xy).rgb;
	return vec4(0.0, 0.0, 0.0, 1.0).rgb;
}

float sobelFloat() {
	// kernel definition (in glsl matrices are filled in column-major order)
	const mat3 Gx = mat3(-1, -2, -1, 0, 0, 0, 1, 2, 1);// x direction kernel
	const mat3 Gy = mat3(-1, 0, 1, -2, 0, 2, -1, 0, 1);// y direction kernel

	// fetch the 3x3 neighbourhood of a fragment

	// first column
	float tx0y0 = getValue(-1, -1);
	float tx0y1 = getValue(-1, 0);
	float tx0y2 = getValue(-1, 1);

	// second column
	float tx1y0 = getValue(0, -1);
	float tx1y1 = getValue(0, 0);
	float tx1y2 = getValue(0, 1);

	// third column
	float tx2y0 = getValue(1, -1);
	float tx2y1 = getValue(1, 0);
	float tx2y2 = getValue(1, 1);

	// gradient value in x direction
	float valueGx = Gx[ 0 ][ 0 ] * tx0y0 + Gx[ 1 ][ 0 ] * tx1y0 + Gx[ 2 ][ 0 ] * tx2y0 +
		Gx[ 0 ][ 1 ] * tx0y1 + Gx[ 1 ][ 1 ] * tx1y1 + Gx[ 2 ][ 1 ] * tx2y1 +
		Gx[ 0 ][ 2 ] * tx0y2 + Gx[ 1 ][ 2 ] * tx1y2 + Gx[ 2 ][ 2 ] * tx2y2;

	// gradient value in y direction
	float valueGy = Gy[ 0 ][ 0 ] * tx0y0 + Gy[ 1 ][ 0 ] * tx1y0 + Gy[ 2 ][ 0 ] * tx2y0 +
		Gy[ 0 ][ 1 ] * tx0y1 + Gy[ 1 ][ 1 ] * tx1y1 + Gy[ 2 ][ 1 ] * tx2y1 +
		Gy[ 0 ][ 2 ] * tx0y2 + Gy[ 1 ][ 2 ] * tx1y2 + Gy[ 2 ][ 2 ] * tx2y2;

	// magnitute of the total gradient
	float G = (valueGx * valueGx) + (valueGy * valueGy);
	return clamp(G, 0.0, 1.0);
}

float readDepth(sampler2D depthSampler, vec2 coord) {
	float fragCoordZ = texture(depthSampler, coord).x;
	float viewZ = perspectiveDepthToViewZ(fragCoordZ, uCameraNear, uCameraFar);
	return viewZToOrthographicDepth(viewZ, uCameraNear, uCameraFar);
}

void main() {
	float sobelValue = sobelFloat();
	sobelValue = smoothstep(0.5, 1., sobelValue);

	// beige
	vec4 uLineColor = vec4(0.9, 0.8, 0.7, 1.0);

	if (sobelValue > .5) {
		FragColor = uLineColor;
	} else {
		FragColor = vec4(0.0, 0.0, 0.0, 0.0);
	}
}
