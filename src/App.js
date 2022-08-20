import { useState, useEffect, useRef, createContext, Children } from 'react';
import parse from 'html-react-parser';
import Word from './Word';
import './App.css';
import GuessBox from './GuessBox';
import InfoBox from './InfoBox';

export const GuessesContext = createContext([]);

function App() {

	// Calculate game ID

	const date1 = new Date(2022, 7, 17);
	const date2 = new Date();
	const hour = date2.getHours();
	date2.setHours(0, 0, 0, 0);

	let gameID = Math.round((date2 - date1) / 86400000) - (hour < 18 ? 1 : 0);

	// Admin user should get tomorrow's game, to catch bugs before they reach everybody
	if (localStorage.getItem('admin')) {
		gameID++;
	}

	let gameList = require('./articleList.json');

	const [title, setTitle] = useState();
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

	const nonWordCharacters = /([\s\.\,\(\)\-«»\":’\!]+)/;
	const nonWordCharactersNoParanthesis = /[\s\.\,\(\)\-«»\":’\!]+/;

	const invalidClasses = ['wikitable', 'infobox', 'mw-editsection', 'reference', 'barbox', 'clade', 'Expand_section', 'nowrap', 'IPA', 'thumb', 'mw-empty-elt', 'mw-editsection', 'nounderlines', 'nomobile', 'searchaux', 'sidebar', 'sistersitebox', 'noexcerpt', 'hatnote', 'haudio', 'portalbox', 'mw-references-wrap', 'infobox', 'unsolved', 'navbox', 'metadata', 'refbegin', 'reflist', 'mw-stack', 'reference', 'quotebox', 'collapsible', 'uncollapsed', 'mw-collapsible', 'mw-made-collapsible', 'mbox-small', 'mbox', 'succession-box', 'noprint', 'mwe-math-element', 'cs1-ws-icon', 'catlinks', 'utdypende-artikkel', 'references-small'];

	const invalidIds = ['toc', 'External_links', 'Further_reading', 'Notes', 'References', 'coordinates'];

	const commonWords = ['og', 'i', 'det', 'på', 'som', 'er', 'en', 'til', 'å', 'av', 'for', 'med', 'at', 'var', 'de', 'den', 'om', 'et', 'men', 'så', 'seg', 'fra', 'da', 'ble', 'skal', 'vil', 'etter', 'over', 'ved', 'eller', 'nå', 'dette', 'være', 'mot', 'opp', 'der', 'når', 'inn', 'dem', 'kunne', 'andre', 'blir', 'noen', 'sin', 'må', 'selv', 'sier', 'få', 'kom', 'denne', 'enn', 'bli', 'ville', 'før', 'vært', 'skulle'];

	useEffect(() => {
		fetchArticle(gameList[gameID % gameList.length]);
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

	const washWord = word => {
		return word.toLowerCase().trim();
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
	
			setTitle(title);
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
			{body ? <GuessBox guesses={guesses} setGuesses={setGuesses} washWord={washWord} wordCounter={wordCounter.current} activeWord={activeWord} setActiveWord={setActiveWord} nextActiveWord={nextActiveWord} nonWordCharacters={nonWordCharacters} commonWords={commonWords} solved={solved} checkIfSolved={checkIfSolved} gameID={gameID} setInfobox={setInfobox} /> : false}
		</div>
	);
}

export default App;
