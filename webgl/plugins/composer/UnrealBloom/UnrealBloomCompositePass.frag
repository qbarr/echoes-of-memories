precision highp float;

uniform sampler2D tBlur1;
uniform sampler2D tBlur2;
uniform sampler2D tBlur3;
uniform sampler2D tBlur4;
uniform sampler2D tBlur5;
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
	// FragColor = uBloomStrength * ( //
	// lerpBloomFactor(uBloomFactors[ 0 ]) * vec4(uBloomTintColors[ 0 ], 1.0) * texture(tBlur1, vUv) +
	// 	lerpBloomFactor(uBloomFactors[ 1 ]) * vec4(uBloomTintColors[ 1 ], 1.0) * texture(tBlur2, vUv) +
	// 	lerpBloomFactor(uBloomFactors[ 2 ]) * vec4(uBloomTintColors[ 2 ], 1.0) * texture(tBlur3, vUv) +
	// 	lerpBloomFactor(uBloomFactors[ 3 ]) * vec4(uBloomTintColors[ 3 ], 1.0) * texture(tBlur4, vUv) +
	// 	lerpBloomFactor(uBloomFactors[ 4 ]) * vec4(uBloomTintColors[ 4 ], 1.0) * texture(tBlur5, vUv) //
	// );

	vec4 bloom = vec4(0.0);

	#if NUM_MIPS >= 1
	bloom += lerpBloomFactor(uBloomFactors[ 0 ]) * vec4(uBloomTintColors[ 0 ], 1.0) * texture(tBlur1, vUv);
	#endif

	#if NUM_MIPS >= 2
	bloom += lerpBloomFactor(uBloomFactors[ 1 ]) * vec4(uBloomTintColors[ 1 ], 1.0) * texture(tBlur2, vUv);
	#endif

	#if NUM_MIPS >= 3
	bloom += lerpBloomFactor(uBloomFactors[ 2 ]) * vec4(uBloomTintColors[ 2 ], 1.0) * texture(tBlur3, vUv);
	#endif

	#if NUM_MIPS >= 4
	bloom += lerpBloomFactor(uBloomFactors[ 3 ]) * vec4(uBloomTintColors[ 3 ], 1.0) * texture(tBlur4, vUv);
	#endif

	#if NUM_MIPS >= 5
	bloom += lerpBloomFactor(uBloomFactors[ 4 ]) * vec4(uBloomTintColors[ 4 ], 1.0) * texture(tBlur5, vUv);
	#endif

	FragColor = uBloomStrength * bloom;
	FragColor.a = length(FragColor.rgb);
}