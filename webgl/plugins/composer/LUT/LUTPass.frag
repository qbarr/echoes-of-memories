precision highp float;

uniform float uSaturation;
uniform float uMix;

uniform sampler2D tComposite;

#ifdef LUT_PRECISION_HIGH
uniform mediump sampler3D tLutMap;
	#else
uniform lowp sampler3D tLutMap;
	#endif

vec4 applyLUT(const in vec3 rgb) {
	/* Built-in trilinear interpolation. Note that the fractional components are quantized to 8 bits on common
	hardware, which introduces significant error with small grid sizes. */
	return texture(tLutMap, rgb);
}

in vec2 vUv;

out vec4 FragColor;

void main() {
	vec4 inputColor = texture(tComposite, vUv);
	vec3 lutColor = applyLUT(inputColor.rgb).rgb;

	// Saturation
	lutColor = mix(vec3(dot(lutColor, vec3(0.299, 0.587, 0.114))), lutColor, uSaturation);

	FragColor.rgb = mix(inputColor.rgb, lutColor, uMix);
	FragColor.a = inputColor.a;
}
