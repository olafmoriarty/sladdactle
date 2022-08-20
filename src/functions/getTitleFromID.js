const getTitleFromID = id => {

	// Get pre-generated of articles
	let gameList = require('../data/no_articleList.json');

	// Return the "id"th element. If id is larger than array length, start counting from the beginning again.
	// Note: For completely silly reasons, it starts counting at the second element (when starting the game I thought the second element was a better first game than the first one). So that's intentional, but I should probably change it at some point for clarification.
	return gameList[id % gameList.length];
}
export default getTitleFromID;