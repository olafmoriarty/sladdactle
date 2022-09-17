import Statistics from "./Statistics";

function GameHistory() {
	const storedHistory = localStorage.getItem('history');
	if (!storedHistory) {
		return <p>Du har ikke løst noen Sladdactle-oppgaver ennå og det er derfor ingen historikk å vise.</p>
	}
	let historyArray = JSON.parse(storedHistory);
	historyArray.reverse();

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
				{historyArray.map(row => <tr key={row.gameID}>
					<td>{row.gameID}</td>
					<td className="gametitle">{row.title}</td>
					<td>{row.guesses}</td>
					<td>{(row.precision / row.guesses * 100).toFixed(2)} %</td>
				</tr>)}
			</tbody>
		</table>
	)
}

export default GameHistory