import { Color } from 'three';
import { app } from './core';
import { reactive } from 'vue';

export default () => {
	const store = reactive({
		// isPaused: true,
		isPaused: false,
		pointerLocked: false,
		hasInteractedOnce: false,
		isReadingInstructions: false,
		GAME_OVER: false,
		hasSeenNecklaceFlashback: false,

		subtitles: {
			colors: {
				white: new Color(0xffffff),
				yellow: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
			},
		},

		letterContent: [
			`Cher Ben,<br>`,
			`Si tu lis cette lettre, ça signifie que je ne suis plus à tes côtés.`,
			`Je sais que ça doit être incroyablement difficile pour toi,`,
			`et je suis désolé de te laisser seul dans ce monde chaotique.`,
			`Mais il y a des choses que je dois te dire,`,
			`des choses que je n'ai jamais eu le courage de prononcer à voix haute.`,
			`Depuis notre première rencontre, tu as été bien plus qu'un camarade pour moi.`,
			`J'ai toujours admiré ta force et ta résilience,`,
			`même dans les moments les plus sombres.<br>`,

			`Je t'aime, Ben.<br>`,

			`Je n'ai jamais eu le courage de te le dire en face, mais c'est la vérité.`,
			`Tu es la personne la plus importante de ma vie,`,
			`et je veux que tu saches que tu as toujours été aimé,`,
			`même dans les moments où tu te sentais le plus seul.`,
			`Je te demande de continuer à te battre,`,
			`de continuer à vivre pour nous deux.`,

			`Honore notre amour en vivant ta vie pleinement,`,
			`en trouvant la paix et le bonheur que tu mérites.`,
			`N'oublie jamais que je serai toujours avec toi,`,
			`dans chaque pas que tu feras,`,
			`dans chaque décision que tu prendras.<br>`,

			`Prends soin de toi, mon amour.<br>`,
			`Adam.`,
		],
	});

	// Some props can only be added once the app is fully started
	// You can use this function for that
	// app.$onBeforeMount(() => {});

	return store;
};
