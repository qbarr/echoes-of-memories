precision highp float;

#include <packing>
#include <common>
#include <props>

uniform float time;
uniform vec4 resolution;

uniform float uDistance;
uniform sampler2D tDepth;

varying vec2 vUv;

float calc_depth(float z) {
	float near = .05;
	float far = 4.15;
	return (2.0 * near) / (far + near - z * (far - near));
}

void main() {
	vec2 uv = vUv;
	vec4 depthColor = texture2D(tDepth, uv);
	float geometryZ = calc_depth(unpackRGBAToDepth(depthColor));
	float sceneZ = calc_depth(gl_FragCoord.z);
	float softAlpha = smoothstep(0., uDistance, saturate(geometryZ - sceneZ));
	gl_FragColor.rgb = mix(vec3(1.0), vec3(0.0), softAlpha);
	gl_FragColor.a = 1.0;
}
