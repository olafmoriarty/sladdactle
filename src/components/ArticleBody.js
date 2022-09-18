import {useState, useEffect, Children } from 'react';
import parse from 'html-react-parser';
import wordify from '../functions/wordify';

function ArticleBody(props) {
	const {wordCounter, title, wordifiedTitle, setArticleFetched} = props;

	const [body, setBody] = useState('');
	const [nothingWorks, setNothingWorks] = useState();

	// Get arrays of classes/IDs to ignore in parsing, and common words to not redact. All of these vary from language to language, so they are stored in language-specific files.
	const parsingElements = require('../data/no_parsingElements.json');
	const {invalidClasses, invalidIds} = parsingElements;

	// On load fetch today's article from Wikipedia
	useEffect(() => {
		setBody(false);
		if (title) {
			fetchArticle(title);
		}
	}, [title]);

	const fetchArticle = async title => {
		try {
			const res = await fetch('https://no.wikipedia.org/w/api.php?action=parse&format=json&page=' + title + '&prop=text&formatversion=2&origin=*');
			const json = await res.json();
			let newBodyText = json.parse.text.replace(/<img[^>]*>/g,"").replace(/<small[^>]*>/g,'').replace(/<\/small>/g,'').replace(/â€“/g,'-').replace(/<audio.*<\/audio>/g,"").replace(/<a [^>]*>/g,'').replace(/<\/a>/g,'');
			let newBody = parse(newBodyText);
			newBody = sanitizeChild(newBody);
			newBody = wordifyChild(newBody);
			setBody(newBody);
			setArticleFetched(true);
		}
		catch (e) {
			console.log(e);
			setNothingWorks(true);
		}
	}

	const sanitizeChild = el => {
		if (el.type && ['style'].includes(el.type)) {
			return false;
		}
		if (!el.props) {
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

	const wordifyChild = el => {
		if (!el) {
			return false;
		}
		if (!el.props) {
			if (typeof el === 'string' && el && el.trim().length) {
				return wordify(el, wordCounter);
			}
			return el;
		}
		if (!el.props.children) {
			return el;
		}
		const Type = el.type;
		let newChild;
		newChild = Children.map(el.props.children, child => wordifyChild(child));
		return <Type>{newChild}</Type>;
	}


	return (
		<section className="body-container">
			{title ? <h1 id="article-title">{wordifiedTitle}</h1> : false}
			{nothingWorks ? <p>Noe gikk galt :-( Klarte ikke å hente inn dagens artikkel.</p> : (body ? body : <p>Henter dagens artikkel fra Wikipedia ...</p>)}
		</section>
	)
}

export default ArticleBody;