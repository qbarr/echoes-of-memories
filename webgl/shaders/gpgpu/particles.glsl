uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uBase;
uniform sampler2D uAttributes;

uniform float uFlowFieldInfluence;
uniform float uFlowFieldStrength;
uniform float uFlowFieldFrequency;

uniform float uPercentRange;
uniform float uDeathRange;

uniform bool uIsMorphing;
uniform bool uMorphEnded;


#include <simplexNoise4d>

void main()
{
    float time = uTime * 0.1;
    vec2 uv = gl_FragCoord.xy / resolution.xy;


    vec4 particle = texture(uParticles, uv);
    // vec4 base = texture(uBase, uv);
    vec4 base = texture(uBase, uv);
    // base = baseModel;
    vec4 _attribute = texture(uAttributes, uv);

    float range = _attribute.x;
    float friction = _attribute.y;
    float deathRange = _attribute.z;
    float particleSize = fract(particle.a * .1);



    // Dead
    if(particle.a >= 1.0)
    {
        bool isDead = (range > uDeathRange);
        particle.a = mod(particle.a, 1.0);
        particle.xyz = base.xyz;

        // if(isDead) {
        //     particle.a = 0.;
        // }
    }

    // Alive
    else
    {
        bool isMorphing = (range < uPercentRange);
        float strength = simplexNoise4d(vec4(base.xyz * 0.2, time + 1.0));

        float influence = (uFlowFieldInfluence - 0.5) * (- 2.0);
        strength = smoothstep(influence, 1.0, strength);

        vec3 flowField = vec3(
            simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency  + 0.0, time)) ,
            simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 1.0, time)) ,
            simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency  + 2.0, time))
        );

        flowField = normalize(flowField);

        if (isMorphing) {
            vec3 baseFriction = base.xyz + (particle.xyz - base.xyz) * friction;

            if(uMorphEnded) {
                particle.xyz += flowField * uDeltaTime * strength * uFlowFieldStrength;
                particle.a += uDeltaTime * 0.3;
            } else {
                particle.xyz = baseFriction;
            }

        } else {
           particle.xyz += flowField * uDeltaTime * strength * uFlowFieldStrength;
        }

    }

    gl_FragColor = particle;
}
