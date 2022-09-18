import GameHistory from "./GameHistory";

function InfoBox(props) {

	const {page, setInfobox, changeGameID} = props;

	const infoboxContents = {
		'om': <>
		<p><strong>Sladdactle</strong> er et forsøk på å lage en tilfredsstillende (dog høyst uoffisiell) norskspråklig utgave av <a href="https://redactle.com">Redactle</a>. Sladdactle har ingen forbindelser til Redactle eller John Turner, men har du ikke prøvd originalen kan den anbefales på det sterkeste.</p>
		<p>Spillet går ut på å gjette hva dagens sladdede Wikipedia-artikkel er. Tast et ord i tekstboksen og trykk på "Gjett" - dersom det befinner seg i artikkelen blir alle forekomstene av det usladda. Du vinner om du klarer å gjette tittelen på artikkelen.</p>
		<p>Dagens ord er en tilfeldig valgt artikkel som ligger i en av kategoriene "Utmerkede artikler" eller "Anbefalte artikler" på <a href="https://no.wikipedia.org">norsk (bokmål) Wikipedia</a> - nærmere bestemt som lå i en av disse kategoriene 17. august 2022.</p>
		<p><em>(Merk at i motsetning til engelsk Wikipedia har norsk Wikipedia ingen liste over *viktige* artikler. Det finnes derimot lister over *gode* artikler, og jeg har valgt å bruke disse som utgangspunkt. Det betyr at noen av artiklene kan være noe smalere enn artiklene som benyttes i Redactle - men at de bør være fyldige, ordrike og godt skrevet.)</em></p>
		<p>En ny oppgave publiseres hver dag klokka 18.00.</p>
		<p>Hvis du vil lese kildekoden til Sladdactle, finner du den <a href="https://github.com/olafmoriarty/sladdactle">på GitHub</a>.</p>
		</>,
		'historikk': <GameHistory changeGameID={changeGameID} />,
		'personvern': <>
			<h2>Personvern</h2>
			<h3>Weblogger</h3>
			<p>På samme måte som alle andre nettsider, samler serveren Sladdactle ligger på loggdata. Det vil si at ett eller annet sted på serveren min ligger det en loggfil hvor det står at din IP-adresse besøkte denne siden på et gitt klokkeslett, hvilken nettleser du har brukt og eventuelt hvilken nettside du klikket deg hit fra. I praksis kommer jeg nok ikke til å se på de loggfilene, og jeg kommer i alle fall definitivt aldri til å gi eller selge den informasjonen videre til tredjeparter, men den eksisterer altså.</p>
			<h3>Annet</h3>
			<p>Utover de vanlige webloggene samler Sladdactle absolutt ingen informasjon om deg. Nettsiden bruker ingen statistikkverktøy, verken interne eller via tredjeparter. Absolutt ingen informasjon om deg eller hva du bruker denne siden til blir sendt inn til serveren. Ordene du taster inn i gjetteskjemaet blir ikke sendt inn til serveren. Informasjonen om at du har fullført en oppgave blir heller ikke sendt inn til serveren. Det eneste det er fysisk mulig for meg å se i loggene til Sladdactle, er at du har åpnet nettsiden. Resten av aktiviteten skjer helt isolert på din datamaskin eller dings. Jeg aner ikke om du åpner sida og lukker den igjen eller om du løser oppgaven på firehundre forsøk, og det er helt OK, for det trenger jeg faktisk ikke å vite.</p>
			<h3>Lokalt lagrede data</h3>
			<p>Det er ingen informasjonskapsler på denne siden, og iallefall ingen sporingsinformasjonskapsler som kan identifisere deg, men Sladdactle lagrer <em>noe</em> informasjon lokalt i nettleseren din, i “localStorage”. Helt nøyaktig lagres tre ting, alle for å gi deg en ørlitegrann bedre spillopplevelse:</p>
			<ul>
				<li>En liste over alle ordene du har gjettet i dagens oppgave sammen med oppgavenummeret. Hvis vi ikke hadde lagret dette, hadde du vært nødt til å starte oppgaven helt på nytt dersom du ved en feil klarte å refreshe nettsiden.</li>
				<li>Dersom du har klikket deg inn på en annen oppgave enn dagens: oppgavens ID-nummer, slik at du kommer til samme oppgave dersom du refresher nettsiden.</li>
				<li>En liste over alle oppgavene du har løst så langt, hvor mange gjett du brukte på å løse dem, og hvor mange av disse gjettene som forekom i teksten mer enn null ganger.</li>
			</ul>
			<p>Denne informasjonen ligger trygt i nettleseren din og kommer aldri til å bli sendt inn til Sladdactle-serveren, men om du er ukomfortabel med at denne informasjonen er lagra om deg kan du trykke på knappen under for å slette alle lokalt lagrede data fra nettleseren din. Ikke gjør dette med mindre du er helt komfortabel med å miste all Sladdactle-historikk og alle ord du har gjetta i dag.</p>
			<p><button onClick={() => {
				localStorage.clear();
				alert('Alle lagrede data slettet fra nettleseren. Oppdater siden for å se effekten av dette.');
			}}>Slett alle data fra nettleseren din</button></p>
			<h3>Andre nettsider</h3>
			<p>Når du åpner Sladdactle henter datamaskinen din dagens artikkel fra API-et til Wikipedia. Wikipedia har sin egen personvernerklæring <a href="https://meta.wikimedia.org/wiki/Privacy_policy/nb">som du kan lese her</a>.</p>
		</>
	}

	if (!page || !infoboxContents[page]) {
		return false;
	}

	return (
		<div className="infobox">
			{infoboxContents[page]}
			<p><button className="close-infobox" onClick={() => setInfobox('')}>Lukk</button></p>
		</div>
		
	)
}

export default InfoBox