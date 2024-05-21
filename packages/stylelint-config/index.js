// const kebabCase = type => [
// 	'^([a-z][a-z0-9]*)(-[a-z0-9]+)*$',
// 	{ message: `Expected ${ type } to be kebab-case` },
// ];

const HTML_EXTS = [
	'.html',
	'.ejs',
	'.hbs',
];

export default {

	'ignoreFiles': [
		'node_modules/**',
		// Common build folders
		'dist/**',
		'build/**',
		'.cache/build/**'
		'.cache/dist/**'
	],

	'extends': [
		'@stylistic/stylelint-config',
		'stylelint-config-standard-scss',
		'stylelint-config-recommended-vue/scss',
		'stylelint-config-recess-order',
	],

	'overrides': [
		{
			'files': HTML_EXTS.flatMap(ext => [ '*' + ext, '**/*' + ext ]),
			'customSyntax': 'postcss-html'
		},
	],

	'plugins': [
		'@stylistic/stylelint-plugin'
	],

	'rules': {
		'at-rule-empty-line-before': [
			'always',
			{
				except: [
					'blockless-after-blockless',
					'first-nested',
				],
				ignore: [
					'after-comment',
					'inside-block'
				],
				ignoreAtRules: [
					'else',
					'include'
				],
			},
		],

		'declaration-empty-line-before': null,

		'@stylistic/indentation': [ 'tab',
			{
				'baseIndentLevel': 1
			}
		],

		'function-no-unknown': null,

		// TODO Re-enable these rules progressively
		'scss/dollar-variable-pattern': null, // kebabCase('variable'),
		'scss/percent-placeholder-pattern': null, // kebabCase('placeholder'),
		'scss/at-function-pattern': null, // kebabCase('function name'),
		'scss/at-import-partial-extension': null,
		'scss/at-mixin-pattern': null, // kebabCase('mixin name'),
		'custom-media-pattern': null, // kebabCase('custom property name'),
		'custom-property-pattern': null, // kebabCase('keyframe name'),

		// Disabled because it can be annoying with big calcs
		'scss/operator-no-newline-before': null,

		// Disabled - too restrictive if we need to monkey-patch existing style props
		'keyframes-name-pattern': null, // kebabCase('keyframe name'),
		'selector-class-pattern': null, // kebabCase('class selector'),
		'selector-id-pattern': null, // kebabCase('id selector'),

		// Usefull for list of definitions
		'declaration-block-single-line-max-declarations': 3,

		// Avoid auto swap to inset
		'declaration-block-no-redundant-longhand-properties': [
			true,
			{ 'ignoreShorthands': [ 'inset' ] }
		],

		// Disabled - conflict with scss objects
		'value-keyword-case': null, // 'lower',

		// Disabled - can cause conflict with scss fn call inside color native fn
		'color-function-notation': null,

		// Disabled FOR NOW - cause problems into existing projects
		'no-invalid-position-at-import-rule': null,

		// Disable FOR NOW- cause problems into existing projects
		'no-descending-specificity': null,

		'no-duplicate-selectors': null,

		'order/order': [
			'custom-properties',
			'dollar-variables',
			'declarations',
			'rules'
		],

		// Allow vendor-prefixes for edgecases(like -webkit-box)
		'value-no-vendor-prefix': null
	}
};

