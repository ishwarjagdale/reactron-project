import DB from "../DB";
import { Notification } from "electron";

class R202020 {
	static status = false;
	static notification = null;
	static evt = null;

	static init() {
		const record = DB.statements.getConfig.run('20-20-20');

		R202020.notification = new Notification({
			title: "Baymax",
			body: "time to look outside!"
		});

		if (record) {
			R202020.status = record.status;
			if(R202020.status) {
				R202020.run();
			}
		}
	}

	static run() {
		R202020.interval = setInterval(() => {
			if(R202020.status) {
				R202020.notification.show();
			} else {
				if(R202020.interval !== null)
					clearInterval(R202020.interval);
			}
		}, 12e5);
	}

	static end() {
		if(R202020.interval !== null) clearInterval(R202020.interval);
	}
}

export default R202020;