export function timestampPlugin() {
	return {
		name: 'get-timestamp-plugin',

		config(c) {
			const now = new Date();
			const day = now.getDate().toString().padStart(2, '0');
			const month = (now.getMonth() + 1).toString().padStart(2, '0');
			const year = now.getFullYear().toString();
			const hour = now.getHours().toString().padStart(2, '0');
			const min = now.getMinutes().toString().padStart(2, '0');
			const sec = now.getSeconds().toString().padStart(2, '0');
			const timestamp = year + month + day + '-' + hour + min + sec;

			Object.assign(c.define, {
				__PROJECT_TIMESTAMP__: JSON.stringify(timestamp),
			});

			return c;
		}
	};
}
