import {useState} from 'react';
import GuessesTable from './GuessesTable';
import washWord from '../functions/washWord';

function GuessBox(props) {
	const {guesses, setGuesses, activeWord, setActiveWord, solved, wordCounter, nextActiveWord, checkIfSolved, gameID, setInfobox, articleFetched} = props;
	const [word, setWord] = useState('');

	// Get list of punctuation characters to not redact.
	const parsingElements = require('../data/no_parsingElements.json');
	const {commonWords, punctuation} = parsingElements;
	const nonWordCharacters = new RegExp('(' + punctuation + ')');
	
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

		setInfobox('');
		let newWord = washWord(word);

		if (newWord.match(nonWordCharacters)) {
			return;
		}

		if (!word) {
			nextActiveWord();
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
		setWord('');
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
		<GuessesTable guesses={guesses} activeWord={activeWord} setActiveWord={setActiveWord} washWord={washWord} wordCounter={wordCounter} nextActiveWord={nextActiveWord} solved={solved} />
		<nav className="main-menu">
			<ul>
				<li><button onClick={() => setInfobox('om')}>Om</button></li>
				<li><button onClick={() => setInfobox('historikk')}>Historikk</button></li>
				<li><button onClick={() => setInfobox('personvern')}>Personvern</button></li>
			</ul>
		</nav>
		</section>
	)
}
export default GuessBox;