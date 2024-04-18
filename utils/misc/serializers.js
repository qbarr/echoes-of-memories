// Barebones serializers for different types of data
// Mainly used with localStorage load / save

export const serializers = {
	select: (value, { storage, type, serializer, unserializer } = {}) => {
		const list = serializers.list;
		type = type ?? typeof value;
		if (value instanceof Date) type = 'date';
		else if (!(type in list)) type = 'any';

		// Idb Storage doesnt need serialization
		// so we can use any type by default
		if (storage?.isIdbStorage && type == null) type = 'any';

		const defSerializer = list[ type ];
		let serialize = serializer ?? defSerializer.serialize;
		let unserialize = unserializer ?? defSerializer.unserialize;

		return { serialize, unserialize };
	},
	list: {
		any: {
			unserialize: v => v,
			serialize: v => v
		},
		boolean: {
			unserialize: v => !!+v,
			serialize: v => +!!v
		},
		number: {
			unserialize: (v, d = 0) => isNaN(+v) ? d : +v,
			serialize: (v, d = 0) => isNaN(+v) ? d : +v
		},
		string: {
			unserialize: (v, d = '') => v ?? d,
			serialize: (v, d) => v ?? d
		},
		date: {
			unserialize: (v, d) => new Date(v ?? d),
			serialize: (v, d) => (v ?? d ?? new Date()).toISOString()
		},
		object: {
			unserialize: (v, d = {}) => {
				try { return JSON.parse(v) } // eslint-disable-line
				catch (e) { return d }
			},
			serialize: (v, d = '{}') => {
				try { return JSON.stringify(v) } // eslint-disable-line
				catch (e) { return JSON.stringify(d) }
			}
		}
	}
};
