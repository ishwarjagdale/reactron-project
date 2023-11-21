import DB from "../DB";

class WaterReminder {
	static status = false;
	static notification = null;
	static evt = null;

	static init() {
		const record = DB.statements.getConfig.get('water');

		if(record) {
			WaterReminder.status = record.status;
			if(record.status) {
				WaterReminder.run();
			} else {
				WaterReminder.end();
			}
		}
	}

	static run() {

	}

	static end() {
		if(WaterReminder.evt) {
			clearInterval(WaterReminder.evt);
		}
	}
}

export default WaterReminder