// Used to create a unique request function that can then be used to cancel
// Example:
// const request = uniqueRequest();
// async function myAsyncRequest() {
// 	const isCancel = request();
// 	await doSomething();
// 	if (isCancel()) return;
// }

export function uniqueRequest() {
	let lastUID = 0;
	return () => {
		const currentUID = lastUID = (lastUID + 1) | 0;
		return () => currentUID !== lastUID;
	};
}
