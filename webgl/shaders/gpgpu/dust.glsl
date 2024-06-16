uniform float uDeltaTime;
uniform float uTime;
uniform sampler2D uBase;

uniform float uFlowFieldInfluence;
uniform float uFlowFieldStrength;
uniform float uFlowFieldFrequency;

#include <simplexNoise4d>

void main() {
	float time = uTime * 0.1;
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	vec4 particle = texture2D(uDustParticles, uv);
	vec4 base = texture2D(uBase, uv);

    float strength = simplexNoise4d(vec4(base.xyz * 0.2, time + 1.0));

	float influence = (uFlowFieldInfluence - 0.5) * (- 2.0);
	strength = smoothstep(influence, 1.0, strength);

	vec3 flowField = vec3(
		simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency  + 0.0, time)) ,
		simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 1.0, time)) ,
		simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency  + 2.0, time))
	);

	flowField = normalize(flowField);

	particle.xyz += flowField * uDeltaTime * strength * uFlowFieldStrength;

	gl_FragColor = particle;
}
