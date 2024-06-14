import path from 'path';
import fs, { promises as fsPromises } from 'fs';

import vttToJson from 'vtt-to-json';

import { generate } from 'generate-subtitles';

import { sources } from '#assets/subtitles/sources.js';

const root = process.cwd();

const _AUDIOS_PATH = path.join(root, '/assets/audios/vocals');
const _EXPORT_PATH = path.join(root, '/assets/subtitles/export');
const _VTT_EXPORT_OPTION = {
	outputDir: _EXPORT_PATH,
	inputType: 'audio',
	whisperFlags: {
		subFormat: 'vtt',
		model: 'base',
		language: 'french',
	},
};

// const _ARGS = process.argv;
// const _ALLOWED_FLAGS = ["--force-subtitles"];

export function subtitlesPlugin() {
	return {
		name: 'subtitles-plugin',

		async configResolved() {
			console.log('[Subtitles plugin] Initialized');

			const _SOURCES = sources.filter(($) => {
				const sub = path.join(
					_EXPORT_PATH,
					`/${$.name.split(' ').join('_').toLowerCase()}.json`,
				);
				return !fs.existsSync(sub);
			});

			if (!_SOURCES.length) {
				console.log('[Subtitles plugin] All subtitles already exist!');
				return;
			}

			await Promise.all(
				_SOURCES.map(async ($) => {
					console.log(`[Subtitles plugin] Creating ${$.name}.json...`);

					const audio = path.join(_AUDIOS_PATH, `/${$.name}.wav`);

					try {
						// creating .VTT file
						await generate({ ..._VTT_EXPORT_OPTION, inputFile: audio });

						const vtt = fs.readFileSync(
							path.join(_EXPORT_PATH, `/${$.name}.vtt`),
							{ encoding: 'utf-8' },
						);
						const json = await vttToJson(vtt);

						// removing words from JSON conversion
						for (const _ of json) {
							delete _.words;
						}

						// creating .JSON file
						await fsPromises.writeFile(
							path.join(_EXPORT_PATH, `/${$.name}.json`),
							JSON.stringify(json),
						);

						// removing .VTT file
						await fsPromises.unlink(
							path.join(_EXPORT_PATH, `/${$.name}.vtt`),
						);

						console.log(`[Subtitles plugin] ${$.name}.json file generated`);
					} catch (e) {
						console.error(
							`[Subtitles plugin] ${$.name}.json file generation failed`,
							e,
						);
					}
				}),
			);
		},
	};
}
