import path from 'path';
import fs from 'fs';

import rawManifest from '#assets/manifest.js';
import { paths } from '#config/utils/paths.js';
import { hash as createHash } from '#config/utils/hash.js';

const root = process.cwd();

const getFolder = (folder) => {
	if (!fs.existsSync(path.join(paths.assets, folder))) return null;
	return path.join(paths.assets, folder);
};

const createFolder = (folder, force = false) => {
	const _folder = path.join(paths.assets, folder);
	if (fs.existsSync(_folder) && force) fs.rm(_folder, { recursive: true });
	if (!fs.existsSync(_folder)) fs.mkdirSync(_folder);
	return _folder;
};

const getFile = (file) => {
	if (!fs.existsSync(file)) return null;
	return JSON.parse(fs.readFileSync(file, 'utf-8'));
};

const removeFolder = (folder) => {
	const _folder = path.join(paths.assets, folder);
	if (fs.existsSync(_folder)) fs.rm(_folder, { recursive: true });
};

const getFileDataFromHash = (hash, manifest) => {
	const entries = Object.entries(manifest);
	for (const [_, value] of entries) {
		const files = value.files;
		const files_entries = Object.entries(files);
		for (const [_, { filename }] of files_entries) {
			if (filename === hash) return value;
		}
	}
	return null;
};

const Parser = {
	mode: 'development', // production or development
	needCache: false,
	parseUrl: (file) => {
		if (file.url.includes('/**')) return Parser.parseDoubleStar(file);
		if (file.url.includes('/*')) return Parser.parseStar(file);
		return Parser.parseSingle(file);
	},
	parseDoubleStar: ({ url }, filter) => {
		const _filter = filter ?? Parser.getFilter(url);
		const noFilter = _filter.includes('*');

		const folder = path.join(paths.assets, url.split('/**')[0]);
		if (!fs.existsSync(folder)) return null;
		const folders = fs.readdirSync(folder);

		const files = folders
			.map((f) => fs.readdirSync(path.join(folder, f)))
			.map((f, i) => {
				return f.map((file) => {
					const [id, ext] = file.split('.');
					const subFolder = folders[i];
					const url =
						'/assets/' +
						path
							.join(folder, subFolder, file)
							.split('assets/')
							.pop();
					const filename = `${id}.${ext}`;
					return { filename, id, ext, subFolder, url };
				});
			})
			.flat()
			.filter(Boolean);

		return Parser.parseFiles(files, _filter);
	},
	parseStar: ({ url }, filter) => {
		const folder = path.join(paths.assets, url.split('*')[0]);
		if (!fs.existsSync(folder)) return null;

		const files = fs
			.readdirSync(folder)
			.map((file) => {
				const [id, ext] = file.split('.');
				const url =
					'/assets/' + path.join(folder, file).split('assets/').pop();
				const filename = `${id}.${ext}`;

				return { filename, id, ext, url };
			})
			.flat()
			.filter(Boolean);

		const _filter = filter ?? Parser.getFilter(url);
		return Parser.parseFiles(files, _filter);
	},
	parseSingle: ({ url }, filter) => {
		if (!fs.existsSync(path.join(paths.assets, url))) return null;

		const [folder, file] = url.split('/');
		const [id, ext] = file.split('.');
		const _url = '/assets/' + url;
		const filename = `${id}.${ext}`;

		const hashedId = createHash(id, Parser.needCache);
		const hashedFile = {
			id: hashedId,
			ext,
			filename: `${hashedId}.${ext}`,
			url: `/assets/.gen/${hashedId}.${ext}`,
		};

		return {
			[`${id}.${ext}`]: {
				file: { filename, id, url: _url, ext, subFolder: folder },
				hash: hashedFile,
			},
		};
	},
	parseFiles: (files, filter = ['*']) => {
		const noFilter = filter.includes('*');

		return files
			.map((file) => {
				const { id, ext, subFolder } = file;
				if (!noFilter && !filter.includes(ext)) return;

				const hashedId = createHash(id, Parser.needCache);
				const hashedFile = {
					id: hashedId,
					ext,
					filename: `${hashedId}.${ext}`,
					url: `/assets/.gen/${hashedId}.${ext}`,
				};

				return { file, hash: hashedFile };
			})
			.filter(Boolean)
			.reduce((acc, cur) => {
				const { id, ext } = cur.file;
				return { ...acc, [`${id}.${ext}`]: cur };
			}, {});
	},
	getFilter: (url) => {
		const token = url.includes('/**') ? '/**' : '/*';
		let filter = url.split(token)[1].split('.')[1];
		if (filter === undefined) return ['*'];
		filter = filter.replace(/\[|\]/g, '').split('|');
		return filter;
	},
};

