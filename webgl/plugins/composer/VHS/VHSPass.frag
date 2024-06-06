precision highp float;

#include <props>

uniform sampler2D tMap;
uniform vec2 uCurvature; // simulate curvature of CRT monitor
uniform vec2 uPadding; // simulate padding of CRT monitor
uniform float uScanLines; // simulate darkness between scanlines

varying vec2 vUv;

vec2 curveUv(vec2 uv) {
	vec2 curvedUv = uv;
	vec2 dc = abs(0.5 - uv);
	dc *= dc;

	curvedUv.x -= 0.5;
	curvedUv.x *= 1.0 + (dc.y * (0.3 * uCurvature.x));
	curvedUv.x += 0.5;
	curvedUv.y -= 0.5;
	curvedUv.y *= 1.0 + (dc.x * (0.4 * uCurvature.y));
	curvedUv.y += 0.5;

	// Add padding
	vec2 padding = uPadding * .01;
	curvedUv -= padding;
	curvedUv /= 1.0 - (padding * 2.0);

	return curvedUv;
}

void main() {
	// squared distance from center
	vec2 uv = vUv;
	vec2 curvedUv = curveUv(uv);

	if (curvedUv.y > 1.0 || curvedUv.x < 0.0 || curvedUv.x > 1.0 || curvedUv.y < 0.0)
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	else {
		float scanLines = abs(sin(gl_FragCoord.y - uTime * .01) * 0.5 * uScanLines);
		gl_FragColor = vec4(mix(texture2D(tMap, curvedUv).rgb, vec3(0.0), scanLines), 1.0);
	}
}
