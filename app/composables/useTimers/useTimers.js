import { getCurrentInstance, onUnmounted } from 'vue';
import { raftimer } from '#utils/raf';

const rafTimerDefaults = {
	autostart: true,
	standalone: true,
	selfdestruct: true,
};

export function useTimers() {
	const timers = [];
	const intervals = [];

	if (getCurrentInstance()) onUnmounted(clearTimers);
	return { setTimeout, setInterval, wait, timer, clearTimers };

	function setTimeout(cb, delay) {
		const timeout = window.setTimeout(cb, delay);
		timers.push(timeout);
		return timeout;
	}

	function setInterval(cb, delay) {
		const interval = window.setInterval(cb, delay);
		intervals.push(interval);
		return interval;
	}

	function timer(delay, cb, useRaf) {
		if (useRaf) {
			const timer = raftimer(delay, cb, rafTimerDefaults);
			timers.push(timer);
			return timer;
		} else {
			const timeout = setTimeout(cb, delay);
			timers.push(timeout);
			return timeout;
		}
	}

	function wait(delay, useRaf) {
		return new Promise((resolve) => timer(delay, resolve, useRaf));
	}

	function clearTimers() {
		for (let i = 0, l = timers.length; i < l; i++) {
			const timer = timers[i];
			if (timer.dispose) timer.dispose();
			else clearTimeout(timer);
		}
		for (let i = 0, l = intervals.length; i < l; i++) {
			clearInterval(intervals[i]);
		}
		intervals.length = 0;
		timers.length = 0;
	}
}
