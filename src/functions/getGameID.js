const getGameID = () => {
	// Calculate game ID

	// Days since game start. Could perhaps be improved with taking start date as a parameter, which would make it possible to run different games with different start dates, but for now it's not required.
	const date1 = new Date(2022, 7, 17);
	const date2 = new Date();
	const hour = date2.getHours();
	date2.setHours(0, 0, 0, 0);

	// Subtract one if it's not 6 PM yet
	let gameID = Math.round((date2 - date1) / 86400000) - (hour < 18 ? 1 : 0);

	// Admin user should get tomorrow's game, to catch bugs before they reach everybody
	if (localStorage.getItem('admin')) {
		gameID++;
	}

	// We have an ID, return it!
	return gameID;
}
export default getGameID;