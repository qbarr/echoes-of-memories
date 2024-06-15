import { BaseInteractiveObject } from '../Objects/base/BaseInteractiveObject';

import { Guitare } from '../Objects/bedroom';
import { Cassette, Door } from '../Objects/clinique';

const datas = {
	bedroom: {
		objets: {},
		mursetsol: {},
		crucifix: { class: BaseInteractiveObject },
		platine: { class: BaseInteractiveObject },
		vinyles: { class: BaseInteractiveObject },
		photodefamille: { class: BaseInteractiveObject },
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
};

export { datas as scenesDatas };
