async function enter() {
	this.log('enter');
}
async function leave() {
	this.log('leave');
}
function update() {
	this.log('update');
}

export default { enter, leave, update };
