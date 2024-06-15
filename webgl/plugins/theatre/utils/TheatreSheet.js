import { w } from '#utils/state/index.js';
import { onChange } from '@theatre/core';

import { TheatreBool } from './TheatreBool';
import { TheatreComposer } from './TheatreComposer';
import { TheatreCompound } from './TheatreCompound';
import { TheatreEvents } from './TheatreEvents';
import { TheatreFloat } from './TheatreFloat';
import { TheatreGroup } from './TheatreGroup';
import { TheatreObject } from './TheatreObject';
import { TheatreTarget } from './TheatreTarget';
import { TheatreVec2 } from './TheatreVec2';
import { TheatreVec3 } from './TheatreVec3';
import { TheatreList } from './TheatreList';

const NOOP = () => {};
const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

let uid = 0;
const hash = (str) => {
	let hash = 0;
	if (str.length === 0) return hash;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0;
	}
	return hash.toString(16);
};

export class TheatreSheet {
	constructor(id, { project }) {
		this.$webgl = project.$webgl;
		this.$app = project.$app;

		this._id = id;
		this._project = project;
		this._objects = new Map();
		this._instance = project.sheet(id, hash(`id-${uid++}`));
		this._symbol = Symbol(id);
		this._progress = w(0);
		this._active = false;
		this._hasBeenCanceled = false;

		this._duration = 0;
		this._hasSubtitles = false;

		// Just to make it easier to use
		this.object = this._instance.object.bind(this._instance);

		this.$float = (name, value, opts = {}) => new TheatreFloat(name, value, opts, this); // prettier-ignore
		this.$bool = (name, value, opts = {}) => new TheatreBool(name, value, opts, this);
		this.$vec2 = (name, value, opts = {}) => new TheatreVec2(name, value, opts, this);
		this.$vec3 = (name, value, opts = {}) => new TheatreVec3(name, value, opts, this);
		this.$object = (name, value, opts = {}) => new TheatreObject(name, value, opts, this); // prettier-ignore
		this.$target = (name, value, opts = {}) => new TheatreTarget(name, value, opts, this); // prettier-ignore
		this.$group = (name, value, opts = {}) => new TheatreGroup(name, value, opts, this); // prettier-ignore
		this.$composer = (values, opts = {}) => new TheatreComposer('Composer', values, opts, this); // prettier-ignore
		this.$compound = (name, values, opts = {}) => new TheatreCompound(name, values, opts, this); // prettier-ignore
		this.$events = (events) => new TheatreEvents('Events', events, this); // prettier-ignore
		this.$list = (name, values, opts = {}) => new TheatreList(name, values, opts, this); // prettier-ignore

		onChange(this.sequence.pointer.length, (len) => {
			this._duration = len * 1000;
		});
		onChange(this.sequence.pointer.position, (pos) => {
			const time = pos * 1000;
			this._progress.set(time / this._duration);
			// this.updateSubtitles(pos);
			// this._subtitles?.updateBySheetProgress({ time });
		});

		__DEBUG__ && this.devtools();

		project.registerSheet(this);

		return this;
	}

	get id() {
		return this._id;
	}
	get $project() {
		return this._project;
	}
	get objects() {
		return this._objects;
	}
	get instance() {
		return this._instance;
	}
	get sheet() {
		return this._instance;
	}
	get sequence() {
		return this._instance.sequence;
	}
	get position() {
		return this.sequence.position;
	}
	get duration() {
		return this._duration;
	}
	get progress() {
		return this._progress.value;
	}
	get isActive() {
		return this._active;
	}

	// skip() {

	// }

	async _attachAudioSource(source, volume = 1) {
		// Can be a path to the file or an AudioBuffer
		const audioGraph = await this.sequence.attachAudio({ source });

		const audioContext = audioGraph.audioContext;
		const sequenceGain = audioGraph.gainNode;

		sequenceGain.disconnect();
		const loweredGain = audioContext.createGain();
		loweredGain.gain.setValueAtTime(volume, audioContext.currentTime);
		sequenceGain.connect(loweredGain);
		loweredGain.connect(audioContext.destination);
	}

	async _attachAudioBuffer({ buffer, context, destination } = {}) {
		const destinationNode = destination || context.destination;
		await this.sequence.attachAudio({
			source: buffer,
			audioContext: context,
			destinationNode,
		});
	}

