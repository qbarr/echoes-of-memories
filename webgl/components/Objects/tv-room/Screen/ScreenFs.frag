precision highp float;

#include <props>

varying vec2 vUv;

uniform sampler2D tMap;

void main() {
	vec2 uv = vUv;
	// uv.y += sin(uv.x * 10.0 + uTime * .01) * 0.01;
	gl_FragColor = texture2D(tMap, uv);
	// gl_FragColor = vec4(uv, 0.0, 1.0);
}
