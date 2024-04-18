import path from 'path';
import fs from 'fs';

import manifest from '#assets/manifest.js';


const root = process.cwd();

export function manifestPlugin() {
	return {
		name: 'manifest-plugin',
		apply: 'build',

		async generateBundle(_options, bundle) {
			await Promise.all(Object.entries(manifest)
				.map(async ([ key, value ]) => {
					if (key.includes('sprites')) {
						const { atlas, json } = value;

						const [ atlasFileName, atlasExt ] = atlas.split('/').pop().split('.');
						const [ jsonFileName, jsonExt ] = json.split('/').pop().split('.');

						const atlasSubFolder = atlas.split('/assets/').pop().split('/').shift();
						const jsonSubFolder = json.split('/assets/').pop().split('/').shift();

						const atlasSrc = fs.readFileSync(path.join(root, atlas));
						const jsonSrc = fs.readFileSync(path.join(root, json));

						bundle[ `assets/${ atlasSubFolder }/${ atlasFileName }.${ atlasExt }` ] = {
							name: `${ atlasFileName }.${ atlasExt }`,
							isAsset: true,
							type: 'asset',
							fileName: `assets/${ atlasSubFolder }/${ atlasFileName }.${ atlasExt }`,
							source: atlasSrc
						};

						bundle[ `assets/${ jsonSubFolder }/${ jsonFileName }.${ jsonExt }` ] = {
							name: `${ jsonFileName }.${ jsonExt }`,
							isAsset: true,
							type: 'asset',
							fileName: `assets/${ jsonSubFolder }/${ jsonFileName }.${ jsonExt }`,
							source: jsonSrc
						};

						return;
					}

					const { url } = value;
					const [ id, ext ] = url.split('/').pop().split('.');
					const subFolder = url.split('/assets/').pop().split('/').shift();

					const src = fs.readFileSync(path.join(root, url));

					bundle[ `assets/${ subFolder }/${ id }.${ ext }` ] = {
						name: `${ id }.${ ext }`,
						isAsset: true,
						type: 'asset',
						fileName: `assets/${ subFolder }/${ id }.${ ext }`,
						source: src
					};
				})
			);
		}
	};
}
