uniform sampler2D uSprite;
uniform vec2 uResolution;

varying vec3 vColor;
varying float vZpos;

float remap(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main()
{
	// vec4 sprite = texture(uSprite,  gl_PointCoord.xy);
    float distanceToCenter = pow(1. - length(gl_PointCoord - 0.5), 4.);


    gl_FragColor = vec4(vec3(1.0), distanceToCenter);

    // #include <tonemapping_fragment>
    // #include <colorspace_fragment>
	// gl_FragColor.a = distanceToCenter;
	// gl_FragDepth = vZpos * .5 - .5;
}
