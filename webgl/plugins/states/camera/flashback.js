async function enter({ machine }) {
	this.log('enter');
}
function update() {
	this.log('update');
}
async function leave({ machine }) {
	this.log('leave');
}

export default { enter, leave, update };
