import { computed } from 'vue';

export default function debugBreakpoints(app) {
	// If no viewport plugin available, abort breakpoint debugger creation
	if (!app.$viewport || !app.$gui) return;

	// Gather breakpoints from the `debug-breakpoints` CSS custom property
	const bps = (getComputedStyle(document.documentElement)
		.getPropertyValue('--project-debug-breakpoints') ?? '')
		.split('|')
		.reduce((acc, bp) => {
			const [ n, v ] = bp.split('=');
			if (n.length > 1 && v.length > 1) acc.push([ n, parseFloat(v) ]);
			return acc;
		}, [])
		.sort((a, b) => a[ 1 ] - b[ 1 ]);

	// If no breakpoints are defined, abort breakpoint debugger creation
	if (!bps.length) return;

	const dimensions = computed(() => {
		const { width, height } = app.$viewport;
		return `${ ~~width }px x ${ ~~height }px`;
	});

	const breakpoint = computed(() => {
		const width = app.$viewport.width;
		for (let i = 0; i < bps.length; i++) {
			const bp = bps[ i ];
			if (width < bp[ 1 ]) {
				return i === 0
					? `< ${ bp[ 0 ] }`
					: `[${ bps[ i - 1 ][ 0 ] } - ${ bp[ 0 ] }]`;
			}
		}
		return `>= ${ bps[ bps.length - 1 ][ 0 ] }`;
	});

	// Maximize chance to be on top of other GUI elements
	// By delaying the breakpoint debugger creation
	requestAnimationFrame(() => {
		const gui = app.$gui.app.addFolder({ title: 'CSS Breakpoints', index: 0 });
		gui.addBinding(dimensions, 'value', { label: 'Dimensions', readonly: true });
		gui.addBinding(breakpoint, 'value', { label: 'Breakpoint', readonly: true });
	});
}
