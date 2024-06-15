import { BaseInteractiveObject } from '../Objects/base/BaseInteractiveObject';

import { Guitare, _Photo } from '../Objects/bedroom';
import { Cassette, Door } from '../Objects/clinique';
import { TV_Table_Chair, Screen } from '../Objects/tv-room';

const datas = {
	bedroom: {
		objets: {},
		mursetsol: {},
		crucifix: { class: BaseInteractiveObject },
		platine: { class: BaseInteractiveObject },
		vinyles: { class: BaseInteractiveObject },
		photodefamille: { class: _Photo },
		testament: { class: BaseInteractiveObject },
		guitare: { class: Guitare },
		nounours: { class: BaseInteractiveObject },
		livres: { class: BaseInteractiveObject },
		peinture: { class: BaseInteractiveObject },
		couverture: { class: BaseInteractiveObject },
		posters: {},
		drowninggirl: {},
	},
	clinique: {
		pipesacrak: {},
		murs: {},
		tableaux: {},
		computers: {},
		cassette: { class: Cassette },
		contrat: { class: BaseInteractiveObject },
		ecrans: {},
		porte: { class: Door },
	},
	['tv-room']: {
		objets: { class: TV_Table_Chair },
		sol: {},
		VHS: {},
		ecran: { class: Screen },
	},
};

export { datas as scenesDatas };
