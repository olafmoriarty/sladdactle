import getGameID from '../functions/getGameID';

function Statistics(props) {
	const {guesses, solved, wordCounter} = props;
	const gameID = getGameID();
	let streak = 0;
	let solvedPuzzles = [];

	const storedHistory = localStorage.getItem('history');

	if (storedHistory) {
		let historyArray = JSON.parse(storedHistory);

		solvedPuzzles = historyArray.map(el => el.gameID);
	
		for (let i = gameID; i > 0; i--) {
			if (solvedPuzzles.includes(i)) {
				streak++;
			}
			else if (i < gameID) {
				break;
			}
		}
	}

	return (
		<div class="statistics">
			{solved && guesses && wordCounter ? <>
				<div>
					<h2>Antall gjett</h2>
					<p>{guesses.length}</p>
				</div>
				<div>
					<h2>Nøyaktighet</h2>
					<p>{(100 * guesses.filter(g => wordCounter[g] > 0).length / guesses.length).toFixed(2)} %</p>
				</div>
			</> : false}
			<div><h2>Oppgaver løst</h2><p>{solvedPuzzles.length}</p></div>
			<div><h2>Oppgaver løst på rad</h2><p>{streak}</p></div>
		</div>
	)
}

export default Statistics;