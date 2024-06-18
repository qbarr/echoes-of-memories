precision highp float;

#include <common>
#include <props>

uniform sampler2D tMap;
uniform sampler2D tDepth;
uniform sampler2D tAfterImage;
uniform sampler2D tBloom;

uniform vec2 uPadding;
uniform vec2 uFishEye;
uniform vec2 uInterferences;
uniform vec2 uVignette;
uniform vec2 uScanLines;

varying vec2 vUv;

const float XRES = 54.0 * 5.0;
const float YRES = 33.0 * 5.0;

vec2 fisheye(vec2 uv) {
	uv *= vec2(1.0 + (uv.y * uv.y) * uFishEye.x, 1.0 + (uv.x * uv.x) * uFishEye.y);
	return uv * 1.02;
}

float vignette(vec2 uv) {
	uv *= 1.99 + uPadding;
	float amount = 1.0 - sqrt(pow(abs(uv.x), uVignette.x) + pow(abs(uv.y), uVignette.x));
	return smoothstep(0., uVignette.y, amount);
}

float peak(float x, float xpos, float scale) {
	return clamp((1.0 - x) * scale * log(1.0 / abs(x - xpos)), 0.0, 1.0);
}

float random(vec2 co, float time) {
	return fract(sin(dot(co.xy, vec2(12.9898, 78.233)) + time) * 43758.5453);
}

float round(float x) {
	return floor(x + 0.5);
}

void main() {
	float aspectRatio = 1.33 / 1.0;
	vec2 uv = vUv;

	vec2 res = uResolution.xy * uResolution.z;
	vec2 uv2 = gl_FragCoord.xy / res;

	// vec2 adjustedUV = uv;
	// adjustedUV.x -= aspectRatio;
	// adjustedUV = vec2(uv.x * aspectRatio, uv.y);
	// adjustedUV.x += (1.0 - aspectRatio) / 2.0;

	// vec2 squareUv = uv;
	// squareUv -= 0.5; // <-0.5,0.5>
	// if (res.x > res.y)
	// 	squareUv.x *= res.x / res.y;
	// else
	// 	squareUv.y *= res.y / res.x;
	// squareUv += 0.5; // <-0,1>

	// vec2 tUv = mix(uv, squareUv, .5 + .5 * sin(uTime * 0.01));

	float scany = round(uv2.y * YRES);

	uv -= 0.5;
	uv = fisheye(uv);
	float vign = vignette(uv);
	uv += 0.5;

	// adjustedUV -= 0.5;
	// adjustedUV = fisheye(adjustedUV);
	// float vign = vignette(adjustedUV);
	// adjustedUV += 0.5;

	vec4 tex = texture2D(tMap, uv);
	float mframe = (mod(tex, vec4(0.)).g + mod(tex, vec4(0.)).r + mod(tex, vec4(0.)).b) / 3.0;
	uv2.y += mframe * 1.0 / YRES * uScanLines.y;

	// Interference
	float r = random(vec2(0.0, scany), uTime);
	if (r > 0.995)
		r *= 3.0;

	float ifx1 = uInterferences.x * 2.0 / res.x * r;
	float ifx2 = uInterferences.y * (r * peak(uv.y, 1.5 - mod(uTime * .001, 3.), .05));
	uv.x += ifx1 + -ifx2;

	vec3 texel = texture2D(tMap, uv).xyz;
	texel += texture2D(tBloom, uv).xyz;

	float scanl = 0.5 + 0.5 * abs(sin(PI * uv2.y * YRES));
	scanl = mix(scanl, 1.0, 1. - uScanLines.x);

	vec3 rgb = texel * scanl;
	gl_FragColor = vec4(rgb, 1.0);

	//vec4 afterImage = texture2D(tAfterImage, uv);
	//gl_FragColor.rgb = mix(gl_FragColor.rgb, max(gl_FragColor.rgb, afterImage.rgb), afterImage.rgb);
	gl_FragColor.rgb *= vign;
}
