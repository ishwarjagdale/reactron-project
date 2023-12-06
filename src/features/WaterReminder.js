import FeatureConfigurations from "../modules/FeatureConfigurations";
import {app, ipcMain, ipcRenderer, Notification} from "electron";

export default class WaterReminder {
	static eventID = null;
	static notification = null;
	static res = null;

	static messages = [
		"Hydration check! Don't forget to sip some water. It's the simple things that keep us feeling good. Cheers to staying refreshed!",
		"Water break! Take a moment to hydrate and nourish yourself. Your body will thank you for the H2O boost. 💧",
		"Time to quench that thirst! Grab your water bottle and take a sip. Hydration is key, my friend. How much water have you had today?",
		"Friendly reminder to stay hydrated! Pour yourself a glass of water and let's keep that energy up. Hydration goals, here we come!",
		"H2Oh yeah! Let's make sure you're getting enough water today. Take a break and have a sip. Your body will appreciate the hydration boost!"
	]

	static start() {
		let raw = FeatureConfigurations.get("WaterReminder");
		raw.config = JSON.parse(raw.config);
		const res = WaterReminder.res = raw;

		if(res && res.status) {
			WaterReminder.notification = new Notification({
				title: app.getName(),
			});

			if(WaterReminder.eventID) clearInterval(WaterReminder.eventID);

			const type = res.config?.type === 'o' ? setTimeout : setInterval

			WaterReminder.eventID = type(() => {
				WaterReminder.notification.body = WaterReminder.messages[Date.now() % WaterReminder.messages.length];
				WaterReminder.notification.show();

				if(res.config.type === 'o') {
					FeatureConfigurations.setStatus({key: "WaterReminder", status: 0});
					WaterReminder.end();
				}


			}, res.config.duration || 36e5);

		}

	}

	static update() {
		const res = FeatureConfigurations.get('WaterReminder')
		if(res && res.status) {
			WaterReminder.start()
		} else {
			WaterReminder.end();
		}
	}


	static end() {
		if(WaterReminder.res && WaterReminder.eventID) {
			clearInterval(WaterReminder.eventID);
			WaterReminder.eventID = null;
		}
	}

}