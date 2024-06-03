precision highp float;

uniform float uStrength;
uniform sampler2D tLutMap;
uniform sampler2D tMap;

varying vec2 vUv;

#include <lut>

void main() {
	vec4 val = texture2D(tMap, vUv);
	vec4 color = mix(val, lookup(tLutMap, val), uStrength);
	gl_FragColor = color;
}
