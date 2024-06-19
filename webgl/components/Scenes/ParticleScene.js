import BaseScene from '#webgl/core/BaseScene.js';
import {
	MathUtils,
	Mesh,
	MeshBasicMaterial,
	Quaternion,
	Uniform,
	Vector2,
	Vector3,
} from 'three';
import { MainCamera } from '../Cameras/MainCamera';
import { Particles } from '../Particles/Particles';
import { raftween } from '#utils/anim/raftween.js';
import { damp, dampPrecise } from '#utils/maths/map.js';

const startValues = {
	uFlowFieldFrequency: { value: 0.21 },
	uFlowFieldStrength: { value: 2.3 },
	uFlowFieldInfluence: { value: 1.0 },
};

const coords = {
	from: {
		position: [0.048841, -0.365468, 3.647662],
		quaternion: [0.07773159, 0.00986795, -0.00076942, 0.99692519],
	},
	to: {
		position: [],
		quaternion: [],
	},
	toMobile: {
		position: [-0.04504, -0.33404, 1.5542],
		quaternion: [0.102611, -0.007329, 0.000756, 0.994694],
		fov: 70.0,
	},
	toDesktop: {
		position: [-0.01613, -0.43987, 1.41361],
		quaternion: [0.144932, 0.001752, -0.000257, 0.98944],
		fov: 55.0,
	},
};

for (let k in coords) {
	const c = coords[k];
	c.position = new Vector3(...c.position);
	c.quaternion = new Quaternion(...c.quaternion);
}

const lerp = (a, b, n) => a + n * (b - a);

export default class ParticleScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		const { $gpgpu } = this.webgl;
		this.mouse = new Vector2(0, 0);
		this.offset = new Vector2(0, 0);
		window.addEventListener('mousemove', this.onMouseMove.bind(this));
	}

	afterInit() {}

	initState() {
		this.state = {};
		this.state.mouseInfluence = 0;
		this.state.dollyProgress = 0;
		this.state.mouseX = 0;
		this.state.mouseY = 0;
		this.state.ang = 0;

		this.state.camTween = raftween({
			target: this.state,
			property: 'dollyProgress',
			easing: 'inOutExpo',
			from: 0,
			to: 1,
			duration: 1600,
		});
	}

	onMouseMove(e) {
		this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
		this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
		// this.offset.x = this.lerp(this.offset.x, -this.mouse.x * .06, .05)
		// this.rotateAroundPoint(this.camera.base, new Vector3(0), new Vector3(0, 1, 0), 0.01, false)
	}

	async enter() {
		// this.introAnimate();
		const { $povCamera, $app, $gpgpu } = this.webgl;
		$povCamera.onSceneSwitch(this);
		this.particles = this.add(Particles, {
			gpgpu: $gpgpu.list.get()[0],
			options: {},
		});
		$gpgpu.list.get().forEach((g) => g.forceCompute.set(true));
		// this.camera = $povCamera;
		// this.camera.add(MainCamera);
	}

	leave() {
		this.camera.$setState('cinematique');
	}

	rotateAroundPoint(obj, point, axis, theta, pointIsWorld = false) {
		if (pointIsWorld) obj.parent?.localToWorld(obj.position); // compensate for world coordinate

		obj.position.sub(point); // remove the offset
		obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
		obj.position.add(point); // re-add the offset

		if (pointIsWorld) obj.parent?.worldToLocal(obj.position); // undo world coordinates compensation

		obj.rotateOnAxis(axis, theta); // rotate the OBJECT
	}

	update() {

		// const { $time } = this.webgl;
		// if (!this.) return
		return
		const sdt = this.webgl.$time.stableDt;
		const t = this.webgl.$time.elapsed;

		this.offset.x = damp(this.offset.x, -this.mouse.x * .1, .05, sdt)
		const point = Vector3.get().set(0, 0, 0)
		const axis = Vector3.get().set(0, 1, 0)
		this.rotateAroundPoint(this.camera.base, point, axis, this.offset.x, false)
		point.release()
		axis.release()
		// console.log(this.camera.base)
		return

		if (
			this.state.mouseInfluence <= 0 &&
			this.state.dollyProgress >= 1 &&
			!this.state.needsUpdate
		)
			return;

		this.state.mouseInfluence = dampPrecise(
			this.state.mouseInfluence,
			0.3,
			0.1,
			sdt,
			0.001,
		);

		if (this.state.camTween) this.state.camTween.update(sdt);

		if (this.state.mouseInfluence > 0) {
			const m = this.state.mouseInfluence * this.state.dollyProgress;
			const tx = this.mouse.x * m;
			const ty = this.mouse.y * m;
			const px = this.state.mouseX;

			// damped mouse influence
			let x = (this.state.mouseX = damp(this.state.mouseX, tx, 0.1, sdt));
			let y = (this.state.mouseY = damp(this.state.mouseY, ty, 0.1, sdt));
			console.log(x, y);
			// wiggle effect
			// const tm = 2.2;
			// const am = 0.25 * m;
			// x += Math.sin(t * 0.001 * tm) * 0.02 * am;
			// y += Math.cos(t * 0.001 * tm) * 0.3 * am;

			this.state.ang = damp(this.state.ang, (x - px) * 0.5, 0.2, sdt);
			this.camera.base.position.x += x * 0.03;
			this.camera.base.position.y += y * 0.02;
			this.camera.base.rotation.y += x * 0.03;
			this.camera.base.rotateZ(this.state.ang);
			// this.camera.base.lookAt(0, 0, 0);
		}
		// this.camera.base.position.lerpVectors(
		// 	coords.from.position,
		// 	coords.to.position,
		// 	this.state.dollyProgress
		// );

		// this.camera.base.quaternion.slerpQuaternions(
		// 	coords.from.quaternion,
		// 	coords.to.quaternion,
		// 	this.state.dollyProgress
		// );
	}

	lerp(a, b, n) {
		return a + n * (b - a);
	}
}
