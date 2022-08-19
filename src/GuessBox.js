import {useState} from 'react';
import GuessesTable from './GuessesTable';

function GuessBox(props) {
	const {guesses, setGuesses, activeWord, setActiveWord, washWord, solved, wordCounter, nextActiveWord, nonWordCharacters, commonWords, checkIfSolved, gameID, setInfobox} = props;
	const [word, setWord] = useState('');

	const submitGuess = (ev) => {
		ev.preventDefault();
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
		{!solved ? <form className="guess-form" onSubmit={ev => submitGuess(ev)}>
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