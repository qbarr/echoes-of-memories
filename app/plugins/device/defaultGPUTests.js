export default {
	'ultra': [
		[ 'not-mobile', 'ge', 'geforce gtx', 1050 ],
		[ 'is', 'radeon vii' ],
		[ 'ge', 'radeon rx vega', 64 ],
		[ 'is', 'geforce titan' ],
		[ 'ge', 'radeon rx', 5000 ],
		[ 'is', 'apple m' ],
		[ 'ge', 'apple a', 12, 100 ],
		[ 'ge', 'apple a', 13 ]
	],

	'veryhigh': [
		[ 'is', 'geforce rtx' ],
		[ 'is', 'quadro gtx' ],
		[ 'ge', 'apple a', 12 ],
		[ 'mobile', 'ge', 'geforce gtx', 780 ],
		[ 'not-mobile', 'ge', 'geforce gtx', 680 ],
		[ 'ge', 'quadro p', 400 ],
		[ 'is', 'radeon r10' ],
		[ 'is', 'radeon r9' ],
		[ 'ge', 'radeon r7', 370 ],
		[ 'ge', 'radeon rx', 570 ],
		[ 'ge', 'radeon rx vega', 56 ],
	],

	'high': [
		[ 'is', 'geforce gtx' ],
		[ 'ge', 'geforce mx', 250 ],
		[ 'ge', 'radeon pro', 450 ],
		[ 'not-mobile', 'ge', 'radeon hd', 5570 ],
		[ 'ge', 'adreno', 418 ],
		[ 'ge', 'apple a', 11 ],
		[ 'ge', 'mali g', 71 ],
		[ 'ge', 'mali t', 760, 8 ],
		[ 'ge', 'mali t', 880 ],
	],

	'medium': [
		[ 'brand', 'nvidia' ],
		[ 'brand', 'amd' ],
		[ 'brand', 'apple' ],
		[ 'is', 'intel iris plus' ],
		[ 'is', 'intel iris pro' ],
		[ 'ge', 'intel hd', 630 ],
		[ 'le', 'intel hd', 2000 ],
		[ 'ge', 'adreno', 430 ],
		[ 'is', 'mali g' ],
		[ 'ge', 'mali t', 800, 2 ],
		[ 'ge', 'mali t', 860 ],
	]
};


