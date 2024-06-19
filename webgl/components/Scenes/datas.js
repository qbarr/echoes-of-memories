import { BaseInteractiveObject } from '../Objects/base/BaseInteractiveObject';

import {
	Collier,
	FamilyPhoto,
	Guitare,
	Lettre,
	Livres,
	Platine,
	Vinyles,
	Nounours,
	Peinture,
	Couverture,
} from '../Objects/bedroom';

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
		crucifix: { class: Collier, isSpecial: true },
		platine: { class: Platine },
		vinyles: { class: Vinyles },
		photodefamille: { class: FamilyPhoto, isSpecial: true },
		testament: { class: Lettre, isSpecial: true },
		guitare: { class: Guitare },
		nounours: { class: Nounours },
		livres: { class: Livres },
		peinture: { class: Peinture },
		couverture: { class: Couverture },
		posters: {},
		drowninggirl: {},
	},
};

export { datas as scenesDatas };
