precision highp float;

uniform sampler2D tMap;
uniform sampler2D tDepth;
uniform sampler2D tInterface;
uniform sampler2D tSketchLines;
uniform float uAmount;
uniform float uAngle;

varying vec2 vUv;

void main() {
	float depth = texture2D(tDepth, vUv).r;

	vec4 texel = texture2D(tMap, vUv);

	vec2 offset = uAmount * vec2(cos(uAngle), sin(uAngle));
	vec4 cr = texture2D(tMap, vUv + offset);
	vec4 cb = texture2D(tMap, vUv - offset);

	vec4 shiftColor = vec4(cr.r, cb.g, texel.b, texel.a);
	vec4 color = mix(texel, shiftColor, smoothstep(0.3, 1., pow(1. - depth, .6)));

	// gl_FragColor = shiftColor;
	gl_FragColor = color;

	vec3 interfaceColor = texture2D(tInterface, vUv).rgb;
	gl_FragColor.rgb += interfaceColor;

	vec4 outlines = texture2D(tSketchLines, vUv);
	gl_FragColor.rgb += outlines.rgb;

	// debug
	// gl_FragColor += vec4(smoothstep(0.3, 1., pow(1. - depth, .6)));
}
