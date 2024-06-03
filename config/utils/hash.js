import md5 from 'md5';

const truncate = (str, len) => str.slice(0, len);

export const hash = (str, avoidCache = false) => {
	if (avoidCache) str += performance.now().toString();
	return truncate(md5(str), 10);
};