export function manifestPlugin() {
	const { assets } = paths;

	const whitelist = ['--clearCache'];
	const Flags = process.argv
		.slice(2)
		.map((arg) => arg.split('='))
		.filter(([key]) => whitelist.includes(key))
		.reduce((acc, [key, _]) => ({ ...acc, [key]: true }), {});

	return {
		name: 'manifest-plugin',
		// apply: 'build',

		async configResolved(config) {
			if (Flags['--clearCache']) removeFolder('.gen');

			Parser.mode = config.mode;
			Parser.needCache = config.mode === 'production';

			const manifest = {};
			const entries = Object.entries(rawManifest);

			for (const [key, value] of entries) {
				const { url, type, opts = {} } = value;
				const files = Parser.parseUrl(value);
				Object.assign(manifest, { [key]: { files, type, opts } });
			}

			const gen_folder = getFolder('.gen') || createFolder('.gen');

			// write all the files to the .gen folder
			const files_entries = Object.entries(manifest);
			for (const [key, value] of files_entries) {
				const { files } = value;

				const files_entries = Object.entries(files);
				// prettier-ignore
				for (const [ file, { file: { url, ext }, hash: { url: hashUrl } } ] of files_entries) {
					const src = path.join(root, url);
					const hash_output = path.join(root, hashUrl);
					fs.copyFileSync(src, hash_output);
				}
			}

			// clean up the manifest
			const manifest_entries = Object.entries(manifest);
			for (const [key, value] of manifest_entries) {
				const { files } = value;
				const files_entries = Object.entries(files);
				for (const [filename, { file, hash }] of files_entries) {
					delete files[filename].file;
					files[filename] = hash;
					files[filename].origin = file;
				}
			}

			// generate a json file with the manifest data
			const output_file = path.join(gen_folder, 'manifest.json');
			fs.writeFileSync(output_file, JSON.stringify(manifest, null, 2));
		},

		async generateBundle(_, bundle) {
			// copy all the files from the .gen folder to the dist folder
			const gen_folder = getFolder('.gen');
			const dist_folder = paths.dist;
			if (!gen_folder) return;

			const files = fs.readdirSync(gen_folder);
			for (const file of files) {
				if (file === 'manifest.json') {
					const src = path.join(gen_folder, file);
					const filename = `assets/.gen/${file}`;
					// add to the bundle
					bundle[filename] = {
						name: file,
						isAsset: true,
						type: 'asset',
						fileName: filename,
						source: fs.readFileSync(src),
					};
					continue;
				}
				const manifest = getFile(`${gen_folder}/manifest.json`);
				if (!manifest) return;
				const data = getFileDataFromHash(file, manifest);
				if (!data) return;

				const files_entries = Object.entries(data.files);
				for (const [file, hashedFile] of files_entries) {
					const { filename, url } = hashedFile;
					const src = path.join(gen_folder, filename);
					const dist = path.join(dist_folder, url);

					// remove first slash
					const _url = url.slice(1);

					bundle[_url] = {
						name: filename,
						isAsset: true,
						type: 'asset',
						fileName: _url,
						source: fs.readFileSync(src),
					};
				}
			}
		},

		// resolveId(id) {
		// 	if (id === 'virtual:manifest/datas') return id;
		// },
		// load(id) {
		// 	if (id === 'virtual:manifest/datas') {
		// 		return `export default ${JSON.stringify(manifest, null, 2)};`;
		// 	}
		// },
	};
}
