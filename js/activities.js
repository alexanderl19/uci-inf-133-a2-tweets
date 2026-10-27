/// <reference path="../ts/tweet.ts" />

/**
 * @param {Tweet[]} tweets
 * @returns {number}
 */
function averageDistance(tweets) {
	let hasDistanceCount = 0;
	const sum = tweets.reduce((acc, tweet) => {
		if (tweet.distance) {
			hasDistanceCount++;
			return acc + tweet.distance;
		}
		return acc;
	}, 0);

	return sum / hasDistanceCount;
}

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

	const tweetByActivity = tweet_array.reduce((acc, tweet) => {
		if (tweet.activityType !== "unknown") {
			acc.set(tweet.activityType, [...(acc.get(tweet.activityType) || []), tweet]);
		}

		return acc;
	}, /** @type {Map<string, Tweet[]>} */ (new Map()));

	const activitySorted = [...tweetByActivity.entries()].sort((a, b) => b[1].length - a[1].length);

	document.getElementById("numberActivities").innerText = activitySorted.length;
	document.getElementById("firstMost").innerText = activitySorted[0][0];
	document.getElementById("secondMost").innerText = activitySorted[1][0];
	document.getElementById("thirdMost").innerText = activitySorted[2][0];

	const averageDistancesDesc = [
		[averageDistance(activitySorted[0][1]), activitySorted[0][0]],
		[averageDistance(activitySorted[1][1]), activitySorted[1][0]],
		[averageDistance(activitySorted[2][1]), activitySorted[2][0]],
	].sort((a, b) => b[0] - a[0]);

	document.getElementById("longestActivityType").innerText = averageDistancesDesc[0][1];
	document.getElementById("shortestActivityType").innerText = averageDistancesDesc[2][1];

	const weekendTopThreeAverage = averageDistance(
		activitySorted
			.slice(0, 3)
			.flatMap(([_kind, tweets]) =>
				tweets.filter((tweet) => tweet.time.getDay() === 0 || tweet.time.getDay() === 6),
			),
	);
	const weekdayTopThreeAverage = averageDistance(
		activitySorted
			.slice(0, 3)
			.flatMap(([_kind, tweets]) =>
				tweets.filter((tweet) => tweet.time.getDay() !== 0 && tweet.time.getDay() !== 6),
			),
	);

	document.getElementById("weekdayOrWeekendLonger").innerText =
		weekendTopThreeAverage > weekdayTopThreeAverage ? "weekends" : "weekdays";

	const activityGraphData = activitySorted.map(([kind, tweets]) => ({
		kind,
		count: tweets.length,
	}));

	activity_vis_spec = {
		$schema: "https://vega.github.io/schema/vega-lite/v5.json",
		description: "A graph of the number of Tweets containing each type of activity.",
		data: {
			values: activityGraphData,
		},
		mark: "bar",
		encoding: {
			x: { field: "kind", type: "nominal", sort: null, axis: { labelAngle: -45 } },
			y: { field: "count", type: "quantitative" },
		},
	};
	vegaEmbed("#activityVis", activity_vis_spec, { actions: false });

	const distanceGraphData = activitySorted
		.slice(0, 3)
		.flatMap(([kind, tweets]) =>
			tweets.map((tweet) => ({ day: tweet.time.getDay(), distance: tweet.distance, kind })),
		);

	const distance_vis_spec = {
		$schema: "https://vega.github.io/schema/vega-lite/v5.json",
		description: "A graph of the number of Tweets containing each type of activity.",
		data: {
			values: distanceGraphData,
		},
		mark: "point",
		encoding: {
			x: {
				field: "day",
				type: "quantitative",
				axis: {
					title: "Day of Week",
					values: [0, 1, 2, 3, 4, 5, 6],
					labelExpr: "['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][datum.value]",
				},
			},
			color: {
				field: "kind",
				type: "nominal",
				axis: {
					title: "Activity",
				},
			},
		},
		params: [{ name: "aggregated", value: false }],
		layer: [
			{
				transform: [{ filter: "!aggregated" }],
				mark: "point",
				encoding: {
					y: {
						field: "distance",
						type: "quantitative",
						title: "Distance",
					},
				},
			},
			{
				transform: [{ filter: "aggregated" }],
				mark: "point",
				encoding: {
					y: {
						field: "distance",
						type: "quantitative",
						aggregate: "mean",
						title: "Distance",
					},
				},
			},
		],
	};
	vegaEmbed("#distanceVis", distance_vis_spec, { actions: false }).then(({ view }) => {
		document.getElementById("aggregate").addEventListener("click", () => {
			view.signal("aggregated", !view.signal("aggregated")).runAsync();
		});
	});
}

//Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
	loadSavedRunkeeperTweets().then(parseTweets);
});
