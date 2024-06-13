import { webgl } from '#webgl/core';

export const useTheatre = (Class, id) => {
	const $project = webgl.$theatre.createProject(id);

	Class.$theatre = Class.$theatre ?? {};
	Class.$theatre[id] = $project;
	Class.$sheets = Class.$sheets ?? {};
	Class.$sheets[id] = {};

	return $project;
};
