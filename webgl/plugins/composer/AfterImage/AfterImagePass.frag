precision highp float;

uniform sampler2D tMap;
uniform float uStrength;

float when_gt(float x, float y) {
	return max(sign(x - y), 0.0);
}

vec2 when_gt(vec2 x, vec2 y) {
	return max(sign(x - y), 0.0);
}

vec3 when_gt(vec3 x, vec3 y) {
	return max(sign(x - y), 0.0);
}

vec4 when_gt(vec4 x, vec4 y) {
	return max(sign(x - y), 0.0);
}

varying vec2 vUv;

void main() {
	vec4 texel = texture2D(tMap, vUv);
	texel *= uStrength * when_gt(texel, vec4(0.1));
	gl_FragColor = texel;
}
