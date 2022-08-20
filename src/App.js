import { useState, useEffect, useRef, createContext, Children } from 'react';
import parse from 'html-react-parser';
import Word from './Word';
import './App.css';

import GuessBox from './GuessBox';
import InfoBox from './InfoBox';

import getGameID from './functions/getGameID';
import getTitleFromID from './functions/getTitleFromID';
import washWord from './functions/washWord';

export const GuessesContext = createContext([]);

function App() {
	// Generate game ID
	const gameID = getGameID();
	const title = getTitleFromID(gameID);

	const [guesses, setGuesses] = useState([]);
	const [body, setBody] = useState('');
	const [wordifiedTitle, setWordifiedTitle] = useState('');
	const [solved, setSolved] = useState();
	const [activeWord, setActiveWord] = useState();
	const [activeWordElements, setActiveWordElements] = useState(false);
	const [activeWordIndex, setActiveWordIndex] = useState(false);
	const [titleArray, setTitleArray] = useState([]);
	const [nothingWorks, setNothingWorks] = useState();
	const [infobox, setInfobox] = useState('');
	const wordCounter = useRef({});

	// Get arrays of classes/IDs to ignore in parsing, and common words to not redact. All of these vary from language to language, so they are stored in language-specific files.
	const parsingElements = require('./data/no_parsingElements.json');
	const {invalidClasses, invalidIds, commonWords} = parsingElements;

	// Also get which punctuation characters should be ignored. These are saved as regular expression, and because some functions require the paranthesis and some require it to not exist, I need to define both versions ...
	const nonWordCharacters = /([\s\.\,\(\)\-«»\":’\!]+)/;
	const nonWordCharactersNoParanthesis = /[\s\.\,\(\)\-«»\":’\!]+/;

	useEffect(() => {
		fetchArticle(title);
	}, []);

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

	const wordify = el => {
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

	const sanitizeChild = el => {
		if (el.type && ['style'].includes(el.type)) {
			return false;
		}
		if (!el.props) {
			if (typeof el === 'string' && el && el.trim().length) {
				return wordify(el);
			}
			return el;
		}
		if (!el.props.children) {
			return el;
		}
		const props = el.props;
		if (props.id && ['Noter', 'Referanser', 'Eksterne_lenker', 'Litteratur', 'Se_også', 'Fotnoter'].includes(props.id)) {
			return 'IGNORE_REST';
		}
		if (props.id && invalidIds.includes(props.id)) {
			return false;
		}
		if ((props.style && props.style.float && props.style.float === 'right') || (props.align && props.align == 'right')) {
			return false;
		}
		if (props.className) {
			let hasIllegalClass = false;
			const classes = props.className.split(' ');
			invalidClasses.forEach(ic => {
				if (classes.includes(ic)) {
					hasIllegalClass = true;
				}
			})
			if (hasIllegalClass) {
				return false;
			}
		}
		const Type = el.type;
		let newChild;
		newChild = Children.map(el.props.children, child => sanitizeChild(child));
		if (newChild.includes('IGNORE_REST')) {
			if (el.type === 'h2') {
				return 'IGNORE_REST';
			}
			newChild = newChild.slice(0, newChild.indexOf('IGNORE_REST'));
		}
		return <Type>{newChild}</Type>;
	}

	const fetchArticle = async title => {
		try {
			const res = await fetch('https://no.wikipedia.org/w/api.php?action=parse&format=json&page=' + title + '&prop=text&formatversion=2&origin=*');
			const json = await res.json();
			let newBodyText = json.parse.text.replace(/<img[^>]*>/g,"").replace(/<small[^>]*>/g,'').replace(/<\/small>/g,'').replace(/â€“/g,'-').replace(/<audio.*<\/audio>/g,"").replace(/\<a [^>]*\>/g,'').replace(/\<\/a\>/g,'');
			let newBody = parse(newBodyText);
	
			const tmpArray = title.split('(');
			let newTitleArray = tmpArray[0].split(nonWordCharactersNoParanthesis).map(w => washWord(w)).filter(w => w !== "");
	
			const storedGuesses = localStorage.getItem('guesses');
			if (storedGuesses) {
				const gameObject = JSON.parse(storedGuesses);
				if (gameObject.gameID === gameID) {
					setGuesses(gameObject.guesses);
					gameObject.guesses.forEach(g => {
						newTitleArray = newTitleArray.filter(w => w !== g);
					})
				}
			}
	
			if (newTitleArray.length === 0) {
				setSolved(true);
			}
	
			setTitleArray(newTitleArray);
			setWordifiedTitle(wordify(title));
			setBody(sanitizeChild(newBody));
	
		}
		catch (e) {
			setNothingWorks(true);
		}
	}

	const checkIfSolved = word => {
		const newTitleArray = titleArray.filter(w => w !== word);
		if (newTitleArray.length === 0) {
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
			setTitleArray(newTitleArray);
		}
	}

	return (
    	<div className="App">
			<header>
				<h1>Sladdactle #{gameID}</h1>
			</header>
			<InfoBox page={infobox} setInfobox={setInfobox} />
			{solved ? <div className="infobox">Godt jobba! Du løste <strong><em>{title}</em></strong> på {guesses.length} gjett med en nøyaktighet på {(100 * guesses.filter(g => wordCounter.current[g] > 0).length / guesses.length).toFixed(2)} %. Neste oppgave kommer klokka 18:00.</div> : false}
			<section className="body-container">
				<GuessesContext.Provider value={{guesses: guesses, commonWords: commonWords, solved: solved, activeWord: activeWord}}>
				{title ? <h1 id="article-title">{wordifiedTitle}</h1> : false}
				{nothingWorks ? <p>Noe gikk galt :-( Klarte ikke å hente inn dagens artikkel.</p> : (body ? body : <p>Henter dagens artikkel fra Wikipedia ...</p>)}
				</GuessesContext.Provider>
			</section>
			{body ? <GuessBox guesses={guesses} setGuesses={setGuesses}  wordCounter={wordCounter.current} activeWord={activeWord} setActiveWord={setActiveWord} nextActiveWord={nextActiveWord} nonWordCharacters={nonWordCharacters} commonWords={commonWords} solved={solved} checkIfSolved={checkIfSolved} gameID={gameID} setInfobox={setInfobox} /> : false}
		</div>
	);
}

export default App;
