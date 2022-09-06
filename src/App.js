import { useState, useEffect, useRef, createContext } from 'react';
import './App.css';

import ArticleBody from './components/ArticleBody';
import GuessBox from './components/GuessBox';
import InfoBox from './components/InfoBox';

import getGameID from './functions/getGameID';
import getTitleFromID from './functions/getTitleFromID';
import washWord from './functions/washWord';
import wordify from './functions/wordify';

export const GuessesContext = createContext([]);

function App() {

	// Create an object to hold word counts. Must be placed in a ref so that I can edit it during parsing
	const wordCounter = useRef({});

	// STATES:

	// What is this game's ID and title?
	const [gameID, setGameID] = useState(0);
	const [title, setTitle] = useState(0);

	// What is the title with <Word> tags added?
	const [wordifiedTitle, setWordifiedTitle] = useState(0);

	// Has the game been loaded?
	const [articleFetched, setArticleFetched] = useState();

	// Which words has the player guessed so far?
	const [guesses, setGuesses] = useState([]);

	// Is the game currently solved?
	const [solved, setSolved] = useState();

	// What is the currently selected word?
	const [activeWord, setActiveWord] = useState();
	const [activeWordElements, setActiveWordElements] = useState(false);
	const [activeWordIndex, setActiveWordIndex] = useState(false);

	// Which page, if any, should be shown in the info box?
	const [infobox, setInfobox] = useState('');

	// Which words in the title are yet to be found? (When this array is empty, the player wins!)
	const [titleWordsNotFound, setTitleWordsNotFound] = useState([]);

	// Get list of common words and punctuation characters to not redact.
	const parsingElements = require('./data/no_parsingElements.json');
	const {commonWords, punctuation} = parsingElements;
	const nonWordCharactersNoParanthesis = new RegExp(punctuation);

	useEffect(() => {
		const id = getGameID();
		setGameID(id);
	}, []);

	useEffect(() => {
		if (gameID) {
			// Get game title
			const tmpTitle = getTitleFromID(gameID);
			setTitle(tmpTitle);
			setWordifiedTitle(wordify(tmpTitle, wordCounter));
			generateTitleWordsNotFound(tmpTitle);
		}
	}, [gameID]);

	useEffect(() => {
		const oldActive = document.getElementsByClassName('selected-active-word');
		if (oldActive.length) {
			oldActive[0].classList.remove('selected-active-word');
		}
		if (activeWord) {
			const newActiveWordElements = document.getElementsByClassName('active-word');
			setActiveWordElements(newActiveWordElements);
			setActiveWordIndex(0);
			if (!solved && newActiveWordElements.length !== wordCounter.current[activeWord]) {
				const newWordCounter = { ...wordCounter.current };
				newWordCounter[activeWord] = newActiveWordElements.length;
				wordCounter.current = newWordCounter;

			}
			if (newActiveWordElements.length) {
				newActiveWordElements[0].scrollIntoView(true);
				newActiveWordElements[0].classList.add('selected-active-word');
			}
		}
		else {
			setActiveWordElements(false);
		}
	}, [activeWord]);

	const generateTitleWordsNotFound = tmpTitle => {
		const tmpArray = tmpTitle.split('(');
		let newTitleWordsNotFound = tmpArray[0].split(nonWordCharactersNoParanthesis).map(w => washWord(w)).filter(w => w !== "").filter(w => !commonWords.includes(w));

		const storedGuesses = localStorage.getItem('guesses');
		if (storedGuesses) {
			const gameObject = JSON.parse(storedGuesses);
			if (gameObject.gameID === gameID) {
				setGuesses(gameObject.guesses);
				gameObject.guesses.forEach(g => {
					newTitleWordsNotFound = newTitleWordsNotFound.filter(w => w !== g);
				})
			}
		}

		if (newTitleWordsNotFound.length === 0) {
			setSolved(true);
		}

		setTitleWordsNotFound(newTitleWordsNotFound);
	}

	const nextActiveWord = () => {
		if (activeWordElements && activeWordElements.length) {
			activeWordElements[activeWordIndex].classList.remove('selected-active-word');
			let newActiveWordIndex = activeWordIndex + 1;
			if (newActiveWordIndex >= activeWordElements.length) {
				newActiveWordIndex = 0;
			}
			activeWordElements[newActiveWordIndex].classList.add('selected-active-word');
			activeWordElements[newActiveWordIndex].scrollIntoView(true);
			setActiveWordIndex(newActiveWordIndex);
		}
	}

	const checkIfSolved = word => {
		const newTitleWordsNotFound = titleWordsNotFound.filter(w => w !== word);
		if (newTitleWordsNotFound.length === 0) {
			// Solved!
			setSolved(true);

			let historyArray = [];
			const oldHistory = localStorage.getItem('history');
			if (oldHistory) {
				historyArray = JSON.parse(oldHistory);
			}
			if (!historyArray.length || !historyArray.map(o => o.gameID).includes(gameID)) {
				historyArray.push({
					gameID: gameID,
					title: title,
					guesses: guesses.length + 1,
					precision: guesses.map(g => wordCounter.current[g]).filter(n => n > 0).length + 1,
				})
				localStorage.setItem('history', JSON.stringify(historyArray));
			}
		}
		else {
			// Not solved yet
			setTitleWordsNotFound(newTitleWordsNotFound);
		}
	}

	return (
    	<div className="App">
			<header>
				<h1>Sladdactle #{gameID}</h1>
			</header>
			<InfoBox page={infobox} setInfobox={setInfobox} />
			{solved ? <div className="infobox">Godt jobba! Du løste <strong><em>{title}</em></strong> på {guesses.length} gjett med en nøyaktighet på {(100 * guesses.filter(g => wordCounter.current[g] > 0).length / guesses.length).toFixed(2)} %. Neste oppgave kommer klokka 18:00.</div> : false}
			<GuessesContext.Provider value={{guesses: guesses, commonWords: commonWords, solved: solved, activeWord: activeWord}}>
				<ArticleBody title={title} setGuesses={setGuesses} wordCounter={wordCounter} wordifiedTitle={wordifiedTitle} setArticleFetched={setArticleFetched} />
			</GuessesContext.Provider>
			<GuessBox guesses={guesses} setGuesses={setGuesses}  wordCounter={wordCounter.current} activeWord={activeWord} setActiveWord={setActiveWord} nextActiveWord={nextActiveWord} solved={solved} checkIfSolved={checkIfSolved} gameID={gameID} setInfobox={setInfobox} articleFetched={articleFetched} />
		</div>
	);
}

export default App;
