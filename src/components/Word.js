import {useContext} from 'react';
import {GuessesContext} from '../App';

function Word(props) {
	const {washedWord, children} = props;
	const {guesses, commonWords, solved, activeWord} = useContext(GuessesContext);

	if (solved || !washedWord) {
		return children;
	}
	if (!guesses.includes(washedWord) && !commonWords.includes(washedWord)) {
		let blackBox = '';
		for (let i = 0; i < children.length; i++) {
			blackBox += '█';
		}
		return <span className="black-box">{blackBox}</span>;
	}

	if (washedWord === activeWord) {
		return <span className="active-word">{children}</span>;
	}
	return (
		<>{children}</>
	)
}

export default Word;