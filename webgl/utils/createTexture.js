import { webgl } from '#webgl/core';
import {
	AlphaFormat,
	LuminanceFormat,
	NearestFilter,
	RedFormat,
	RepeatWrapping,
	Texture,
	SRGBColorSpace,
	NoColorSpace,
	LinearFilter
} from 'three';

export default function createTexture(opts) {
	const isWebGL2 = webgl.$threeRenderer.capabilities.isWebGL2;

	const tex = new Texture(opts.img);

	if (opts.flipY !== undefined) tex.flipY = opts.flipY;
	if (opts.mipmaps !== undefined) tex.generateMipmaps = opts.mipmaps ?? true;

	if (opts.red) opts.format = isWebGL2 ? RedFormat : LuminanceFormat;
	if (opts.alpha) opts.format = AlphaFormat;

	if (opts.nearest) tex.magFilter = tex.minFilter = NearestFilter;
	if (opts.linear) tex.magFilter = tex.minFilter = LinearFilter;
	if (opts.magFilter) tex.magFilter = opts.magFilter;
	if (opts.minFilter) tex.minFilter = opts.minFilter;

	if (opts.encoding) tex.encoding = opts.encoding;
	if (opts.colorSpace) tex.encoding = opts.colorSpace;

	if (opts.data) opts.srgb = false;
	if (opts.srgb === true) tex.colorSpace = SRGBColorSpace;
	else if (opts.srgb === false || opts.data) tex.colorSpace = NoColorSpace;

	if (opts.mapping) tex.mapping = opts.mapping;
	if (opts.premultiplyAlpha) tex.premultiplyAlpha = true;

	if (opts.repeat) {
		tex.wrapS = RepeatWrapping;
		tex.wrapT = RepeatWrapping;
	} else {
		if (opts.wrapS) tex.wrapS = opts.wrapS;
		if (opts.wrapT) tex.wrapT = opts.wrapT;
	}

	if (opts.format) tex.format = opts.format;
	if (opts.type) tex.type = opts.type;

	tex.needsUpdate = true;

	// console.log(opts.id);
	return tex;
}
