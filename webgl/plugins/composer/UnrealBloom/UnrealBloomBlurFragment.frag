precision highp float;

uniform sampler2D tMap;
uniform vec2 uDirection;
uniform vec2 uResolution;

in vec2 vUv;

out vec4 FragColor;

float gaussianPdf(float x, float sigma) {
	return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
}

vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
	vec2 invSize = 1.0 / resolution;
	float fSigma = float(SIGMA);
	float weightSum = gaussianPdf(0.0, fSigma);
	vec3 diffuseSum = texture(image, uv).rgb * weightSum;

	for (int i = 1; i < KERNEL_RADIUS; i++) {
		float x = float(i);
		float w = gaussianPdf(x, fSigma);
		vec2 uvOffset = direction * invSize * x;
		vec3 sample1 = texture(image, uv + uvOffset).rgb;
		vec3 sample2 = texture(image, uv - uvOffset).rgb;
		diffuseSum += (sample1 + sample2) * w;
		weightSum += 2.0 * w;
	}

	return vec4(diffuseSum / weightSum, 1.0);
}

void main() {
	FragColor = blur(tMap, vUv, uResolution, uDirection);
}
