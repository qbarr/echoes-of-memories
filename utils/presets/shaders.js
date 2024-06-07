//Particles

import baseParticleVertex from '#webgl/shaders/particle/base/baseParticle.vert'
import baseParticleFragment from '#webgl/shaders/particle/base/baseParticle.frag'

import emissiveParticleVertex from '#webgl/shaders/particle/emissive/emissiveParticle.vert'
import emissiveParticleFragment from '#webgl/shaders/particle/emissive/emissiveParticle.frag'


// GPGPU
import base from '#webgl/shaders/gpgpu/particles.glsl'

export const presetsShader = {
	gpgpu: {
		base
	},
	particles: {
		base: {
			vertex: baseParticleVertex,
			fragment: baseParticleFragment,
		},
		emissive: {
			vertex: emissiveParticleVertex,
			fragment: emissiveParticleFragment,
		}
	}

}
