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

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

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

    bool isDead = (uDeathRange > deathRange);

    //  if (isDead) {
    //     discard;
    //     return;
    // }
    // Dead
    if(particle.a >= 1.0 && !isDead)
    {
        particle.a = mod(particle.a, 1.0);
        particle.xyz = base.xyz;


    }

    // Alive
    else
    {
        bool isMorphing = uPercentRange > range;
        float strength = simplexNoise4d(vec4(base.xyz * 0.2, time + 1.0));


        // float influenceDeath = (1. - (deathRange - uDeathRange));
        // influenceDeath = map(influenceDeath, 1. - deathRange, 1.0, 0.0, 1.) * (.2 +(1. - deathRange));
        // float mapInfluence = map(influenceDeath, influenceDeath, 1.0, 0.0, 0.5);
        float influenceDeath = map(uDeathRange, deathRange - 0.2, deathRange, 0., 0.5);
        influenceDeath = clamp(influenceDeath, 0.0, 0.5);
        float influence = ((uFlowFieldInfluence + influenceDeath) - 0.5) * (- 2.0) ;
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
                if (!isDead) particle.a += uDeltaTime * 0.3;
            } else {
                particle.xyz = baseFriction;
            }

        } else {
           particle.xyz += flowField * uDeltaTime * strength * uFlowFieldStrength;
        }

    }

    gl_FragColor = particle;
}
