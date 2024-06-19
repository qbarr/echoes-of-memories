precision highp float;

#include <props>
#include <common>

varying vec2 vUv;

uniform sampler2D tMap;

// uniform vec2 uPadding;
// uniform vec2 uFishEye;
uniform vec2 uInterferences;
// uniform vec2 uVignette;
// uniform vec2 uScanLines;

const vec2 uPadding = vec2(0.2, 0.);
const vec2 uFishEye = vec2(0.1, 0.24);
// const vec2 uInterferences = vec2(2., 0.2);
const vec2 uVignette = vec2(130, 0.8);
const vec2 uScanLines = vec2(0.25, 0.23);

const float XRES = 54.0 * 2.0;
const float YRES = 33.0 * 2.0;

vec2 fisheye(vec2 uv) {
	uv *= vec2(1.0 + (uv.y * uv.y) * uFishEye.x, 1.0 + (uv.x * uv.x) * uFishEye.y);
	return uv * 1.02;
}

float peak(float x, float xpos, float scale) {
	return clamp((1.0 - x) * scale * log(1.0 / abs(x - xpos)), 0.0, 1.0);
}

float random(vec2 co, float time) {
	return fract(sin(dot(co.xy, vec2(12.9898, 78.233)) + time) * 43758.5453);
}

void main() {
	float aspectRatio = 1.33 / 1.0;
	vec2 uv = vUv;

	vec2 res = uResolution.xy * uResolution.z;
	vec2 uv2 = gl_FragCoord.xy / res;

	float scany = round(uv2.y * YRES);

	uv -= 0.5;
	uv = fisheye(uv);
	uv += 0.5;

	vec4 tex = texture2D(tMap, uv);
	float mframe = (mod(tex, vec4(0.)).g + mod(tex, vec4(0.)).r + mod(tex, vec4(0.)).b) / 3.0;
	uv2.y += mframe * 1.0 / YRES * uScanLines.y;

	// Interference
	float r = random(vec2(0.0, scany), uTime);
	if (r > 0.995)
		r *= 3.0;

	float ifx1 = uInterferences.x * 2.0 / res.x * r;
	float ifx2 = uInterferences.y * (r * peak(uv.y, 2.5 - mod(uTime * .0005, 4.), .05));
	uv.x += ifx1 + -ifx2;

	vec3 texel = texture2D(tMap, uv).xyz;

	float scanl = 0.5 + 0.5 * abs(sin(PI * uv2.y * YRES));
	scanl = mix(scanl, 1.0, 1. - uScanLines.x);

	vec3 rgb = texel * scanl;

	// desaturate
	rgb = mix(vec3(dot(rgb, vec3(0.333))), rgb, 1. - ifx2 * 120. + ifx1);

	// rgb shift on ifx2
	rgb = mix(rgb, vec3(rgb.y, rgb.z, rgb.x), ifx2 * 120. + ifx1);
	r = random(vec2(0.0, scany), uTime);
	if (r > 0.96)
		rgb = vec3(rgb.y, rgb.z, rgb.x);

	gl_FragColor = vec4(rgb, 1.0);
}
