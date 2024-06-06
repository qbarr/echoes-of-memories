precision highp float;

uniform sampler2D tMap;
uniform sampler2D tDepth;
uniform float uThreshold;
uniform float uSmoothing;

varying vec2 vUv;

void main() {
	vec4 texel = texture2D(tMap, vUv);
	float depth = texture2D(tDepth, vUv).r;

	vec3 luma = vec3(0.299, 0.587, 0.114);
	float v = dot(texel.rgb, luma);
	float alpha = smoothstep(uThreshold, uThreshold + uSmoothing, v) * (1. - depth);

	gl_FragColor = mix(vec4(0.), texel, alpha);
}
