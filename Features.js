import {BrowserWindow, Notification, screen} from "electron";
import path from "path";
import DB from "./DB";

class FeaturePackage {
	static features = {
		blinker: {
			status: false,
			call: FeaturePackage.blinker
		}
	}

	static catchException(block) {
		try {
			return block();
		} catch (e) {
			new Notification({
				title: "Baymax",
				subtitle: "Hi, I caught an exception!",
				body: e.toString()
			})
		}
		return false;
	}

	static initialize() {
		Object.keys(FeaturePackage.features).map((feature) => {
			const featureRecord = DB.statements.getConfig.get(feature);
			if(featureRecord) {
				FeaturePackage.features[feature].status = featureRecord.status;
				if(FeaturePackage.features[feature].status) {
					FeaturePackage.features[feature].call();
				}
			}
		});
	}

	static test() {
		console.log(path.resolve("src/index.html"));
	}

	static blinker() {
		const blinkerWindow = new BrowserWindow({
			transparent: true,
			frame: false,
			skipTaskbar: true,
			width: 200 * 0.50,
			height: 122 * 0.50,
			hasShadow: false,
			alwaysOnTop: true,
			focusable: false
		});
		let scr = screen.getPrimaryDisplay();
		// blinkerWindow.setPosition(scr.bounds.width - 100, scr.bounds.height - 100 - 40);
		blinkerWindow.setIgnoreMouseEvents(true);
		blinkerWindow.loadFile(path.join(process.env.NODE_ENV === "development" ? "./src/" : process.resourcesPath, "static/svg/eye.svg")).then(null);
		blinkerWindow.hide();

		const interval = setInterval(function () {
			if(FeaturePackage.features.blinker.status) {
				blinkerWindow.show();
				setTimeout(() => blinkerWindow.hide(), 1000);
			} else {
				clearInterval(interval);
				blinkerWindow.close();
			}
		}, 4000);
	}
}

export default FeaturePackage;