import {BrowserWindow, Notification, screen} from "electron";
import path from "path";
import DB from "../DB";

class Blinker {
	static status = false;
	static window = null;

	static catchException(block) {
		try {
			return block();
		} catch (e) {
			new Notification({
				title: "Baymax",
				body: "Hi, I caught an exception!\n" + e.toString()
			})
		}
		return false;
	}

	static init() {
		const record = DB.statements.getConfig.get('blinker');
		if(record) {
			Blinker.status = record.status;
			if(Blinker.status) {
				Blinker.run();
			}
		}
	}


	static run() {
		let blinkerWindow = Blinker.window;
		if(!blinkerWindow) {

			blinkerWindow = new BrowserWindow({
				transparent: true,
				frame: false,
				skipTaskbar: true,
				width: 200 * 0.50,
				height: 122 * 0.50,
				hasShadow: false,
				alwaysOnTop: true,
				focusable: false
			});

			Blinker.window = blinkerWindow;
		}
		// let scr = screen.getPrimaryDisplay();
		// blinkerWindow.setPosition(scr.bounds.width - 100, scr.bounds.height - 100 - 40);
		blinkerWindow.setIgnoreMouseEvents(true);
		blinkerWindow.loadFile(path.join(process.env.NODE_ENV === "development" ? "./src/" : process.resourcesPath, "static/svg/eye.svg")).then(null);
		blinkerWindow.hide();

		const interval = setInterval(function () {
			if(Blinker.status) {
				blinkerWindow.show();
				setTimeout(() => blinkerWindow.hide(), 1000);
			} else {
				clearInterval(interval);
				blinkerWindow.close();
			}
		}, 4000);
	}
}

export default Blinker;