precision highp float;

#include <props>

uniform sampler2D tMap;
uniform sampler2D tAfterImage;
uniform sampler2D tDepth;
uniform sampler2D tInterface;
uniform sampler2D tSketchLines;

uniform int isInVHSMode;
uniform float uAmount;
uniform float uAngle;
uniform float uDarkness;
uniform float uStripesScale;
uniform float uPauseSaturation;

varying vec2 vUv;
uniform vec2 uVignette;

void main() {
	vec2 uv = vUv;

	float depth = texture2D(tDepth, uv).r;

	vec4 texel = texture2D(tMap, uv);

	vec2 offset = uAmount * vec2(cos(uAngle), sin(uAngle));
	float cr = texture2D(tMap, uv + offset).r;
	float cg = texture2D(tMap, uv - offset).g;

	vec4 shiftColor = vec4(cr, cg, texel.b, texel.a);
	vec4 color = mix(texel, shiftColor, smoothstep(0.3, 1., pow(1. - depth, .6)));

	gl_FragColor = color;

	vec4 outlines = texture2D(tSketchLines, uv);
	gl_FragColor.rgb += outlines.rgb;

	vec2 uvVignette = gl_FragCoord.xy / uResolution.xy;
	vec2 position = uvVignette - 0.5;
	position.y *= pow(abs(position.y), -uVignette.y);
	float len = length(position);
	float vignetteProgress = 1. - uVignette.x;
	float vignette = smoothstep(vignetteProgress, vignetteProgress - 0.5, len);
	float vignetteSmoothness = 0.323;
	vignette = smoothstep(0.0, vignetteSmoothness, vignette);
	vignette = pow(vignette, vignetteSmoothness);
	gl_FragColor.rgb *= vignette;

	// Black stripe
	float stripes = 0.;
	float size = uStripesScale * 0.5;
	stripes += step(size, uv.y); // top
	stripes -= step(1. - size, uv.y); // bottom
	gl_FragColor.rgb *= stripes;

	// After image
	// vec4 afterImage = texture2D(tAfterImage, uv);
	// gl_FragColor.rgb += afterImage.rgb;

	// Darkness
	gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.), uDarkness);

	// Saturate
	gl_FragColor.rgb = mix(vec3(dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114))), gl_FragColor.rgb, 1. - uPauseSaturation);

	// Interface
	vec4 texelInterface = texture2D(tInterface, uv);
	if (isInVHSMode == 1) {
		float texelInterface_r = texture2D(tInterface, uv + offset * .3).r;
		float texelInterface_b = texture2D(tInterface, uv - offset * .3).g;
		texelInterface = vec4(texelInterface_r, texelInterface_b, texelInterface.b, texelInterface.a);
	}
	texelInterface.rgb *= 1.2;
	gl_FragColor.rgb = mix(gl_FragColor.rgb, texelInterface.rgb, texelInterface.a);

	// debug
	// gl_FragColor += vec4(smoothstep(0.3, 1., pow(1. - depth, .6)));
}
