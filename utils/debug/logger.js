/*

logger
v1.0.0
––––––
All-purpose fancy console logger

*/

let logger;
const noop = () => {};
const noopObj = { log: noop, warn: noop, error: noop };

if (typeof __DEBUG__ !== 'undefined' && __DEBUG__) {
	logger = function logger(prefix, color, background, mute) {
		if (mute) return noopObj;

		const pre = [];
		prefix = prefix.toUpperCase();

		pre.push('%c%s');
		let style = 'font-weight:bold; line-height: 1.2em;';
		if (color) style += `color:${ color };`;
		if (background) style += `background-color:${ background };`;
		style += 'border-radius: 4px;padding: 1px 6px 0;';
		pre.push(style);
		pre.push(prefix);
		pre.push('\n');

		return {
			info: console.debug.bind(console, ...pre), // eslint-disable-line
			debug: console.debug.bind(console, ...pre), // eslint-disable-line
			log: console.log.bind(console, ...pre), // eslint-disable-line
			warn: console.warn.bind(console, ...pre),
			error: console.error.bind(console, ...pre)
		};
	};
} else {
	logger = function logger() { return noopObj };
}

const createLogger = logger;
export { logger, createLogger };
