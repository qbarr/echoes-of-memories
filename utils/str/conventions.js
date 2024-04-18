function pascalCaseToKebabCase(str) {
	return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function kebabCaseToCamelCase(str) {
	return str.replace(/-([a-z])/g, (g) => g[ 1 ].toUpperCase());
}

function pascalCaseToCamelCase(str) {
	return str.charAt(0).toLowerCase() + str.slice(1);
}

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export {
	pascalCaseToKebabCase,
	kebabCaseToCamelCase,
	pascalCaseToCamelCase,
	capitalize
};
