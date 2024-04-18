function createFrameData(source, meta, name, frameIndex = 0) {
	const size = meta.size;
	const scale = (1 / meta.scale) / 100;

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
	data.vertices = source.vertices;
	data.verticesUV = source.verticesUV;
	data.triangles = source.triangles;

	return data;
}

export default function loadAtlas(json) {
	const data = { sprites: {}, meta: json.meta };
	const frames = json.frames;

	if (!json.animations) json.animations = {};
	for (const k in json.animations) {
		// debugger;
		const anim = json.animations[ k ];
		const sprites = data.sprites[ k ] = [];
		for (let i = 0, l = anim.length; i < l; i++) {
			const frame = frames[ anim[ i ] ];
			delete frames[ anim[ i ] ];
			sprites.push(createFrameData(frame, json.meta, k, i));
		}
	}

	for (const k in frames) {
		const frame = frames[ k ];
		const name = frame.filename ? frame.filename.toString() : k;
		const newName = name.replace(/[^a-zA-Z0-9-_-]/g, '').replace('png', '');
		const sprites = data.sprites[ newName ] = [];
		delete frames[ k ];

		// console.log( newName );
		sprites.push(createFrameData(frame, json.meta, newName));
	}

	return data;
}
