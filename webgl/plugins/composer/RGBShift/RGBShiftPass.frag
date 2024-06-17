precision highp float;

uniform sampler2D tMap;
uniform sampler2D tAfterImage;
uniform sampler2D tDepth;
uniform sampler2D tInterface;
uniform sampler2D tSketchLines;

uniform float uAmount;
uniform float uAngle;
uniform float uDarkness;
uniform float uStripesScale;

varying vec2 vUv;
uniform vec2 uVignette;

void main() {
	vec2 uv = vUv;

	float depth = texture2D(tDepth, uv).r;

	vec4 texel = texture2D(tMap, uv);

	vec2 offset = uAmount * vec2(cos(uAngle), sin(uAngle));
	vec4 cr = texture2D(tMap, uv + offset);
	vec4 cb = texture2D(tMap, uv - offset);

	vec4 shiftColor = vec4(cr.r, cb.g, texel.b, texel.a);
	vec4 color = mix(texel, shiftColor, smoothstep(0.3, 1., pow(1. - depth, .6)));

	gl_FragColor = color;

	vec4 outlines = texture2D(tSketchLines, uv);
	gl_FragColor.rgb += outlines.rgb;

	vec2 uvVignette = uv;
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

	// Interface
	vec4 interfaceColor = texture2D(tInterface, uv);
	interfaceColor.rgb *= 1.2;
	gl_FragColor.rgb = mix(gl_FragColor.rgb, interfaceColor.rgb, interfaceColor.a);

	// debug
	// gl_FragColor += vec4(smoothstep(0.3, 1., pow(1. - depth, .6)));
}
