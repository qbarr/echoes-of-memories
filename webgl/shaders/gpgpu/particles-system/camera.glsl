uniform vec3 uCameraPosition;
uniform vec2 uBoundingBoxX;
uniform vec2 uBoundingBoxY;
uniform vec2 uBoundingBoxZ;


void main() {
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	//if particle behind camera, respawn at maximum box
    vec4 particle = texture(uParticles, uv);

    // x min, y max
	if(particle.z < uBoundingBoxZ.x) {
		particle.z = uBoundingBoxZ.y;
	}

	gl_FragColor = particle;
}
