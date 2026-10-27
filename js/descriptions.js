/// <reference path="../ts/tweet.ts" />

/** @type {Tweet[]} */
let writtenTweets = [];

/**
 * @param {{ text: string, created_at: string }[]} runkeeper_tweets
 */
function parseTweets(runkeeper_tweets) {
	// Do not proceed if no tweets loaded
	if (runkeeper_tweets === undefined) {
		window.alert("No tweets returned");
		return;
	}

	writtenTweets = runkeeper_tweets
		.map((tweet) => {
			return new Tweet(tweet.text, tweet.created_at);
		})
		.filter((tweet) => tweet.written);
}

function addEventHandlerForSearch() {
	document.getElementById("textFilter").addEventListener("input", (e) => {
		const event = /** @type {InputEvent} */ (e);
		const input = /** @type {HTMLInputElement} */ (event.target);

		handleSearch(input.value);
	});
}

/**
 * @param string term
 */
function handleSearch(term) {
	if (term === "") {
		document.getElementById("searchText").innerText = "???";
		document.getElementById("searchCount").innerText = "???";
		document.getElementById("tweetTable").innerHTML = "";
		return;
	}
	document.getElementById("searchText").innerText = term;

	const results = writtenTweets.filter((tweet) => tweet.writtenText.includes(term));
	document.getElementById("searchCount").innerText = results.length;

	document.getElementById("tweetTable").innerHTML = results
		.map((tweet, i) => tweet.getHTMLTableRow(i))
		.join("");
}

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});
