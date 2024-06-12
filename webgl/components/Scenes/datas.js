import { Guitare } from '../Objects/Guitare';
import { BaseInteractiveObject } from '../Objects/base/BaseInteractiveObject';

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
		posters: { class: null },
		drowninggirl: { class: null },
	},
	clinique: {
		pipesacrak: {},
		murs: {},
		tableaux: {},
		computers: {},
		cassette: { class: BaseInteractiveObject },
		contrat: { class: BaseInteractiveObject },
		ecrans: {},
		porte: { class: BaseInteractiveObject },
	},
};

export { datas as scenesDatas };
