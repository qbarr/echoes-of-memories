export const getDeathRanges = (name, index) => {
	if (index === 0) return getDeathRangesScene1(name)
	else if (index === 1) return getDeathRangesScene2(name)
	else if (index === 2) return getDeathRangesScene3(name)
};

const getDeathRangesScene1 = (name) => {
	switch (name) {
		case 'background':
			return 0.2;
		case 'chaise':
			return 0.4;
		case 'sol':
			return 0.4;
		case 'table':
			return 0.6;
		case 'parents':
			return 0.8;
		case 'ben':
			return 1;
	}
}

const getDeathRangesScene2 = (name) => {
	switch (name) {
		case 'rocks':
			return 0.2;
		case 'ground':
			return 0.4;
		case 'wheels':
			return 0.4;
		case 'truck':
			return 0.6;
		case 'characters':
			return 1;
	}
}

const getDeathRangesScene3 = (name) => {
	switch (name) {
		case 'rocks':
			return 0.2;
		case 'ground':
			return 0.4;
		case 'wheels':
			return 0.4;
		case 'truck':
			return 0.6;
		case 'characters':
			return 1;
	}
}

