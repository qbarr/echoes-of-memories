export function scenesPlugin(webgl) {
	const api = {}

	return {
		install: () => {
			webgl.$scenes = api;
		},
		load: () => {}
	}
}
