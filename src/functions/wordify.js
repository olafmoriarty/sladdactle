import Word from "../components/Word";
import washWord from "./washWord";

const wordify = (el, wordCounter) => {
	// Split string by punctuation
	const parsingElements = require('../data/no_parsingElements.json');
	const {punctuation} = parsingElements;
	const nonWordCharacters = new RegExp('(' + punctuation + ')');
	
	const stringArr = el.replace(/[–−]/g, '-').split(nonWordCharacters);
	return (<>{stringArr.map(arrEl => {
		if (arrEl.match(nonWordCharacters)) {
			return arrEl;
		}
		let washedWord = washWord(arrEl);
		if (washedWord) {
			if (wordCounter.current[washedWord]) {
				wordCounter.current[washedWord] = wordCounter.current[washedWord] + 1;
			}
			else {
				wordCounter.current[washedWord] = 1;
			}
		}
		return <Word washedWord={washedWord}>{arrEl}</Word>
	})}</>)
}

export default wordify;