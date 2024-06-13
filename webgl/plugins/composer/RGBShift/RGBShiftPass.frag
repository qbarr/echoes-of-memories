precision highp float;

uniform sampler2D tMap;
uniform sampler2D tDepth;
uniform sampler2D tInterface;
uniform sampler2D tSketchLines;
uniform float uAmount;
uniform float uAngle;
uniform float uDarkness;
varying vec2 vUv;

void main() {
	float depth = texture2D(tDepth, vUv).r;

	vec4 texel = texture2D(tMap, vUv);

	vec2 offset = uAmount * vec2(cos(uAngle), sin(uAngle));
	vec4 cr = texture2D(tMap, vUv + offset);
	vec4 cb = texture2D(tMap, vUv - offset);

	vec4 shiftColor = vec4(cr.r, cb.g, texel.b, texel.a);
	vec4 color = mix(texel, shiftColor, smoothstep(0.3, 1., pow(1. - depth, .6)));

	gl_FragColor = color;

	vec4 outlines = texture2D(tSketchLines, vUv);
	gl_FragColor.rgb += outlines.rgb;

	vec4 interfaceColor = texture2D(tInterface, vUv);
	interfaceColor.rgb *= 1.2;
	gl_FragColor.rgb = mix(gl_FragColor.rgb, interfaceColor.rgb, interfaceColor.a);
	gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.), uDarkness);

	// debug
	// gl_FragColor += vec4(smoothstep(0.3, 1., pow(1. - depth, .6)));
}
