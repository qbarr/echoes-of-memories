precision highp float;

#include <common>
#include <props>

#define MAX_SAMPLES 10.0

uniform sampler2D tMap;
// uniform sampler2D tInterface;
uniform sampler2D tDepth;
uniform float uStrength;
uniform float uAmount;

in vec2 vUv;

out vec4 FragColor;

const float blurRadMax = 0.05;
const float blurCircles = 2.0;

void main() {
	vec2 uv = vUv - 0.5;
	uv.x *= uResolution.x / uResolution.y;
	uv += 0.5;

	float depth = texture(tDepth, vUv).r;

	float amount = 1. - depth;
	amount *= uAmount;
	amount *= length(uv - 0.5);
	amount = smoothstep(0.1, .6, amount);

	float blurRadius = blurRadMax * amount * 0.3;
	blurRadius *= depth;
	blurRadius *= uStrength;

	float totalSamples = 0.0;
	vec3 colAcum = vec3(0.0);

	for (float currentCircle = 0.0; currentCircle < blurCircles; currentCircle++) {
		float samplesForCurrentCircle = (pow(currentCircle + 1.0, 2.0) - pow(currentCircle, 2.0)) * 4.0;
		float currentRadius = (blurRadius / blurCircles) * (currentCircle + 0.5);

		for (float currentSample = 0.0; currentSample < MAX_SAMPLES; currentSample++) {
			if (currentSample >= samplesForCurrentCircle)
				break;

			vec2 samplePoint = vec2(0.0, currentRadius);
			float angle = PI2 * ((currentSample + 0.5) / samplesForCurrentCircle);

			float s = sin(angle);
			float c = cos(angle);
			mat2 m = mat2(c, -s, s, c);
			samplePoint = m * samplePoint;

			samplePoint *= vec2(uResolution.y / uResolution.x, 1.0);

			totalSamples++;
			colAcum = max(colAcum, texture(tMap, vUv + samplePoint).rgb);
		}
	}

	FragColor = vec4(colAcum, 1.0);

	// vec4 interfaceColor = texture(tInterface, vUv);
	// FragColor += interfaceColor;

	// FragColor.rgb = mix(FragColor.rgb, mix(FragColor.rgb, vec3(1), 0.5), amount);
}
