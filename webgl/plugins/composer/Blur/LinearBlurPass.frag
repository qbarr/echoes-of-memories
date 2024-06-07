precision highp float;

uniform vec2 uVelocity;
uniform vec4 resolution;
uniform sampler2D tMap;

varying vec2 vUv;

const float SAMPLES = 40.;

vec4 blur_linear(sampler2D tex, vec2 uv, vec2 texel, vec2 line) {
	vec4 total = vec4(0);

	const float DIST = 1.0 / SAMPLES;
	for (float i = -0.5; i <= 0.5; i += DIST) {
		vec2 coord = uv + i * line * texel;
		total += texture2D(tex, coord);
	}

	return total * DIST;
}

void main() {
	vec2 uv = vUv;

	vec2 vel = uVelocity * 200.;
	vel.y *= -1.;

	vec2 offsetMult = .075 * vel;
	vec2 rUv = uv + vec2(-.001, .001) * offsetMult;
	vec2 gUv = uv + vec2(.001, .001) * offsetMult;
	vec2 bUv = uv + vec2(.001, -.001) * offsetMult;

	// #ifdef IS_MOBILE
	// vec4 tex = blur_linear(tMap, uv, 1. / resolution.xy, vel);
	// #else
	float blurTexR = blur_linear(tMap, rUv, 1. / resolution.xy, vel).r;
	float blurTexG = blur_linear(tMap, gUv, 1. / resolution.xy, vel).g;
	float blurTexB = blur_linear(tMap, bUv, 1. / resolution.xy, vel).b;
	vec4 tex = vec4(blurTexR, blurTexG, blurTexB, 1.);
	// #endif

	gl_FragColor = tex;
}
