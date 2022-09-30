import {useState, useEffect} from 'react';
import GuessesTable from './GuessesTable';
import washWord from '../functions/washWord';

function GuessBox(props) {
	const {guesses, setGuesses, activeWord, setActiveWord, solved, wordCounter, nextActiveWord, checkIfSolved, gameID, setInfobox, articleFetched, titleWordsNotFound} = props;
	const [word, setWord] = useState('');
	const [showHintButton, setShowHintButton] = useState(false);

	// Get list of punctuation characters to not redact.
	const parsingElements = require('../data/no_parsingElements.json');
	const {commonWords, punctuation} = parsingElements;
	const nonWordCharacters = new RegExp('(' + punctuation + ')');

	useEffect(() => {
		setShowHintButton(false);
	}, [articleFetched]);

	const guessWord = w => {
		setInfobox('');
		let newWord = washWord(w);

		if (newWord.match(nonWordCharacters)) {
			return;
		}

		if (newWord && !guesses.includes(newWord) && !commonWords.includes(newWord)) {
			const newGuesses = [...guesses, newWord];
			setGuesses(newGuesses);
			localStorage.setItem('guesses', JSON.stringify({gameID: gameID, guesses: newGuesses}));
			setActiveWord(newWord);
			checkIfSolved(newWord);
		}

		if (guesses.includes(newWord)) {
			setActiveWord(newWord);
		}
	}
	
	const submitGuess = (ev) => {
		ev.preventDefault();

		// Secret password to turn on admin mode
		if (word === 'Skvatarausi rykkja rova') {
			if (localStorage.getItem('admin')) {
				localStorage.removeItem('admin');
				window.location.reload();
				return;
			}
			localStorage.setItem('admin', '1');
			window.location.reload();
			return;
		}

		if (word === '???') {
			setShowHintButton(true);
			setWord('');
			return;
		}

		if (!word) {
			nextActiveWord();
			return;
		}

		guessWord(word);
		setWord('');
	}

	const getHint = () => {
		console.log(wordCounter);
		let hintArray = [...Object.keys(wordCounter).filter(el => !commonWords.includes(el) && !el.match(/^[\d]+$/) && !guesses.includes(el) && !titleWordsNotFound.includes(el))];
		hintArray.sort((a, b) => wordCounter[a] - wordCounter[b]);
		if (hintArray.length) {
			guessWord(hintArray[Math.floor(Math.random() * 50) % hintArray.length]);
		}
	}

	return (
		<section className="guess-box">
		{!solved && articleFetched ? <form className="guess-form" onSubmit={ev => submitGuess(ev)}>
			<button type="button" className="guess-form-up" onClick={(ev => {
				document.body.scrollTop = 0; // For Safari
				document.documentElement.scrollTop = 0;
			})}>↑</button>
			<input type="text" name="word" value={word} onChange={(ev) => setWord(ev.target.value)} className="guess-form-input" autoComplete='off' id="guess-input" />
			<button className="guess-form-submit" type="submit">Gjett</button>
		</form> : false}
		{showHintButton || guesses.length >= 50 ? <p className="hint-button"><button onClick={() => getHint()}>Vis tilfeldig ord</button></p> : false}

		<GuessesTable guesses={guesses} activeWord={activeWord} setActiveWord={setActiveWord} washWord={washWord} wordCounter={wordCounter} nextActiveWord={nextActiveWord} solved={solved} />
		<nav className="main-menu">
			<ul>
				<li><button onClick={() => setInfobox('om')}>Om</button></li>
				<li><button onClick={() => setInfobox('historikk')}>Alle oppgaver</button></li>
				<li><button onClick={() => setInfobox('personvern')}>Personvern</button></li>
			</ul>
		</nav>
		</section>
	)
}
export default GuessBox;