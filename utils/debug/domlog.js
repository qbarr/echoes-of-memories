/*

domlog
v1.1.0
––––––
Create a logger on top of your website.
Can be useful to debug android from mac or webviews

*/

const fixeds = new Map();
let wrapper;
let domlog = () => {};


if (typeof __DEBUG__ !== 'undefined' && __DEBUG__) {
	domlog = function domlog(
		text = '',
		delay = 2500,
		fg = 'white',
		bg = 'rgba( 0, 0, 0, 0.5 )',
		fixed = 0
	) {
		if (typeof USE_DOM_LOG === 'boolean' && !USE_DOM_LOG) return;

		let fixedObj;
		let line;
		let timeout;

		if (fixed && fixeds.has(fixed)) {
			fixedObj = fixeds.get(fixed);
			window.clearTimeout(fixedObj.timeout);
			fixedObj.line.textContent = text;
		}

		if (!fixedObj) {
			if (!wrapper) wrapper = createWrapper();
			line = createLine(text, fg, bg);
		}

		if (delay > 0) timeout = window.setTimeout(() => {
			if (fixedObj) fixeds.delete(fixed)
			line.style.opacity = 0;
			line.style.transform = 'translate(-100%, 15px)';
			line.style.marginTop = '-15px';
			window.setTimeout(() => line.parentNode.removeChild(line), 180);
		}, delay);

		if (fixed) {
			if (fixedObj) fixedObj.timeout = timeout;
			else fixeds.set(fixed, { line, timeout });
		}
	};
}

export { domlog };

function createWrapper() {
	const el = document.createElement('div');
	document.body.appendChild(el);
	el.style.cssText = `
		z-index: 10000;
		position: fixed;
		display: flex;
		flex-flow: column nowrap;
		align-items: flex-start;
		justify-content: flex-start;
		top: 20px;
		left: 0;
		margin: 0;
		padding: 0;
		pointer-events: none;
		overflow: hidden;
	`;
	return el;
}

function createLine(text, fg, bg) {
	const ln = document.createElement('div');
	ln.style.cssText = `
		background: ${ bg };
		color: ${ fg };
		font-family: monospace;
		font-size: 10px;
		margin: 3px 3px 0 3px;
		padding: 1px 5px 4px;
		border-radius: 4px;
		word-break: break-all;
		max-width: 80vw;
		overflow: hidden;
		transform: translateX(-40px);
		white-space: pre-wrap;
		opacity: 0;
		transition: opacity 150ms, transform 150ms ease-in-out, margin-top 160ms;
	`;

	if (Array.isArray(text)) {
		text = text.map(v => (v + '')).join(' ');
	}

	ln.textContent = text;
	// wrapper.firstChild ?
	// 	wrapper.insertBefore( ln, wrapper.firstChild )
	// 	: wrapper.appendChild( ln );

	wrapper.appendChild(ln);

	ln.getBoundingClientRect();
	ln.style.opacity = 1;
	ln.style.transform = 'translateX(0)';

	return ln;
}
