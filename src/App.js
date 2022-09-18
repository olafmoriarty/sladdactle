import { useState, useEffect, useRef, createContext } from 'react';
import './App.css';

import ArticleBody from './components/ArticleBody';
import GuessBox from './components/GuessBox';
import InfoBox from './components/InfoBox';
import Statistics from './components/Statistics';

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
	const [currentGameID, setCurrentGameID] = useState(0);
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

		const storedID = localStorage.getItem('currentID');
		setCurrentGameID(storedID ? storedID : id);
	}, []);

	useEffect(() => {
		setGuesses([]);
		setSolved(false);
		wordCounter.current = {};
		if (currentGameID) {
			// Get game title
			const tmpTitle = getTitleFromID(currentGameID);
			setTitle(tmpTitle);
			setWordifiedTitle(wordify(tmpTitle, wordCounter));
			generateTitleWordsNotFound(tmpTitle);
			setInfobox('');
		}
	}, [currentGameID]);

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

	const changeInfobox = value => {
		document.body.scrollTop = 0; // For Safari
		document.documentElement.scrollTop = 0;
		setInfobox(value);
	}

	const generateTitleWordsNotFound = tmpTitle => {
		const tmpArray = tmpTitle.split('(');
		let newTitleWordsNotFound = tmpArray[0].split(nonWordCharactersNoParanthesis).map(w => washWord(w)).filter(w => w !== "").filter(w => !commonWords.includes(w));

		const oldHistory = localStorage.getItem('history');
		let historyArray = [];
		if (oldHistory) {
			historyArray = JSON.parse(oldHistory);
		}

		const storedGuesses = localStorage.getItem('guesses');
		if (storedGuesses) {
			const gameObject = JSON.parse(storedGuesses);
			if (gameObject.gameID == currentGameID) {
				setGuesses(gameObject.guesses);
				gameObject.guesses.forEach(g => {
					newTitleWordsNotFound = newTitleWordsNotFound.filter(w => w !== g);
				})
			}
		}

		if (newTitleWordsNotFound.length === 0 || historyArray.map(o => o.gameID).includes(currentGameID)) {
			setSolved(true);
		}

		setTitleWordsNotFound(newTitleWordsNotFound);
	}

	const changeGameID = newID => {
		// Cancel function if ID is too high
		if (newID > gameID) {
			return false;
		}

		//  Cancel function if clicked puzzle is the same as active puzzle
		if (newID == currentGameID) {
			return false;
		}

		// Ask player if they really want to change game ID
		if (guesses.length && !solved) {
			const wantsToChange = window.confirm('Er du sikker på at du vil bytte oppgave? Når du bytter oppgave, vil all framgang i oppgaven du holder på med bli slettet!');
			if (!wantsToChange) {
				return false;
			}
		}
		setCurrentGameID(newID);
		if (newID == gameID) {
			localStorage.removeItem('currentID');
		}
		else {
			localStorage.setItem('currentID', newID);
		}
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
			localStorage.removeItem('currentID');

			let historyArray = [];
			const oldHistory = localStorage.getItem('history');
			if (oldHistory) {
				historyArray = JSON.parse(oldHistory);
			}
			if (!historyArray.length || !historyArray.map(o => o.gameID).includes(currentGameID)) {
				historyArray.push({
					gameID: currentGameID,
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
				<h1>Sladdactle #{currentGameID}</h1>
			</header>
			{currentGameID != gameID ? <p className="old-info">Dette er en oppgave fra arkivet. <button className="link" onClick={() => changeGameID(gameID)}>Bytt til dagens oppgave</button></p> : false}
			<GuessesContext.Provider value={{guesses: guesses, commonWords: commonWords, solved: solved, activeWord: activeWord}}>
				<InfoBox page={infobox} setInfobox={changeInfobox} changeGameID={changeGameID} />
				{solved && articleFetched ? <>
					<Statistics solved={true} guesses={guesses} wordCounter={wordCounter.current} currentGameID={currentGameID} />
					<p className="old-info"><button className="link" onClick={() => setInfobox('historikk')}>Gå til oppgavearkivet</button></p>
				</> : false}
				<ArticleBody title={title} setGuesses={setGuesses} wordCounter={wordCounter} wordifiedTitle={wordifiedTitle} setArticleFetched={setArticleFetched} />
			</GuessesContext.Provider>
			<GuessBox guesses={guesses} setGuesses={setGuesses}  wordCounter={wordCounter.current} activeWord={activeWord} setActiveWord={setActiveWord} nextActiveWord={nextActiveWord} solved={solved} checkIfSolved={checkIfSolved} gameID={currentGameID} setInfobox={changeInfobox} articleFetched={articleFetched} />
		</div>
	);
}

export default App;
