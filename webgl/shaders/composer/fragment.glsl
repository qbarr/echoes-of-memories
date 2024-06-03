varying vec2 vUv;
uniform sampler2D tDiffuse;

void main() {
	vec4 base = texture2D(tDiffuse, vUv);
	vec3 color = base.rgb * vec3(1.);
	gl_FragColor = vec4(color, base.a);
}

// vec4 noiseJitter = texture2D(uNoise, texCoordFull + vec2(floor(uTime2 * uTimeScale) * .1));
// nvec2 shakeUV = texCoordFull;
// shakeUV = shakeUV - vec2(0.5, 0.5);
// nshakeUV = shakeUV * vec2(uRepeat * uAspect, uRepeat);
// nshakeUV = shakeUV + vec2(0.5, 0.5);
// shakeUV += (noiseJitter.rg - 0.5) * uDisplacement;
// vec3 tex = texture2D(uTexture, shakeUV).rgb;
// ntex *= uTextureLuminosity;
// float greyBackground = greyscale(c);
// nfloat greyBackgroundContrasted = easeInOutCubic(greyBackground);
// ngreyBackground = greyBackgroundContrasted;
// float blendingOpacity = uOpacity;
// nblendingOpacity = clamp(uOpacity - greyBackground * uBackgroundLum, 0., 1.);
// nc = blendOverlay(c, tex, blendingOpacity);
// n// c = vec3(greyBackground);
