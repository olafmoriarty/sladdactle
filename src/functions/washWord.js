const washWord = word => {
	let newWord = word.toLowerCase().trim();
    newWord = newWord.replace(/[àáâã]/g,"a");
    newWord = newWord.replace(/ç/g,"c");
    newWord = newWord.replace(/[èéêë]/g,"e");
    newWord = newWord.replace(/[ìíîï]/g,"i");
    newWord = newWord.replace(/ñ/g,"n");                
    newWord = newWord.replace(/[òóôõ]/g,"o");
    newWord = newWord.replace(/œ/g,"oe");
    newWord = newWord.replace(/[ùúûü]/g,"u");
    newWord = newWord.replace(/[ýÿ]/g,"y");
	return newWord;
}

export default washWord;