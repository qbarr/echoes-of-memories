precision highp float;

// #define PI2 6.283185307179586476925286766559

uniform float time;
uniform vec4 resolution;
// uniform sampler2D uBlueNoiseMap;

// Dither
uniform vec2 uDitherOffset;
uniform float uDitherStrength;

// Tint
uniform float uBichromy;
uniform float uSaturation;

// Depth
uniform float zNear;
uniform float zFar;

// Passes
uniform sampler2D tMap;
// uniform sampler2D tMapBloom;
uniform sampler2D tBloom;
uniform sampler2D tDepth;

varying vec2 vUv;

float random(vec2 co) {
	float a = 12.9898;
	float b = 78.233;
	float c = 43758.5453;
	float dt = dot(co.xy, vec2(a, b));
	dt *= uDitherOffset.y;
	float sn = mod(dt, 3.14);
	sn *= uDitherOffset.x;
	return fract(sin(sn) * c);
}

vec3 dither(vec3 color) {
	// Calculate grid position
	float grid_position = random(gl_FragCoord.xy);

	// Shift the individual colors differently, thus making it even harder to see the dithering pattern
	vec3 dither_shift_RGB = vec3(0.0296078431); // 5. / 255.

	// Modify shift acording to grid position
	dither_shift_RGB = mix(2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position);

	// Shift the color by dither_shift
	return color + dither_shift_RGB;
}

float calc_depth(float z) {
	// float near = zNear;
	float near = 1.;
	// float far = zFar;
	float far = 5.;
	return (2.0 * near) / (far + near - z * (far - near));
}

#include <packing>
#include <common>

void main() {
	vec2 uv = vUv;

	// Composite
	vec4 tex = texture2D(tMap, uv);
	tex += texture2D(tBloom, uv);

	// TODO: replace by blue noise texture
	tex.rgb = mix(tex.rgb, dither(tex.rgb), uDitherStrength);

	gl_FragColor = tex;

	// Black stripe
	float stripes = 0.;
	float size = .1;
	stripes += step(size, uv.y); // top
	stripes -= step(1. - size, uv.y); // bottom

	// gl_FragColor.rgb *= stripes;
	gl_FragColor.a = 1.0;
}
