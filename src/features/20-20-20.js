import {app, Notification} from "electron";
import FeatureConfigurations from "../modules/FeatureConfigurations";

export default class R202020 {

	static eventID = null;
	static notification = null;
	static res = null;

	static messages = [
		"Hey there! Noticed you've been on the laptop for a while. How about a quick break? Your eyes will thank you, and we can chat or do something relaxing together. 😊",
		"Time for a breather! How about stepping away from the screen, maybe grab a snack? I'm here if you want to chat or take a quick stroll.",
		"Break alert! Let's pause the screen time and recharge. A short break can do wonders. What's your go-to way to relax for a few?",
		"Friendly reminder: eyes need breaks too! Let's take a short break together. I'm up for a chat or anything that helps you unwind.",
		"Screen marathon? Time for a mini break! Stretch, grab a drink, or just take a moment to breathe. I'm here for a quick chat or some light-hearted distraction if you fancy!"
	]

	static start() {
		let raw = FeatureConfigurations.get("R202020");
		raw.config = JSON.parse(raw.config);
		const res = R202020.res = raw;

		if(res && res.status) {
			R202020.notification = new Notification({
				title: app.getName(),
			});

			if(R202020.eventID) clearInterval(R202020.eventID);

			R202020.eventID = setInterval(() => {
				R202020.notification.body = R202020.messages[Date.now() % R202020.messages.length];
				R202020.notification.show();
			}, 5000);

		}

	}


	static update() {
		const res = FeatureConfigurations.get('R202020')
		if(res && res.status) {
			R202020.start()
		} else {
			R202020.end();
		}
	}


	static end() {
		if(R202020.res && R202020.eventID) {
			clearInterval(R202020.eventID);
			R202020.eventID = null;
		}
	}

}