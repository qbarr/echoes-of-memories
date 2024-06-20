import { onChange, types, val } from '@theatre/core';

const NOOP = () => {};

/*

const events = [
	{
		name: 'event1',
		onTrigger: () => {
			console.log('event1');
		},
	},
	{
		name: 'TransitionIn',
		onTrigger: () => {
			console.log('TransitionIn');
		},
	},
];

*/

export class TheatreEvents {
	constructor(name, events = [], sheet) {
		this._name = name;
		this._events = events;
		this._sheet = sheet;

		const list = {};
		events.forEach((event) => {
			const { name: id } = event;
			list[id] = types.stringLiteral(
				'off',
				{ on: 'On', off: 'Off' },
				{ as: 'switch', label: id },
			);
		});

		this.$events = events.reduce((acc, event) => {
			const { name, onTrigger, onReset } = event;
			acc[name] = {
				isTriggered: false,
				onTrigger: onTrigger ?? NOOP,
				onReset: onReset ?? NOOP,
			};
			return acc;
		}, {});

		// Je suis mitigé sur cette partie, je ne sais pas si c'est une bonne idée de faire ça
		// this._unwatchPointer = onChange(sheet.sequence.pointer.position, (value) => {
		// 	console.log('sheet.sequence.pointer.position', value);
		// 	if (value === 0) {
		// 		Object.keys(this.$events).forEach((key) => {
		// 			const event = this.$events[key];
		// 			const { isTriggered, onReset } = event;
		// 			event.isTriggered = false;
		// 			onReset?.();
		// 		});
		// 	}
		// });

		const obj = sheet.object('Events', {
			events: types.compound(list),
		});
		this._object = obj;

		// this._unwatch = obj.onValuesChange(this.update.bind(this));

		sheet.register(this);

		return this;
	}

	get name() {
		return this._name;
	}
	get events() {
		return this._events;
	}
	get sheet() {
		return this._sheet;
	}
	get object() {
		return this._object;
	}

	listen(callback) {
		if (!this.object) return __DEBUG__ && console.warn('No object to listen to');
		this._unwatch = this.object.onValuesChange(this.update.bind(this));
		return this;
	}

	unlisten() {
		this._unwatch?.();
		return this;
	}

	dispose() {
		this._unwatch?.();
		// this._unwatchPointer?.();
		this._sheet.detach(this);
	}

	update({ events }) {
		const keys = Object.keys(events);
		keys.forEach((key) => {
			const event = this.$events[key];
			const value = events[key];
			const { isTriggered, onTrigger } = event;

			if (value === 'on') {
				if (!isTriggered) {
					event.isTriggered = true;
					onTrigger(value);
				}
			} else {
				event.isTriggered = false;
			}
		});
	}
}
