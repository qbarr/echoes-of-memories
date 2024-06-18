import { getWebGL } from '#webgl/core';
import {
	LinearFilter,
	RGBAFormat,
	SRGBColorSpace,
	WebGLRenderTarget
} from 'three';

// Small helper to easily create render buffers
// They will be register to fbo debugger if available
// And you can use a resolution params
// To update the size of the buffer when the drawing buffer size change
let webgl;
let defaultNameIndex = 1;

// Create a render buffer
export default function createBuffer({
	format = RGBAFormat,
	name,
	depth = true,
	stencil = null,
	width,
	height,
	scale = 1,
	srgb = false,
	colorSpace = SRGBColorSpace,
	generateMipmaps = false,
	manualResize = false,
	...opts
} = {}) {
	if (!webgl) webgl = getWebGL();
	const dbs = webgl.$renderer.drawingBufferSize;

	if (name == null) name = `RenderTarget.${defaultNameIndex++}`;

	let isResizing = false;
	let isListeningDbs = false;
	const needListenResize = !manualResize;
	let rt;

	if (width && height) setSize(width, height);
	if (!width || !height) setScale(scale);

	if (srgb) colorSpace = SRGBColorSpace;

	console.log('>>>>>>', colorSpace);

	rt = new WebGLRenderTarget(width, height, {
		minFilter: LinearFilter,
		magFilter: LinearFilter,
		format: format,
		colorSpace,
		depthBuffer: !!depth || !!opts?.depthBuffer,
		stencilBuffer: !!(stencil ?? depth),
	});

	rt.texture.generateMipmaps = !!generateMipmaps;

	// Modify setSize method to implement resolution params
	const ogSetSize = rt.setSize.bind(rt);
	rt.setSize = setSize;
	rt.setScale = setScale;
	if (needListenResize) webgl.$hooks.afterSetup.watchOnce(listenResize);

	// Modify dispose to unlisten to dbs changes and unregister from fbo debugger
	const ogDispose = rt.dispose.bind(rt);
	rt.dispose = dispose;

	// Automatically register RT to fbo debugger
	rt.texture.name = name;
	// if (__DEBUG__) webgl.$fbo?.registerBuffer?.(name, rt);

	// Disable clone
	rt.clone = clone;

	function clone() {
		if (__DEBUG__) return;
		console.warn('clone() is disabled for RTs created with createBuffer()');
	}

	function setSize(w = 0, h = 0) {
		if (!h) h = w;
		if (w <= 0) return;
		width = w;
		height = h;
		unlistenResize();
		if (rt) updateSize();
	}

	function setScale(s = 0) {
		if (s <= 0) return;
		scale = s;
		listenResize();
		onResize();
	}

	function listenResize() {
		if (!needListenResize) return;
		if (isListeningDbs) return;
		isListeningDbs = true;
		dbs.watchImmediate(onResize);
	}

	function unlistenResize() {
		if (!isListeningDbs) return;
		isListeningDbs = false;
		dbs.unwatch(onResize);
	}

	function updateSize() {
		if (rt.texture.width === width && rt.texture.height === height) return;
		isResizing = true;
		ogSetSize(width, height);
		isResizing = false;
	}

	function onResize() {
		width = Math.floor(dbs.value.x * scale);
		height = Math.floor(dbs.value.y * scale);
		if (rt) updateSize();
	}

	function dispose() {
		ogDispose();
		if (isResizing) return;
		unlistenResize();
		if (__DEBUG__) webgl.$fbo?.unregisterBuffer?.(rt);
	}

	return rt;
}
