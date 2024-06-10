import { webgl } from '#webgl/core/index.js';

export const useTheatre = (Class, datas) => {
	const { $theatre } = webgl;

	if (typeof datas === 'string') {
		datas = { id: datas };
	}

	const $project = $theatre.createProject(datas);
	const $tl = (id) => {
		const sheet = $project.sheet(id);
		Object.defineProperty(sheet, 'add', {
			value: sheet.object,
			writable: false,
			configurable: false,
			enumerable: false,
		});
		return sheet;
	};

	Object.assign(Class, {
		$project,

		$tl,
		$createTimeline: $tl,
	});

	return { $project, $tl };
};
