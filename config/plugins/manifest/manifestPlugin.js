import path from 'path';
import fs from 'fs';

import rawManifest from '#assets/manifest.js';
import { paths } from '#config/utils/paths.js';

const root = process.cwd();

export function manifestPlugin() {
	const fileId = 'manifest.json';
	const dummy = {
		file_id: {
			files: {
				'sub_file_id.ext': [
					'generated_files_folder/id OR hashed_id.ext',
				],
			},
			type: 'ext',
		},
	};

	// generate a json file with the manifest data

	// check if .gen/ folder exists
	// if (!fs.existsSync(path.join(paths.assets, '.gen')))
	// 	fs.mkdirSync(path.join(paths.assets, '.gen'));
	// const genFolder = path.join(paths.assets, '.gen');
	// const outputFile = path.join(genFolder, fileId);
	// fs.writeFileSync(outputFile, JSON.stringify(dummy, null, 2));

	// export manifest json file as a virtual module

	return {
		name: 'manifest-plugin',
		// apply: 'build',

		async generateBundle(_options, bundle) {
			await Promise.all(
				Object.entries(rawManifest).map(async ([key, value]) => {
					if (key.includes('sprites') || key.includes('msdf')) {
						const { url: img, data } = value;

						const [atlasFileName, atlasExt] = img
							.split('/')
							.pop()
							.split('.');
						const [jsonFileName, jsonExt] = data
							.split('/')
							.pop()
							.split('.');

						const atlasSubFolder = img
							.split('/assets/')
							.pop()
							.split('/')
							.shift();
						const jsonSubFolder = data
							.split('/assets/')
							.pop()
							.split('/')
							.shift();

						const atlasSrc = fs.readFileSync(path.join(root, img));
						const jsonSrc = fs.readFileSync(path.join(root, data));

						bundle[
							`assets/${atlasSubFolder}/${atlasFileName}.${atlasExt}`
						] = {
							name: `${atlasFileName}.${atlasExt}`,
							isAsset: true,
							type: 'asset',
							fileName: `assets/${atlasSubFolder}/${atlasFileName}.${atlasExt}`,
							source: atlasSrc,
						};

						bundle[
							`assets/${jsonSubFolder}/${jsonFileName}.${jsonExt}`
						] = {
							name: `${jsonFileName}.${jsonExt}`,
							isAsset: true,
							type: 'asset',
							fileName: `assets/${jsonSubFolder}/${jsonFileName}.${jsonExt}`,
							source: jsonSrc,
						};

						return;
					}

					const { url } = value;
					const [id, ext] = url.split('/').pop().split('.');
					const subFolder = url
						.split('/assets/')
						.pop()
						.split('/')
						.shift();

					const src = fs.readFileSync(path.join(root, url));

					bundle[`assets/${subFolder}/${id}.${ext}`] = {
						name: `${id}.${ext}`,
						isAsset: true,
						type: 'asset',
						fileName: `assets/${subFolder}/${id}.${ext}`,
						source: src,
					};
				}),
			);
		},

		// load: virtualModules.load,
		// resolveId: virtualModules.resolveId,
	};
}
