const completedRegex =
	/(Just posted|Just completed) an? ((?<distance>\d+\.\d{2}) (?<unit>km|mi) )?(?<activity>[\w /]+) (in|- (?<writtenText>[\s\S]+?) https:\/\/t\.co\/|with)/;
const linkRegex = /(.*)(https:\/\/t\.co\/.{10})(.*)/;

class Tweet {
	private text: string;
	time: Date;

	private extractedSource: "completed_event" | "achievement" | "live_event" | "miscellaneous";
	private extractedText: string | undefined;
	private extractedActivity: string | undefined;
	private extractedDistance: number | undefined;

	private textParsed:
		| {
				pre: string;
				link: string;
				post: string;
		  }
		| undefined;

	constructor(tweet_text: string, tweet_time: string) {
		this.text = tweet_text;
		this.time = new Date(tweet_time); //, "ddd MMM D HH:mm:ss Z YYYY"

		const results = completedRegex.exec(tweet_text);
		if (results !== null) {
			this.extractedSource = "completed_event";

			this.extractedText = results.groups?.writtenText;

			if (results.groups?.activity !== undefined) {
				this.extractedActivity = results.groups.activity;
			} else {
				console.warn(`Missing activity for completed event: \n${tweet_text}`);
			}

			if (
				(results.groups?.distance !== undefined && results.groups?.unit === "km") ||
				results.groups?.unit === "mi"
			) {
				if (results.groups.unit === "mi")
					this.extractedDistance = parseFloat(results.groups.distance);
				else this.extractedDistance = parseFloat(results.groups.distance) / 1.609;
			}
		} else if (this.text.startsWith("Achieved a new personal record"))
			this.extractedSource = "achievement";
		else if (this.text.startsWith("Watch my")) this.extractedSource = "live_event";
		else this.extractedSource = "miscellaneous";

		const resultsLink = linkRegex.exec(tweet_text);
		if (resultsLink !== null) {
			this.textParsed = { pre: resultsLink[1], link: resultsLink[2], post: resultsLink[3] };
		} else {
			console.warn(`Failed to parse link for event: \n${tweet_text}\n${resultsLink}`);
		}
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
	get source() {
		return this.extractedSource;
	}

	//returns a boolean, whether the text includes any content written by the person tweeting.
	get written(): boolean {
		return this.extractedText !== undefined;
	}

	get writtenText(): string {
		if (this.extractedText === undefined) return "";
		return this.extractedText;
	}

	get activityType(): string {
		if (this.source != "completed_event") {
			return "unknown";
		}

		return this.extractedActivity || "unknown";
	}

	get distance() {
		if (this.source != "completed_event") {
			return undefined;
		}

		return this.extractedDistance;
	}

	getHTMLTableRow(rowNumber: number): string {
		const textHtml = this.textParsed
			? `<td>${this.textParsed.pre}<a href="${this.textParsed.link}">${this.textParsed.link}</a>${this.textParsed.post}</td>`
			: `<td>${this.text}</td>`;

		return `
			<tr>
				<th>${rowNumber}</th>
				<td>${this.extractedActivity}</td>
				${textHtml}
			</tr>
		`;
	}
}
