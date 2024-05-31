import md5 from 'md5';

const truncate = (str, len) => str.slice(0, len);
String.prototype.truncate = function (len) {
	return truncate(this, len);
};

export const hash = (str, avoidCache = false) => {
	if (avoidCache) str += performance.now().toString();
	return md5(str).truncate(10);
};
