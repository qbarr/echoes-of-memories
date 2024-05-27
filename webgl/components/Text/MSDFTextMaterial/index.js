import { BackSide, ShaderMaterial } from 'three';

import { webgl } from '#webgl/core';
import { deepCopy } from '#webgl/utils/deepCopy';
import uniforms from './uniforms';

import fs from './fragment.frag?hotshader';
import vs from './vertex.vert?hotshader';


const defaultOptions = {
    side: BackSide,
    transparent: true,
    defines: {
        IS_SMALL: false,
		...webgl.defines
    },
    extensions: {
        derivatives: true,
    },
    uniforms: {
        ...uniforms.common,
        ...uniforms.rendering,
        ...uniforms.stroke,
		...webgl.uniforms
    },
};



export { defaultOptions, uniforms };

export default class MSDFTextMaterial extends ShaderMaterial {
	constructor(opts = {}) {
		const dOptions = deepCopy(defaultOptions);
		opts = Object.assign(opts, {
			uniforms: { ...dOptions.uniforms, ...opts.uniforms },
			defines: { ...dOptions.defines, ...opts.defines },
			extensions: { ...dOptions.extensions, ...opts.extensions },
			side: opts.side ?? dOptions.side,
			transparent: opts.transparent ?? dOptions.transparent,
		});

		super(opts);

		vs.use(this)
		fs.use(this)
	}
}
