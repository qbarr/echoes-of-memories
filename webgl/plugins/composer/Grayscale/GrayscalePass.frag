precision highp float;

uniform sampler2D tMap;
uniform float uGrayStrength;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;

	vec4 tex = texture2D(tMap, uv);
	vec3 chosenChannel = vec3(0.0, .3, .7); // red
	float luminance = dot(tex.rgb, chosenChannel);
	tex.rgb = mix(vec3(dot(tex.rgb, vec3(0.299, 0.587, 0.114))), tex.rgb, luminance);

	tex.rgb = mix(texture2D(tMap, uv).rgb, tex.rgb, uGrayStrength);

	gl_FragColor = tex;
}
