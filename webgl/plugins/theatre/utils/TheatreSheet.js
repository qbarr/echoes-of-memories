import { clamp } from '#utils/maths/map.js';
import { TheatreBool } from './TheatreBool';
import { TheatreComposer } from './TheatreComposer';
import { TheatreFloat } from './TheatreFloat';
import { TheatreGroup } from './TheatreGroup';
import { TheatreObject } from './TheatreObject';
import { TheatreTarget } from './TheatreTarget';
import { TheatreVec2 } from './TheatreVec2';
import { TheatreVec3 } from './TheatreVec3';

const NOOP = () => {};

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
		this._id = id;
		this._project = project;
		this._objects = new Map();
		this._instance = project.sheet(id, hash(`id-${uid++}`));

		console.log(this._instance);

		this.$float = (name, value, opts = {}) => new TheatreFloat(name, value, opts, this); // prettier-ignore
		this.$bool = (name, value, opts = {}) => new TheatreBool(name, value, opts, this);
		this.$vec2 = (name, value, opts = {}) => new TheatreVec2(name, value, opts, this);
		this.$vec3 = (name, value, opts = {}) => new TheatreVec3(name, value, opts, this);
		this.$object = (name, value, opts = {}) => new TheatreObject(name, value, opts, this); // prettier-ignore
		this.$target = (name, value, opts = {}) => new TheatreTarget(name, value, opts, this); // prettier-ignore
		this.$group = (name, value, opts = {}) => new TheatreGroup(name, value, opts, this); // prettier-ignore
		this.$composer = (value, opts = {}) => new TheatreComposer('composer', value, opts, this); // prettier-ignore

		// Just to make it easier to use
		this.object = this._instance.object.bind(this._instance);

		__DEBUG__ && this.devtools();

		return this;
	}

	get id() {
		return this._id;
	}
	get project() {
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

	async _attachAudioBuffer({ audioBuffer, audioContext, destinationNode } = {}) {
		await this.sequence.attachAudio({
			source: audioBuffer,
			audioContext,
			destinationNode,
		});
	}

	async attachAudio(source, volume = 1) {
		if (typeof source === 'string') {
			return this._attachAudioSource(source, volume);
		} else {
			return this._attachAudioBuffer(source);
		}
	}

	play(args = {}) {
		return this.sequence.play(args);
	}

	pause() {
		this.sequence.pause();
	}

	stop() {
		this.pause();
		this.seek(0);
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

	detach(Object) {
		const { name } = Object;
		this.instance.detachObject(name);
		this._objects.delete(name);
	}

	dispose(Object) {
		Object.dispose();
	}

	disposeAll() {
		this._objects.forEach((Object) => Object.dispose());
		this._objects.clear();
	}

	/// #if __DEBUG__
	devtools() {
		const projectGui = this.project.$gui;
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
