import { BaseInteractiveObject } from '../Objects/base/BaseInteractiveObject';

import { FamilyPhoto, Guitare } from '../Objects/bedroom';
import { Crucifix } from '../Objects/bedroom/Crucifix';
import { Cassette, Contrat, Door } from '../Objects/clinique';
import { Desk, Lecteur, Screen, TV } from '../Objects/tv-room';

const datas = {
	clinique: {
		pipesacrak: {},
		murs: {},
		tableaux: {},
		computers: {},
		cassette: { class: Cassette },
		contrat: { class: Contrat },
		ecrans: {},
		porte: { class: Door },
	},
	['tv-room']: {
		desk: { class: Desk },
		sol: {},
		VHS: {},
		ecran: { class: Screen },
		tv: { class: TV },
		lecteur: { class: Lecteur },
		keyboard: {},
	},
	bedroom: {
		objets: {},
		mursetsol: {},
		crucifix: { class: Crucifix },
		platine: { class: BaseInteractiveObject },
		vinyles: { class: BaseInteractiveObject },
		photodefamille: { class: FamilyPhoto },
		testament: { class: BaseInteractiveObject },
		guitare: { class: Guitare },
		nounours: { class: BaseInteractiveObject },
		livres: { class: BaseInteractiveObject },
		peinture: { class: BaseInteractiveObject },
		couverture: { class: BaseInteractiveObject },
		posters: {},
		drowninggirl: {},
	},
};

export { datas as scenesDatas };
