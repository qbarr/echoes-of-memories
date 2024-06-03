import { defineConfig, splitVendorChunkPlugin } from 'vite';

import vue from '@vitejs/plugin-vue';
import { ifdefRollupPlugin } from './plugins/ifdef/ifdefRollupPlugin';
import { manifestPlugin } from './plugins/manifest/manifestPlugin';
import { hotShadersRollupPlugin } from './plugins/hotShaders/hotShadersRollupPlugin';
import { timestampPlugin } from './plugins/timestamp/timestampPlugin';

import { paths } from './utils/paths';

export default ({ mode = 'development' }) => {
	const isDevelopment = mode === 'development';
	const isProduction = mode === 'production';
	const isStaging = mode === 'staging';

	const MANDATORY_DEFINES = {
		__ENVIRONMENT__: JSON.stringify(mode),
		__DEVELOPMENT__: isDevelopment,
		__PRODUCTION__: isProduction,
		__STAGING__: isStaging,
		__DEBUG__: isDevelopment,
	};

	return defineConfig({
		root: paths.appRoot,

		base: '/',
		publicDir: paths.public,
		cacheDir: paths.cache,

		server: {
			port: 8085,
			https: false,
			open: false,
			host: true,
			hmr: { port: 8085 },
			watch: { usePolling: true },
		},

		plugins: [
			vue(),
			ifdefRollupPlugin(MANDATORY_DEFINES),
			splitVendorChunkPlugin(),
			hotShadersRollupPlugin(isDevelopment),
			timestampPlugin(),
			manifestPlugin(),
		],

		define: MANDATORY_DEFINES,
		assetsInclude: /\.(bin|gtlf|glb|ktx|m4a|mp3|aac|obj|draco)$/,
		resolve: {
			//   alias: pathsAliases,
			extensions: ['.cjs', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.vue'],
		},

		build: {
			target: 'esnext',
			outDir: paths.dist,
			assetsDir: 'assets',
			emptyOutDir: true,
			sourcemap: isDevelopment,
			minify: isProduction,

			rollupOptions: {
				output: {
					entryFileNames: '[name].js',
					chunkFileNames: '[name].js',
					assetFileNames: 'assets/[name].[ext]',
					sourcemap: isDevelopment,

					format: 'es',
					dir: paths.dist,
				},

				// external: [],
				// plugins: [],
			},
		},
	});
};
