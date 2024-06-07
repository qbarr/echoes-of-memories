precision highp float;

uniform sampler2D tComposite;
uniform float uSaturation;
uniform float uMix;

#ifdef LUT_PRECISION_HIGH
uniform mediump sampler3D tLutMap;
#else
uniform lowp sampler3D tLutMap;
#endif

in vec2 vUv;

out vec4 FragColor;

void main() {
	vec4 inputColor = texture(tComposite, vUv);
	vec3 lutColor = texture(tLutMap, inputColor.rgb).rgb;

	// Saturation
	lutColor = mix(vec3(dot(lutColor, vec3(0.299, 0.587, 0.114))), lutColor, uSaturation);

	FragColor.rgb = mix(inputColor.rgb, lutColor, uMix);
	FragColor.a = inputColor.a;
}
