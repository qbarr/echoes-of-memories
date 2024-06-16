precision highp float;

uniform sampler2D tBlur1;
uniform sampler2D tBlur2;
uniform sampler2D tBlur3;
uniform float uBloomStrength;
uniform float uBloomRadius;
uniform float uBloomFactors[ NUM_MIPS ];
uniform vec3 uBloomTintColors[ NUM_MIPS ];

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
}
