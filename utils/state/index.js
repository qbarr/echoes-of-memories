/*

state
v3.0.0
––––––
Signal-based minimal state manager
Changelog:
- 2.0.0
	- Change .subscribe to .watch
	- Change .unsubscribe to .unwatch
	- Change .dispatch to .emit
*/

import { signal, unwatchSignal } from './signal.js';
import { writable } from './signalWritable.js';
import { computed } from './signalComputed.js';
import { storageSync } from './signalExtStorageSync.js';
import freezer from './signalFreezer.js';

import { eventEmitter } from './emitter.js';

const events = eventEmitter();
const store = {};
const { holdEmits, releaseEmits, batchUpdates } = freezer;

export {
	unwatchSignal,

	// Event emitter
	eventEmitter,
	eventEmitter as ee,
	events,

	// Signal
	signal,
	signal as s,
	holdEmits,
	releaseEmits,
	batchUpdates,

	// Store
	writable,
	writable as w,
	computed,
	computed as c,

	// Store extensions
	storageSync,

	store,
};
