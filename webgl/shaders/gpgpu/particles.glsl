uniform sampler2D uBase;
uniform float uTime;
uniform float uDeltaTime;

#include <simplexNoise4d>

void main() {
    vec2 localUv = gl_FragCoord.xy / resolution.xy;
    vec4 particle = texture(uParticles, localUv);
	vec4 base = texture(uBase, localUv);
	float time = 0.01;

	if(particle.a >= 1.0)
	{
		particle.a = 0.0;
		particle.xyz = base.xyz;
	}
	else
	{
		vec3 flowField = vec3(
			simplexNoise4d(vec4(particle.xyz + 0.0, time)),
			simplexNoise4d(vec4(particle.xyz + 1.0, time)),
			simplexNoise4d(vec4(particle.xyz + 2.0, time))
		);

		flowField = normalize(flowField);
		particle.xyz += flowField * uDeltaTime * 0.0005;
		particle.a += 0.01;
	}

    gl_FragColor = particle;
}
