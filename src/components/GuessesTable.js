function GuessesTable(props) {
	const {guesses, activeWord, setActiveWord, wordCounter, nextActiveWord, solved} = props;

	if (!guesses || !guesses.length) {
		return false;
	}

	const flippedGuesses = [ ...guesses ];
	flippedGuesses.reverse();
	return <table className="guesses-list"><tbody>{flippedGuesses.map((w, index) => {
		const number = flippedGuesses.length - index;
		return <tr key={number}>
			<td className="number">{number}.</td>
			<td className={`word${activeWord === w && wordCounter[w] ? ' selected-word' : ''}`} onClick={ev => {
				if (solved) {
					return false;
				}
				if (!wordCounter[w]) {
					setActiveWord('');
				}
				if (activeWord === w) {
					nextActiveWord();
				}
				else {
					setActiveWord(w);
				}
			}}>{w}</td>
			<td className="count">{wordCounter[w] ? wordCounter[w] : 0}</td>
			</tr>
	})}</tbody></table>
}

export default GuessesTable;