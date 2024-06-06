import { Color, Texture, Vector2, Vector3, Vector4 } from 'three';

export const uniform = (value) => {
	let type = null;

	if (typeof value === 'number') {
		if (Number.isInteger(value)) type = 'i';
		else type = 'f';
	}
	if (value instanceof Vector2) type = 'v2';
	if (value instanceof Vector3) type = 'v3';
	if (value instanceof Vector4) type = 'v4';
	if (value instanceof Color) type = 'c';
	if (value instanceof Texture) type = 't';

	return { value, type };
};
