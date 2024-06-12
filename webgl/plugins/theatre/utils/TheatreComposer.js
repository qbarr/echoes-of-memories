import { convertComposerDatasForTheatre } from './TheatreComposerUtils';
import { TheatreGroup } from './TheatreGroup';

const NOOP = () => {};

export class TheatreComposer extends TheatreGroup {
	constructor(name, values = [], opts = {}, sheet) {
		values = convertComposerDatasForTheatre(values);
		super(name, values, opts, sheet);
	}
}
