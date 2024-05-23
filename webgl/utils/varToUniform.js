import { capitalize } from '#utils/str';

export const varToUniform = (name, value) => {
	const uName = `u${capitalize(name)}`;
	return { [uName]: { value } };
}

export const varsToUniforms = (vars) => {
	const uniforms = {};

	const entries = Object.entries(vars);
	for (let i = 0; i < entries.length; i++) {
		const [name, value] = entries[i];
		Object.assign(uniforms, varToUniform(name, value));
	}

	return uniforms;
}
