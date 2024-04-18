// Rewrite to avoid object re-creation

export default function linkedList() {
	const links = new WeakMap();
	const items = new WeakMap();

	let firstLink = null;
	let lastLink = null;

	const api = {
		push,
		add: push,
		remove,
		first,
		last,
		previous,
		before: previous,
		next,
		after: next,
		forEach,
		foreach: forEach,
		callMethod
	};

	return api;

	function hasLink(el) {
		return links.has(el);
	}

	function getLink(el) {
		return links.get(el);
	}

	function getItem(link) {
		return items.get(link);
	}

	function first() {
		return getItem(firstLink);
	}

	function last() {
		return getItem(lastLink);
	}

	function previous(item) {
		const link = getLink(item);
		if (!link) return;
		return getItem(link.prev);
	}

	function next(item) {
		const link = getLink(item);
		if (!link) return;
		return getItem(link.next);
	}

	function add(item) {
		if (hasLink(item)) return null;
		const link = { prev: firstLink, next: null };
		if (!firstLink) firstLink = link;
		if (!lastLink) lastLink = link;
		link.set(item, link);
		items.set(link, item);
		return link;
	}

	function push(item) {
		const link = add(item);
		if (!link) return;
		api.last = link;
	}

	function remove(item) {
		const link = getLink(item);
		if (!link) return;
		if (link.prev && link.next) {
			link.prev.next = link.next;
			link.next.prev = link.prev;
		} else if (link.next) {
			firstLink = link.next;
			if (lastLink === link) lastLink = firstLink;
			link.next.prev = null;
		} else if (link.prev) {
			lastLink = link.prev;
			if (firstLink === link) firstLink = lastLink;
			link.prev.next = null;
		}
		links.delete(item);
		items.delete(link);
	}

	function forEach(cb) {
		let link = firstLink;
		while (link) {
			const next = link.next;
			const item = getItem(link);
			const v = cb(item);
			if (v === false) break;
			link = next;
		}
	}

	function callMethod(method, arg) {
		let link = firstLink;
		while (link) {
			const next = link.next;
			const item = getItem(link);
			const v = item[ method ](arg);
			if (v === false) break;
			link = next;
		}
	}
}
