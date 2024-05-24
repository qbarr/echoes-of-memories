export function subtitlesPlugin(app, opts = {}) {
	const api = {
		resize,

		update,
	};

	/// #if __DEBUG__
	function devTools() {
		const $gui = app.$app.$gui;

		console.log("[Subtitles plugin] DevTools", app);

		const gui = $gui.addFolder({ title: "Subtitles" });
	}
	/// #endif

	function resize() {}

	function update() {
		console.log("[Subtitles plugin] Update");
	}

	return {
		install: (app) => {
			console.log("[Subtitles plugin] Install", app);
		},
		load: () => {
			console.log("[Subtitles plugin] Load");

			__DEBUG__ && devTools();
		},
	};
}
