import getGameID from "../functions/getGameID";
import wordify from "../functions/wordify";

function GameHistory(props) {
	const {changeGameID} = props;
	let pastGames = {};
	const gameID = getGameID();
	let gameList = require('../data/no_articleList.json');

	for (let i = gameID; i > 0; i--) {
		pastGames[i] = {
			gameID: i,
			title: gameList[i % gameList.length],
		};
	}

	const storedHistory = localStorage.getItem('history');
	let historyArray = [];
	if (storedHistory) {
		historyArray = JSON.parse(storedHistory);
	}

	historyArray.forEach(row => {
		pastGames[row.gameID] = {
			...pastGames[row.gameID],
			...row,
			solved: true,
		}
	});

	let pastGamesArray = [];
	for (let i = gameID; i > 0; i--) {
		if (pastGames[i]) {
			pastGamesArray.push(pastGames[i]);
		}
	}

	
	return (
		<table className="game-history">
			<thead>
				<tr>
				<th>#</th>
				<th className="gametitle">Artikkel</th>
				<th>Gjett</th>
				<th>Presisjon</th>
				</tr>
			</thead>
			<tbody>
				{pastGamesArray.map(row => <tr key={row.gameID}>
					<td className="game-id">{row.gameID}</td>
					<td className="gametitle">{row.solved ? row.title : <button onClick={() => changeGameID(row.gameID)}>{wordify(row.title)}</button>}</td>
					<td className={`game-guesses${row.solved ? "" : " empty"}`}>{row.solved ? row.guesses : ""}</td>
					<td className={`game-precision${row.solved ? "" : " empty"}`}>{row.solved ? (row.precision / row.guesses * 100).toFixed(2) + " %" : ""}</td>
				</tr>)}
			</tbody>
		</table>
	)
}

export default GameHistory