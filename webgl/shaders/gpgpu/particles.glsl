uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uBase;
uniform sampler2D uData;
uniform sampler2D uAttributes;

uniform float uFlowFieldInfluence;
uniform float uFlowFieldStrength;
uniform float uFlowFieldFrequency;

uniform float uFlowFieldInfluence2;
uniform float uFlowFieldStrength2;
uniform float uFlowFieldFrequency2;

uniform float uPercentRange;

uniform bool uIsMorphing;


#include <simplexNoise4d>

void main()
{
    float time = uTime * 0.1;
    vec2 uv = gl_FragCoord.xy / resolution.xy;


    vec4 particle = texture(uParticles, uv);
    vec4 data = texture(uData, uv);
    // vec4 base = texture(uBase, uv);
    vec4 base = texture(uBase, uv);
    // base = baseModel;
    vec4 _attribute = texture(uAttributes, uv);

    float range = _attribute.x;
    float friction = _attribute.y;
    float particleSize = fract(particle.a * .1);

    // Dead
    if(particle.a >= 1.0)
    {
        particle.a = mod(particle.a, 1.0);
        particle.xyz = base.xyz;
    }

    // Alive
    else
    {
        bool isMorphing = (range < uPercentRange);
        bool isModelParticleMorph = isMorphing && range < 9.;

        float flowFieldFrequency = isMorphing ? uFlowFieldFrequency2 : uFlowFieldFrequency;
        float flowFieldStrength = isMorphing ? uFlowFieldStrength2 : uFlowFieldStrength;
        float flowFieldInfluence = isMorphing ? uFlowFieldInfluence2 : uFlowFieldInfluence;

        float strength = simplexNoise4d(vec4(base.xyz * 0.2, time + 1.0));

        float influence = (flowFieldInfluence - 0.5) * (- 2.0);
        strength = smoothstep(influence, 1.0, strength);

        vec3 flowField = vec3(
            simplexNoise4d(vec4(particle.xyz * flowFieldFrequency  + 0.0, time)) ,
            simplexNoise4d(vec4(particle.xyz * flowFieldFrequency + 1.0, time)) ,
            simplexNoise4d(vec4(particle.xyz * flowFieldFrequency  + 2.0, time))
        );

        flowField = normalize(flowField);

        if (isMorphing) {
            vec3 baseFriction = base.xyz + (particle.xyz - base.xyz) * friction;
            // // bool endedAnimation = distance(baseFriction, base.xyz) < 0.2 || uOther.x = 1.;

            // if(distance(baseFriction, base.xyz) < 0.2) {
            //     particle.a = 1.0;
            // }

            // if (data.x == 1.) {
            //     particle.xyz += flowField * uDeltaTime * strength * flowFieldStrength;
            //     particle.a += uDeltaTime * 0.3;
            // } else {
            //     particle.xyz = baseFriction;
            // }
            particle.xyz = baseFriction;

        } else {
            particle.xyz += flowField * uDeltaTime * strength * flowFieldStrength;
        }

    }

    gl_FragColor = particle;

}
