uniform sampler2D tMap;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	gl_FragColor = texture2D(tMap, uv);
	gl_FragColor.a = smoothstep(0.1, 0.4, gl_FragColor.a) + gl_FragColor.a;
}
