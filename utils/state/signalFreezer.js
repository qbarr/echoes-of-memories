const stack = new Set();

const api = {
	stack,
	isFrozen: false,
	holdEmits,
	releaseEmits,
	batchUpdates
};

function holdEmits() {
	api.isFrozen = true;
}

function releaseEmits() {
	api.isFrozen = false;
	for (const item of stack) item.emit();
	stack.clear();
}

function batchUpdates(cb) {
	holdEmits();
	cb();
	releaseEmits();
}

export default api;
