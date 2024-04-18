export default function addBindingShortcuts(handler) {
	handler.addGrid = addGrid.bind(handler);
	handler.addAction = addAction.bind(handler);
	handler.addSeparator = addSeparator.bind(handler);
	handler.addOptions = addOptions.bind(handler);
	handler.addMonitor = addMonitor.bind(handler);
}

function addGrid(maxPerRow, ...grid) {
	if (typeof maxPerRow === 'number' && grid.length === 1) {
		const newGrid = [];
		for (let i = 0; i < grid[ 0 ].length; i += maxPerRow) {
			newGrid.push(grid[ 0 ].slice(i, i + maxPerRow));
		}
		grid = newGrid;
	} else {
		grid.unshift(maxPerRow);
	}
	const maxCols = grid.reduce((p, c) => Math.max(p, c.length), 0);
	this.addBlade({
		view: 'buttongrid',
		size: [ maxCols, grid.length ],
		cells: (x, y) => ({ title: grid[ y ][ x ]?.[ 0 ] ?? '-', })
	}).on('click', e => {
		grid[ e.index[ 1 ] ][ e.index[ 0 ] ]?.[ 1 ]?.();
	});
}

function addAction(title = 'button', fn) {
	if (typeof title === 'function') {
		fn = title;
		title = title.name ?? 'button';
	}
	this.addButton({ title }).on('click', fn);
}

function addSeparator() {
	this.addBlade({ view: 'separator' });
}

function addOptions(ctx, key, options, opts = {}) {
	this.addBinding(ctx, key, { ...opts, options });
}

function addMonitor(ctx, key, opts = {}) {
	this.addBinding(ctx, key, { ...opts, readonly: true });
}
