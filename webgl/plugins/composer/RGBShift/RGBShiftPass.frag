precision highp float;

uniform sampler2D tMap;
uniform sampler2D tDepth;
uniform float uAmount;
uniform float uAngle;

varying vec2 vUv;

void main() {
	float depth = texture2D(tDepth, vUv).r;

	vec2 offset = uAmount * vec2(cos(uAngle), sin(uAngle));
	vec4 cr = texture2D(tMap, vUv + offset);
	vec4 cga = texture2D(tMap, vUv);
	vec4 cb = texture2D(tMap, vUv - offset);

	// vec4 color = mix(cga, vec4(cga.r, cb.g, cga.b, cga.a), smoothstep(.5, 1.3, 1. - depth));

	gl_FragColor = vec4(cga.r, cb.g, cga.b, cga.a);
}
