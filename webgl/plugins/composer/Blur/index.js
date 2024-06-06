export const useBlurPass = (composer, { iterations = 3 } = {}) => {
	const sk = 'webgl:composer:Blur:';
	const strength = storageSync(sk + 'strength', w(defaultParams.strength));
	const radius = storageSync(sk + 'radius', w(defaultParams.radius));
	const enabled = w(true);

	const { buffers, filters, uniforms, defines } = composer;

	let blurTexture = DUMMY_RT.texture;

	const api = {
		strength,
		radius,

		get texture() {
			return blurTexture;
		},

		// resize,
		// render,
		/// #if __DEBUG__
		devtools,
		/// #endif
	};
	composer.$blur = api;

	/// #if __DEBUG__
	function devtools() {}
	/// #endif

	return api;
};
