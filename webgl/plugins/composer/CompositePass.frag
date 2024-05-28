precision highp float;

#define PI2 6.283185307179586476925286766559

uniform float time;
uniform vec4 resolution;
uniform sampler2D tMap;
uniform sampler2D tMapBloom;
uniform sampler2D tBloom;

varying vec2 vUv;

float random(vec2 co) {
	float a = 12.9898;
	float b = 78.233;
	float c = 43758.5453;
	float dt = dot(co.xy, vec2(a, b));
	float sn = mod(dt, 3.14);
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

	vec4 tex = texture2D(tMap, uv);
	tex += texture2D(tMapBloom, uv);
	tex.rgb += texture2D(tBloom, uv).rgb;

	// TODO: replace by blue noise texture
	// tex.rgb += dither(tex.rgb) * tex.rgb;
	tex.rgb = dither(tex.rgb);

	tex.a = 1.0;

	gl_FragColor = tex;
}
