precision highp float;

uniform float time;
uniform vec4 resolution;

uniform float zNear;
uniform float zFar;
uniform vec2 uDistance;
uniform sampler2D tMap;
uniform sampler2D tDepth;

varying vec2 vUv;

float calc_depth(float z) {
	float near = uDistance.x;
	float far = uDistance.y;
	return (2.0 * near) / (far + near - z * (far - near));
}

#include <packing>
#include <common>

void main() {
	vec2 uv = vUv;
	vec4 tex = texture2D(tMap, uv);

	vec4 depthColor = texture2D(tDepth, uv);
	float geometryZ = calc_depth(unpackRGBAToDepth(depthColor));
	float sceneZ = calc_depth(gl_FragCoord.z);
	float softAlpha = smoothstep(.5, 0., saturate(geometryZ - sceneZ));

	gl_FragColor = mix(tex, vec4(0.0), softAlpha);
}
