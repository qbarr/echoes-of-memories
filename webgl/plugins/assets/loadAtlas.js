import { BufferGeometry, Float32BufferAttribute } from 'three';

function createFrameData(source, meta, name, frameIndex = 0) {
	const size = meta.size;
	const scale = meta.scale;


	const data = {};

	const anchor = source.anchor || source.pivot || { x: 0.5, y: 0.5 };

	const type = name.split('_')[ 0 ];
	const offsetAnchor = (type === 'hint');

	// correct offset
	if (offsetAnchor) {
		anchor.x = 0;
		anchor.y = 0;
	}

	const texFrame = source.frame;
	const spriteSize = source.sourceSize;
	const spriteFrame = source.spriteSourceSize;

	data.id = name;
	const splitted = name.split('/');
	data.sequence = splitted.pop();
	data.group = splitted.join('/');
	data.frameIndex = frameIndex;

	data.texCoords = new Float32Array([
		texFrame.x / size.w,
		(size.h - texFrame.y - texFrame.h) / size.h,
		texFrame.w / size.w,
		texFrame.h / size.h
	]);

	data.meshCoords = new Float32Array([
		(spriteFrame.w * 0.5 + spriteFrame.x) - spriteSize.w * anchor.x,
		-((spriteFrame.h * 0.5 + spriteFrame.y) - spriteSize.h * anchor.y),
		spriteFrame.w,
		spriteFrame.h
	]);



	for (let i = 0, l = data.meshCoords.length; i < l; i++)
		data.meshCoords[ i ] *= scale;

	data.anchor = anchor;
	data.sourceSize = source.sourceSize;
	data.spriteSourceSize = source.spriteSourceSize;

	if (source.vertices) {
		data.vertices = source.vertices;
		data.verticesUV = source.verticesUV;
		data.triangles = source.triangles;

		data.geo = createGeometry({ frame: texFrame, size, ...data });
	}

	return data;
}


export default function loadAtlas(json, opts = {}) {
	const data = { sprites: {}, meta: json.meta };
	const frames = json.frames;
	const keepRatio = opts.keepRatio == undefined ? true : opts.keepRatio;

	if (!json.animations) json.animations = {};
	for (const k in json.animations) {
		// debugger;
		const anim = json.animations[ k ];
		const sprites = data.sprites[ k ] = [];
		for (let i = 0, l = anim.length; i < l; i++) {
			const frame = frames[ anim[ i ] ];
			frame.keepRatio = keepRatio;
			delete frames[ anim[ i ] ];
			sprites.push(createFrameData(frame, json.meta, k, i));
		}
	}

	for (const k in frames) {
		const frame = frames[ k ];
		frame.keepRatio = keepRatio;
		const name = frame.filename ? frame.filename.toString() : k;
		const newName = name.replace(/[^a-zA-Z0-9-_-]/g, '').replace('png', '');
		const sprites = data.sprites[ newName ] = [];
		delete frames[ k ];

		sprites.push(createFrameData(frame, json.meta, newName, 0));
	}

	return data;
}


function createGeometry(data) {
	const baseGeometry = new BufferGeometry();
	const { vertices, verticesUV, triangles, frame, spriteSourceSize, texCoords, size } = data;
	const anchor = data.anchor || data.pivot || { x: 0.5, y: 0.5 };

	const positions = [];
	const indices = [];
	const normals = [];
	const uvs = [];

	const ratioW =
		spriteSourceSize.w > spriteSourceSize.h ? spriteSourceSize.w / spriteSourceSize.h : 1;
	const ratioH =
		spriteSourceSize.h > spriteSourceSize.w ? spriteSourceSize.h / spriteSourceSize.w : 1;

	for (let i = 0; i < vertices.length; i += 1) {
		let [ x, y ] = vertices[ i ];

		x -= (spriteSourceSize.x + spriteSourceSize.w * anchor.x);
		y -= (spriteSourceSize.y + spriteSourceSize.h * anchor.y);

		x = x / spriteSourceSize.w;
		y = 1 - y / spriteSourceSize.h;

		x *= ratioW;
		y *= ratioH;


		positions.push(x, y, 0);
		normals.push(0, 0, 1);
	}

	for (let i = 0; i < verticesUV.length; i += 1) {
		let [ u, v ] = verticesUV[ i ];

		u = u / size.w;
		v = 1 - v / size.h;

		uvs.push(u, v);
	}

	for (let i = 0; i < triangles.length; i += 1) {
		const [ a, b, c ] = triangles[ i ];
		indices.push(a, c, b);
	}

	baseGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	baseGeometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
	baseGeometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
	baseGeometry.setIndex(indices);

	return baseGeometry;
}
