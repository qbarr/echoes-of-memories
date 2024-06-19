precision highp float;

uniform sampler2D tEmissive;
uniform sampler2D tDepth;
uniform float uThreshold;
uniform float uSmoothing;
uniform float uDarkness;

varying vec2 vUv;

void main() {
	vec4 texel = texture2D(tEmissive, vUv);
	float depth = texture2D(tDepth, vUv).r;

	vec3 luma = vec3(0.299, 0.587, 0.114);
	float v = dot(texel.rgb, luma);
	float alpha = smoothstep(uThreshold, uThreshold + uSmoothing, v);

	alpha *= pow(1. - uDarkness, .5);

	gl_FragColor = mix(vec4(0.), texel, alpha);
	gl_FragColor = mix(gl_FragColor, vec4(0.), uDarkness);
}
