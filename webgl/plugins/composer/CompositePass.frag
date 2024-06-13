precision highp float;

#include <props>
#include <packing>
#include <common>

uniform float time;
uniform vec4 resolution;

// Dither
uniform vec2 uDitherOffset;
uniform float uDitherStrength;

// Black stripes
uniform float uStripesScale;

// Vignette
uniform vec4 uVignette;

// Passes
uniform sampler2D tMap;
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
	float size = uStripesScale * 0.5;
	stripes += step(size, uv.y); // top
	stripes -= step(1. - size, uv.y); // bottom

	// Vignette
	vec2 uvVignette = uv;
	uvVignette -= 0.5;
	uvVignette *= 4.;
	uvVignette += 0.5;

	vec2 position = uvVignette - 0.5;
	position *= 1. + uVignette.zw * 4.;
	position.y *= pow(abs(position.y), uVignette.w);
	// float len = length(position);

	float len = sin(uvVignette.y) * (0.5 + smoothstep(0.5, 1., uVignette.w));
	float vignetteProgress = 1. - uVignette.x;
	float vignette = smoothstep(vignetteProgress, vignetteProgress - 0.5, len);
	vignette = smoothstep(0.0, uVignette.y, vignette);
	vignette = pow(vignette, uVignette.y);
	gl_FragColor.rgb *= vignette;

	gl_FragColor.rgb *= stripes;
	gl_FragColor.a = 1.0;
}
