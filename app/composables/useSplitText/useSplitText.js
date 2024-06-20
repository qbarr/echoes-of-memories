import { onMounted, onUnmounted, ref } from 'vue';

function useSplitText(
	$ref,
	{ chars = false, words = false, charsClass = '', wordsClass = '' } = {},
) {
	const $el = ref();

	let initialHTML = '';
	const wordsArray = ref([[]]);
	const charsArray = ref([[]]);
	const parser = new DOMParser();

	onMounted(() => {
		$el.value = Array.isArray($ref.value) ? $ref.value : [$ref.value];
		initialHTML = $el.value.map(($e) => $e.innerHTML);

		split();
	});

	onUnmounted(() => {
		$el.value.forEach(($e, i) => ($e.innerHTML = initialHTML[i]));
	});

	function splitWords() {
		$el.value.forEach(($e, i) => {
			const words = initialHTML[i]
				.split(' ')
				.filter((word) => word !== '')
				.map(
					(word) =>
						`<span style='display:inline-block;position:relative' class='${wordsClass}'>${word}</span>`,
				);

			if (!wordsArray.value[i]) {
				wordsArray.value[i] = [];
			}

			wordsArray.value[i] = words.map(
				(w) => parser.parseFromString(w, 'text/html').body.firstElementChild,
			);

			$e.innerHTML = words.join(' ');
		});
	}

	function splitChars() {
		$el.value.forEach(($e, j) => {
			if (words) {
				$e.innerHTML = '';
				wordsArray.value[j].forEach((word, i) => {
					const chars = word.innerText
						.split('')
						.filter((char) => char !== '')
						.map((char) =>
							char === ' '
								? ' '
								: `<span style='display:inline;position:relative' class='${charsClass}'>${char}</span>`,
						);

					word.innerHTML = chars.join('');
					if (!charsArray.value[j]) {
						charsArray.value[j] = [];
					}
					charsArray.value[j].push(
						...chars.map(
							(c) =>
								parser.parseFromString(c, 'text/html').body
									.firstElementChild,
						),
					);

					$e.appendChild(word);
					$e.innerHTML += i === wordsArray.value.length - 1 ? '' : ' ';
				});
			} else {
				const chars = initialHTML[j]
					.split('')
					.filter((char) => char !== '')
					.map((char) =>
						char === ' '
							? ' '
							: `<span style='display:inline; position:relative' class='${charsClass}'>${char}</span>`,
					);

				if (!charsArray.value[j]) {
					charsArray.value[j] = [];
				}
				charsArray.value[j] = chars.map(
					(c) => parser.parseFromString(c, 'text/html').body.firstElementChild,
				);

				$e.innerHTML = chars.join('');
			}
		});
	}

	function split() {
		revert();

		if (words) {
			splitWords();
		}

		if (chars) {
			splitChars();
		}
	}

	function revert() {
		$el.value.forEach(($e, i) => ($e.innerHTML = initialHTML[i]));
	}

	return {
		split,
		revert,
	};
}

export default useSplitText;

export { useSplitText };
