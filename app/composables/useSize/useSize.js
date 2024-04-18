import { onMounted, onBeforeUnmount, reactive, shallowRef } from 'vue';

let elements = new WeakMap();
let observer = new ResizeObserver(cb);

let scope;
function updateItem(item) {
	const size = item[ 1 ];
	if (size.w === scope.w && size.h === scope.h) return;
	item[ 1 ].width = scope.w;
	item[ 1 ].height = scope.h;
	if (item[ 0 ]) item[ 0 ](item[ 1 ]);
}

function cb(entries) {
	for (let i = 0; i < entries.length; i++) {
		const entry = entries[ i ];
		const element = entry.target;
		const obj = elements.get(element);
		const w = entry.contentRect.width;
		const h = entry.contentRect.height;
		if (obj.w === w && obj.h === h) continue;
		scope = obj;
		scope.w = w;
		scope.h = h;
		obj.items.forEach(updateItem);
	}
}


export function useSize(opts = {}) {
	if (typeof opts === 'function') opts = { cb: opts };
	const cb = opts.cb;
	const el = opts.ref ?? shallowRef();
	const size = reactive({ width: 0, height: 0 });
	const item = [ cb, size ];
	let domElement = null;

	onMounted(() => {
		if (!el.value) return;
		domElement = el.value.$el ?? el.value;

		if (elements.has(domElement)) {
			const elem = elements.get(domElement);
			elem.items.add(item);
			scope = item;
			updateItem(item);
		} else {
			elements.set(domElement, { items: new Set([ item ]), w: 0, h: 0 });
			observer.observe(domElement);
		}
	});

	onBeforeUnmount(() => {
		if (!domElement) return;
		const elem = elements.get(domElement);
		elem.items.delete(item);
		if (!elem.items.size) {
			elements.delete(domElement);
			observer.unobserve(domElement);
		}
	});

	return { ref: el, size };
}
