import { Particles } from './Particles'
import BaseComponent from '#webgl/core/BaseComponent.js'
import { Vector3 } from 'three'

export class ParticlesSystem extends BaseComponent {
	init() {
		const { count, position } = this.props
		// if (!count || !position) return console.error('ParticlesSystem: missing count or position')
		this.particles = this.add(Particles, this.props)
		this.base = this.particles.base
	}
}
