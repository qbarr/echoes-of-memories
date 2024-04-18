/*

poolify
v1.0.0
––––––
Make a class poolable

*/

export function poolify(Class, reset, max = Number.MAX_SAFE_INTEGER) {
	const free = [];

	if (typeof reset === 'function') {
		Class.prototype.onPoolReset = reset;
	}

	Class.prototype.release = release;

	function create() {
		return new Class();
	}

	function release() {
		Class.release(this);
		return this;
	}

	Class.alloc = function (count) {
		if (count <= 0) return;
		while (count--) Class.release(create());
	};

	Class.get = function poolGet() {
		const item = free.pop() || create();
		if (item.onPoolReset) item.onPoolReset(item);
		return item;
	};

	Class.release = function poolRelease() {
		let i = arguments.length;
		while (i--) if (free.length < max) free.push(arguments[ i ]);
	};

	return Class;
}
