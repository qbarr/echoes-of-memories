import BaseScene from '#webgl/core/BaseScene.js';
import { MeshBasicMaterial, Uniform, Vector2, Vector3 } from 'three';
import { MainCamera } from '../Cameras/MainCamera';
import { Particles } from '../Particles/Particles';

const startValues = {
	uFlowFieldFrequency: { value: 0.21 },
	uFlowFieldStrength: { value: 2.3 },
	uFlowFieldInfluence: { value: 1.0 }
}

const lerp = (a, b, n) => a + n * (b - a)

export default class ParticleScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		const { $assets } = this.webgl;
		const boat  = $assets.objects['boat'].scene;
		boat.position.set(0, 0, 0);
		this.camera = this.add(MainCamera);
		this.camera.base.lookAt(0, 0, 0);
		this.camera.base.position.z = 10;
		this.particles = this.add(Particles, {
			instance: boat.children[0].geometry.clone(),
			type: 'instance',
			options: {
				gpgpu: {
					uniforms: {
						...startValues
					}
				}
			}
		})

		this.mouse = new Vector2(0, 0)
		this.offset = new Vector3(0, 0, 0);
		this.cameraBasePosition = this.camera.base.position.clone();
		window.addEventListener('mousemove', this.onMouseMove.bind(this));
	}

	onMouseMove(e) {
		this.mouse.x = e.clientX / window.innerWidth * 2 - 1;
		this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
		// this.offset.x = this.lerp(this.offset.x, -this.mouse.x * .06, .05)
		// this.rotateAroundPoint(this.camera.base, new Vector3(0), new Vector3(0, 1, 0), 0.01, false)

	}

	async enter() {
		this.introAnimate();
	}

	introAnimate() {
		const { $composer } = this.webgl;
		$composer.$crt.unglitch()
		$composer.$lut.animateSaturation(1)

		setTimeout(() => {
			this.particles.gpgpu.uniformsTo({
				uFlowFieldFrequency: new Uniform(0.5),
				uFlowFieldInfluence: new Uniform(0.4),
				uFlowFieldStrength: new Uniform(2),
			})
		}, 3000);

	}


	rotateAroundPoint (obj, point, axis, theta, pointIsWorld = false) {
		if (pointIsWorld) obj.parent?.localToWorld(obj.position) // compensate for world coordinate

		obj.position.sub(point) // remove the offset
		obj.position.applyAxisAngle(axis, theta) // rotate the POSITION
		obj.position.add(point) // re-add the offset

		if (pointIsWorld) obj.parent?.worldToLocal(obj.position) // undo world coordinates compensation

		obj.rotateOnAxis(axis, theta) // rotate the OBJECT
	}

	update() {
		const { $time } = this.webgl;

		// this.offset.x = 15 * Math.sin( $time.elapsed * 0.0001 );
		// this.offset.y = 2 * Math.sin( $time.elapsed * 0.0001 );
		// this.offset.z = 10 * Math.cos( $time.elapsed * 0.0001 );
		// this.offset.y = 5
		// this.camera.base.position.copy(this.particles.base.position).add(this.offset);
		// this.camera.base.lookAt(0, 0, 0);
		// this.particles.base.rotation.x = Math.sin($time.elapsed * 0.0005) * 0.1;
		// this.particles.base.rotation.y = Math.cos($time.elapsed * 0.0002) * 0.03;
		// this.particles.base.rotation.z = Math.sin($time.elapsed * 0.0005) * 0.05;

		// this.camera.base.position.x = this.cameraBasePosition.x + (this.mouse.x * .3);
		// this.camera.base.position.y = this.cameraBasePosition.y + (this.mouse.y * .3);
		// this.camera.base.lookAt(0, 0, 0);



		// this.camera.base.lookAt(0, 0, 0);
		// this.camera.base.rotation.y = this.mouse.y * 0.01;
	}


	lerp(a, b, n) {
		return a + n * (b - a)
	}

}