	async attachAudio(source, volume = 1) {
		if (typeof source === 'string') {
			// Check if it's a path to the file
			// Or if it's the id of the audio
			if (source.includes('.')) {
				return this._attachAudioSource(source, volume);
			} else {
				const id = source.split('/').pop();
				let subID = source.split('/').shift();
				if (subID === id) subID = null;
				const { audios } = this.$webgl.$assets;
				const audio = subID ? audios[subID][id] : audios[id];
				return this.attachAudio(audio);
			}
		} else {
			if (source.subtitles) {
				this.$list('subtitles', source.subtitles.content).onChange((subtitle) =>
					this.$webgl.$subtitles.currentPart.set(subtitle),
				);
				this._hasSubtitles = true;
				// this._subtitles = source.subtitles;
				// this._subtitles.onChange = (subtitle) => {
				// 	this.$webgl.$subtitles.currentPart.set(subtitle?.content);
				// };
			}

			source = source.audio ?? source;

			return this._attachAudioBuffer(source);
		}
	}

	// registerSubtitles(subtitles) {
	// 	this._subtitles = deepCopy(subtitles);
	// 	this._lastSubtitle = null;
	// 	this._subtitlesRange = [subtitles[0].start, subtitles[subtitles.length - 1].end];
	// }

	// updateSubtitles(time) {
	// 	const subtitles = this._subtitles;
	// 	if (subtitles.length === 0) return;

	// 	if (this._subtitlesRange[0] > time || this._subtitlesRange[1] < time) {
	// 		this._lastSubtitle = null;
	// 		this.$webgl.$subtitles.currentPart.set(null);
	// 		return;
	// 	}

	// 	for (let i = 0; i < subtitles.length; i++) {
	// 		const subtitle = subtitles[i];
	// 		if (this._lastSubtitle?.end >= time) continue;
	// 		if (this._lastSubtitle?.end < time && time < subtitle.start) {
	// 			this._lastSubtitle = null;
	// 			this.$webgl.$subtitles.currentPart.set(null);
	// 		}
	// 		if (this._lastSubtitle === subtitle) continue;
	// 		if (time >= subtitle.start && time <= subtitle.end) {
	// 			// console.log('subtitle', subtitle.content);
	// 			this._lastSubtitle = subtitle;
	// 			this.$webgl.$subtitles.currentPart.set(subtitle.content);
	// 		}
	// 	}
	// }

	setActive(bool) {
		console.log('setActive', this.id, bool);
		this._active = bool;
		bool ? this.listen() : this.unlisten();
	}

	listen() {
		this.objects.forEach((Object) => Object.listen());
	}

	unlisten() {
		this.objects.forEach((Object) => Object.unlisten());

		if (this._hasSubtitles) this.$webgl.$subtitles.currentPart.set(null);
	}

	play(args = {}) {
		this._hasBeenCanceled = false;
		const done = this.sequence.play(args);
		done.then(() => this.unlisten());
		this.listen();
		return done;
	}

	pause() {
		this.sequence.pause();
	}

	stop() {
		this.pause();
		this.seek(0);
		this.unlisten();

		if (this.progress < 1) {
			this._hasBeenCanceled = true;
		}
	}

	seek(time) {
		this.sequence.position = time;
	}

	normSeek(normTime) {
		// normTime = clamp(normTime, 0, 1);
		// const time = this.sequence.duration * normTime;
		// this.sequence.normPosition = time;
	}

	register(Object) {
		const id = Object.name;
		this._objects.set(id, Object);
		return Object;
	}

	getObject(id) {
		return this._objects.get(id);
	}

	detach({ name }) {
		this.instance.detachObject(name);
		// this._objects.delete(name);
	}

	disposeObject(Object) {
		Object.dispose();
	}

	disposeAll() {
		this._objects.forEach(this.disposeObject);
		this._objects.clear();
	}

	/// #if __DEBUG__
	devtools() {
		const projectGui = this.$project.$gui;
		const sheetGui = projectGui.addFolder({ title: this.id });
		sheetGui.addGrid(2, [
			['Play', this.play.bind(this)],
			['Pause', this.pause.bind(this)],
			['Stop', this.stop.bind(this)],
			['Reset', () => this.seek(0)],
		]);
	}
	/// #endif
}
