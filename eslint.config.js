import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';

const config = [
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	...pluginVue.configs['flat/recommended'],
];

export default config;
