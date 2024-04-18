import { poolify } from '#utils/optims';
import {
	Color,
	Quaternion,
	Vector2,
	Vector3,
	Vector4,
	Matrix4,
	Euler,
	MathUtils
} from 'three';

export function patchThree() {
	// Add damp methods to three classes
	addDamp();
	// Add pool methods to three classes
	poolifyThreeClasses();
}

function poolifyThreeClasses() {
	poolify(Quaternion, quaternion => quaternion.set(0, 0, 0, 0));
	poolify(Color, color => color.setRGB(0, 0, 0));
	poolify(Vector2, vector => vector.setScalar(0));
	poolify(Vector3, vector => vector.setScalar(0));
	poolify(Vector4, vector => vector.setScalar(0));
	poolify(Euler, euler => euler.set(0, 0, 0, 'XYZ'));
	poolify(Matrix4);
}

function addDamp() {
	Color.prototype.damp = function damp(c, lambda, dt) {
		return this.lerp(c, 1 - Math.exp(-lambda * 0.05 * dt));
	};

	Vector2.prototype.damp = function damp(v, lambda, dt) {
		return this.lerp(v, 1 - Math.exp(-lambda * 0.05 * dt));
	};

	Vector2.prototype.dampVectors = function dampVectors(v1, v2, lambda, dt) {
		this.x = MathUtils.lerp(v1.x, v2.x, 1 - Math.exp(-lambda * 0.05 * dt));
		this.y = MathUtils.lerp(v1.y, v2.y, 1 - Math.exp(-lambda * 0.05 * dt));
		this.z = MathUtils.lerp(v1.z, v2.z, 1 - Math.exp(-lambda * 0.05 * dt));

		return this;
	};

	Vector3.prototype.damp = function damp(v, lambda, dt) {
		return this.lerp(v, 1 - Math.exp(-lambda * 0.05 * dt));
	};

	Vector3.prototype.dampVectors = function dampVectors(v1, v2, lambda, dt) {
		this.x = MathUtils.lerp(v1.x, v2.x, 1 - Math.exp(-lambda * 0.05 * dt));
		this.y = MathUtils.lerp(v1.y, v2.y, 1 - Math.exp(-lambda * 0.05 * dt));
		this.z = MathUtils.lerp(v1.z, v2.z, 1 - Math.exp(-lambda * 0.05 * dt));
		return this;
	};

	Vector4.prototype.damp = function damp(v, lambda, dt) {
		return this.lerp(v, 1 - Math.exp(-lambda * 0.05 * dt));
	}

	Vector4.prototype.dampVectors = function dampVectors(v1, v2, lambda, dt) {
		this.x = MathUtils.lerp(v1.x, v2.x, 1 - Math.exp(-lambda * 0.05 * dt));
		this.y = MathUtils.lerp(v1.y, v2.y, 1 - Math.exp(-lambda * 0.05 * dt));
		this.z = MathUtils.lerp(v1.z, v2.z, 1 - Math.exp(-lambda * 0.05 * dt));
		this.w = MathUtils.lerp(v1.w, v2.w, 1 - Math.exp(-lambda * 0.05 * dt));
		return this;
	}

	Quaternion.prototype.sdamp = function sdamp(q, lambda, dt) {
		return this.slerp(q, 1 - Math.exp(-lambda * 0.05 * dt));
	};
}
