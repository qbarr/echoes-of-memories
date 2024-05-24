
export function audioPlugin(app, opts = {}) {
	const api = {
		// play,
		// stop,
		// pause,
		// resume,
		// volume,
		// mute,
		// unmute,
	};

	return {
		install: (app) => {
			console.log("[Audio plugin] Install", app);
		},
		load: () => {
			console.log("[Audio plugin] Load");
		},
	};
}
