export function patchThreeRenderer(renderer) {
	// Patch render lists to add force opaque support
	const renderLists = renderer.renderLists;
	if (renderLists._patched) return;
	renderLists._patched = true;
	const OGRenderListGet = renderLists.get;
	renderLists.get = function (scene, renderCallDepth) {
		const list = OGRenderListGet(scene, renderCallDepth);
		if (!list._patched) patchRenderList(list);
		return list;
	};
}

// Path renderlist to add forceOpaque flag to materials
function patchRenderList(list) {
	list._patched = true;
	const OGPush = list.push;
	const OGUnshift = list.unshift;

	list.push = function push(object, geometry, material, groupOrder, z, group) {
		const forceOpaque = material.transparent && material.userData.forceOpaque;
		if (forceOpaque) material.transparent = false;
		OGPush(object, geometry, material, groupOrder, z, group);
		if (forceOpaque) material.transparent = true;
	};

	list.unshift = function push(object, geometry, material, groupOrder, z, group) {
		const forceOpaque = material.transparent && material.userData.forceOpaque;
		if (forceOpaque) material.transparent = false;
		OGUnshift(object, geometry, material, groupOrder, z, group);
		if (forceOpaque) material.transparent = true;
	};
}
