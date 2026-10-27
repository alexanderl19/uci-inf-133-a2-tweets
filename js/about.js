/// <reference path="../ts/tweet.ts" />

function parseTweets(runkeeper_tweets) {
	// Do not proceed if no tweets loaded
	if (runkeeper_tweets === undefined) {
		window.alert("No tweets returned");
		return;
	}

	/** @type {Tweet[]} */
	const tweet_array = runkeeper_tweets.map(function (tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	// This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	// It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById("numberTweets").innerText = tweet_array.length;

	const tweetsMinMax = tweet_array.reduce(
		(acc, tweet) => {
			if (tweet.time < acc.min) acc.min = tweet.time;
			else if (tweet.time > acc.max) acc.min = tweet.time;
			return acc;
		},
		{
			min: tweet_array[0].time,
			max: tweet_array[0].time,
		},
	);

	const options = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	};

	document.getElementById("firstDate").innerHTML = tweetsMinMax.min.toLocaleDateString(
		"en-US",
		options,
	);

	document.getElementById("lastDate").innerHTML = tweetsMinMax.max.toLocaleDateString(
		"en-US",
		options,
	);

	const counts = tweet_array.reduce(
		(counts, tweet) => {
			counts[tweet.source]++;
			return counts;
		},
		{
			live_event: 0,
			achievement: 0,
			completed_event: 0,
			miscellaneous: 0,
		},
	);

	document
		.querySelectorAll(".completedEvents")
		.forEach((el) => (el.innerHTML = counts.completed_event));
	document.getElementsByClassName("completedEventsPct")[0].innerHTML =
		((counts.completed_event / tweet_array.length) * 100).toFixed(2) + "%";
	document.getElementsByClassName("liveEvents")[0].innerHTML = counts.live_event;
	document.getElementsByClassName("liveEventsPct")[0].innerHTML =
		((counts.live_event / tweet_array.length) * 100).toFixed(2) + "%";
	document.getElementsByClassName("achievements")[0].innerHTML = counts.achievement;
	document.getElementsByClassName("achievementsPct")[0].innerHTML =
		((counts.achievement / tweet_array.length) * 100).toFixed(2) + "%";
	document.getElementsByClassName("miscellaneous")[0].innerHTML = counts.miscellaneous;
	document.getElementsByClassName("miscellaneousPct")[0].innerHTML =
		((counts.miscellaneous / tweet_array.length) * 100).toFixed(2) + "%";

	const written = tweet_array.reduce((count, tweet) => {
		if (tweet.written) return count + 1;
		return count;
	}, 0);

	document.getElementsByClassName("written")[0].innerHTML = written;
	document.getElementsByClassName("writtenPct")[0].innerHTML =
		((written / counts.completed_event) * 100).toFixed(2) + "%";
}

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
	loadSavedRunkeeperTweets().then(parseTweets);
});
