varying vec2 vUv;
uniform sampler2D tDiffuse;

void main() {
	vec4 base = texture2D(tDiffuse, vUv);
	vec3 color = base.rgb * vec3(1.);
	gl_FragColor = vec4(color, base.a);
}
