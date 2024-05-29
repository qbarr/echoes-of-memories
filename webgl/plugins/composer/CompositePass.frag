precision highp float;

#define PI2 6.283185307179586476925286766559

uniform float time;
uniform vec4 resolution;
// uniform sampler2D uBlueNoiseMap;

// Dither
uniform vec2 uDitherOffset;
uniform float uDitherStrength;

// Tint
uniform float uBichromy;
uniform float uSaturation;

// Passes
uniform sampler2D tMap;
uniform sampler2D tMapBloom;
uniform sampler2D tBloom;

varying vec2 vUv;

float random(vec2 co) {
	float a = 12.9898;
	float b = 78.233;
	float c = 43758.5453;
	float dt = dot(co.xy, vec2(a, b));
	dt *= uDitherOffset.y;
	float sn = mod(dt, 3.14);
	sn *= uDitherOffset.x;
	return fract(sin(sn) * c);
}

vec3 dither(vec3 color) {
	// Calculate grid position
	float grid_position = random(gl_FragCoord.xy);

	// Shift the individual colors differently, thus making it even harder to see the dithering pattern
	vec3 dither_shift_RGB = vec3(0.0296078431); // 5. / 255.

	// Modify shift acording to grid position
	dither_shift_RGB = mix(2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position);

	// Shift the color by dither_shift
	return color + dither_shift_RGB;
}

void main() {
	vec2 uv = vUv;

	// Composite
	vec4 tex = texture2D(tMap, uv);
	tex += texture2D(tBloom, uv);
	tex += texture2D(tMapBloom, uv);

	// Tint - Bichromy
	tex.rgb = mix(tex.rgb, vec3(dot(tex.rgb, vec3(0.299, 0.587, 0.114))), uBichromy);
	// Tint - Saturation
	// tex.rgb = mix(vec3(dot(tex.rgb, vec3(0.299, 0.587, 0.114))), tex.rgb, uSaturation);

	// grayscale all the channels except the chosen one
	// vec3 chosenChannel = vec3(1.0, 0.0, 0.0); // red
	// float luminance = dot(tex.rgb, chosenChannel);
	// tex.rgb = mix(vec3(dot(tex.rgb, vec3(0.299, 0.587, 0.114))), tex.rgb, luminance);

	// TODO: replace by blue noise texture
	// tex.rgb = mix(tex.rgb, dither(tex.rgb), uDitherStrength);

	gl_FragColor = tex;
	gl_FragColor.a = 1.0;
}
