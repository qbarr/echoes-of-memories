precision highp float;

uniform sampler2D tMapBloom;
uniform float uThreshold;
uniform float uSmoothing;

in vec2 vUv;

out vec4 FragColor;

void main() {
	vec4 texel = texture(tMapBloom, vUv);
	vec3 luma = vec3(0.299, 0.587, 0.114);
	float v = dot(texel.rgb, luma);
	float alpha = smoothstep(uThreshold, uThreshold + uSmoothing, v);

	FragColor = mix(vec4(0.), texel, alpha);
}
