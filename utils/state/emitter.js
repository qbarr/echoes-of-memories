function Events() {}
Events.prototype = Object.create(null);

function EventListener(fn, context, once) {
	this.fn = fn;
	this.context = context;
	this.once = !!once;
}

function addListener(emitter, eventName, fn, context, once) {
	/// #if __DEBUG__
	/// #code if (typeof fn !== 'function') {
	/// #code	throw new TypeError('The listener must be a function');
	/// #code }
	/// #endif
	const listener = new EventListener(fn, context, once);
	const events = emitter.events;
	/// #if __DEBUG__
	/// #code EventEmitter.listenerCount++;
	/// #endif
	if (!events[ eventName ]) events[ eventName ] = [ listener ];
	else events[ eventName ].push(listener);
}

function clearEvent(emitter, eventName) {
	const events = emitter.events;
	const event = events[ eventName ];
	if (event) {
		/// #if __DEBUG__
		/// #code EventEmitter.listenerCount -= events.length;
		/// #endif
		events[ eventName ] = [];
	}
}

class EventEmitter {
	constructor() {
		this.events = new Events();
	}

	emit(eventName, arg) {
		const listeners = this.events[ eventName ];
		if (!listeners) return;
		for (let i = 0, len = listeners.length; i < len; i++) {
			const listener = listeners[ i ];
			if (listener.once) this.off(eventName, listener.fn, listener.context);
			listener.fn.call(listener.context, arg);
		}
	}

	on(eventName, callback, context) {
		return addListener(this, eventName, callback, context, false);
	}

	once(eventName, callback, context) {
		return addListener(this, eventName, callback, context, true);
	}

	off(eventName, callback, context) {
		const listeners = this.events[ eventName ];
		if (!listeners) return;

		// Remove all listeners for this event
		if (!callback) return clearEvent(this, eventName);

		// Filter out all listeners that should be removed
		let i = listeners.length;
		let aliveListeners = [];
		while (i--) {
			const listener = listeners[ i ];
			if (listener.fn !== callback || listener.context !== context) {
				aliveListeners.push(listener);
			}
			/// #if __DEBUG__
			/// #code else { EventEmitter.listenerCount--; }
			/// #endif
		}
		this.events[ eventName ] = aliveListeners;
	}

	clear(eventName = null) {
		if (eventName == null) {
			/// #if __DEBUG__
			/// #code for (const key in this.events) {
			/// #code 	EventEmitter.listenerCount -= this.events[ key ].length;
			/// #code }
			/// #endif
			this.events = new Events();
		} else {
			clearEvent(this, eventName);
		}
	}
}

/// #if __DEBUG__
/// #code EventEmitter.listenerCount = 0;
/// #endif

export function eventEmitter() { return new EventEmitter() }
