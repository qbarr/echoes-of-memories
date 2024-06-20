precision highp float;

#include <props>

uniform sampler2D tBlur1;
uniform sampler2D tBlur2;
uniform sampler2D tBlur3;
uniform float uBloomStrength;
uniform float uBloomRadius;
uniform float uBloomFactors[ NUM_MIPS ];
uniform vec3 uBloomTintColors[ NUM_MIPS ];

uniform vec2 uVignette;
uniform float uStripesScale;

in vec2 vUv;

out vec4 FragColor;

float lerpBloomFactor(float factor) {
	return mix(factor, 1.2 - factor, uBloomRadius);
}

void main() {
	vec4 bloom = vec4(0.0);

	bloom += lerpBloomFactor(uBloomFactors[ 0 ]) * vec4(uBloomTintColors[ 0 ], 1.0) * texture(tBlur1, vUv);
	bloom += lerpBloomFactor(uBloomFactors[ 1 ]) * vec4(uBloomTintColors[ 1 ], 1.0) * texture(tBlur2, vUv);
	bloom += lerpBloomFactor(uBloomFactors[ 2 ]) * vec4(uBloomTintColors[ 2 ], 1.0) * texture(tBlur3, vUv);

	FragColor = uBloomStrength * bloom;
	FragColor.a = length(FragColor.rgb);

	vec2 uvVignette = gl_FragCoord.xy / uResolution.xy;
	vec2 position = uvVignette - 0.5;
	position.y *= pow(abs(position.y), -uVignette.y);
	float len = length(position);
	float vignetteProgress = 1. - uVignette.x;
	float vignette = smoothstep(vignetteProgress, vignetteProgress - 0.5, len);
	float vignetteSmoothness = 0.323;
	vignette = smoothstep(0.0, vignetteSmoothness, vignette);
	vignette = pow(vignette, vignetteSmoothness);
	FragColor.rgb *= vignette;

	// Black stripe
	float stripes = 0.;
	float size = uStripesScale * 0.5;
	stripes += step(size, vUv.y); // top
	stripes -= step(1. - size, vUv.y); // bottom
	FragColor.rgb *= stripes;
}
