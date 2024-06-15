uniform sampler2D uParticles
uniform float uDeltaTime

void main() {
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	vec4 particle = texture2D(uParticles, uv);
	vec4 data = vec4(0.);
	bool isMorphEnded = particle.a;

	if(particle.a >= 1.) {
		data.x = 0.;
	}


	gl_FragColor = data;
}
