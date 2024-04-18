let domEl;

export default function createRuller({
	root
} = {}) {
	if (!root) root = document.documentElement;
	domEl = document.createElement('div');
	Object.assign(domEl.style, {
		position: 'fixed',
		top: 0,
		left: 0,
		width: '200px',
		height: '10px',
		overflowY: 'scroll',
		pointerEvents: 'none',
		userSelect: 'none',
		zIndex: -1,
		opacity: 0
	});

	function measureScrollbarWidth() {
		const child = document.createElement('div');
		const prev = { width: '1px', height: '100%', overflowY: 'hidden' };
		Object.assign(domEl.style, { width: '200px', height: '10px', overflowY: 'scroll' });
		Object.assign(child.style, { width: '100%', height: '150%' });
		domEl.appendChild(child);
		document.body.appendChild(domEl);
		const zoom = parseFloat(getComputedStyle(root).zoom);
		const demult = (isNaN(zoom) ? 1 : zoom);
		const scrollbarWidth = Math.round((200 - domEl.clientWidth) * demult);
		root.style.setProperty(
			'--scrollbar-width',
			scrollbarWidth + 'px'
		);
		document.body.removeChild(domEl);
		domEl.removeChild(child);
		Object.assign(domEl.style, prev);
		return scrollbarWidth;
	}

	function measureViewportHeight() {
		document.body.appendChild(domEl);
		const rullerBounds = domEl.getBoundingClientRect();
		const height = rullerBounds.height;
		document.body.removeChild(domEl);
		root.style.setProperty('--inner-height', window.innerHeight + 'px');
		root.style.setProperty('--vp-height', height + 'px');
		return height;
	}

	return { measureScrollbarWidth, measureViewportHeight };
}
