export const getFlags = (whitelist = []) => {
	return process.argv
		.slice(2)
		.map((arg) => arg.split('='))
		.filter(([key]) => whitelist.includes(key))
		.reduce((acc, [key, _]) => ({ ...acc, [key]: true }), {});
};
