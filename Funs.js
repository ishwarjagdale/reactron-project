import Store from "./Store";

function getDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = (today.getMonth() + 1).toString(); // Months start at 0!
    let dd = today.getDate().toString();

    mm = mm.padStart(2, '0');
    dd = dd.padStart(2, '0');

    return dd + '-' + mm + '-' + yyyy;
}


function LogScreenTime(when) {
    const store = new Store({});
    const screenTime = store.getObj('screenTime');
    const todayDate = getDate();
    const screenLogs = screenTime[todayDate] || [];
    let obj = {
        on: when,
        date: Date.now()
    };

    let currentST = screenTime.currentST || 0;

    if(screenLogs.length === 0) {
        if(obj.on === "suspend") {
            const date = new Date();
            currentST += date.getMilliseconds();
        }
    } else {
        let lastObj = screenLogs[screenLogs.length - 1];
        if(lastObj.on === "suspend") {
            if(obj.on === "suspend") {
                while (screenLogs.length && screenLogs[screenLogs.length - 1].on === "suspend") {
                    screenLogs.pop();
                }
                if(screenLogs.length === 0) {
                    const date = new Date();
                    currentST += date.getMilliseconds();
                } else {
                    lastObj = screenLogs[screenLogs.length - 1];
                    currentST += (obj.date - lastObj.date);
                }
            }
        } else {
            if(obj.on === "suspend") {
                currentST += (obj.date - lastObj.date);
            } else {
                obj = null;
            }
        }
    }

    if(obj)
        screenLogs.push(obj);

    screenTime[todayDate] = screenLogs;
    screenTime.currentST = currentST;

    store.setObj('screenTime', screenTime);

}


function ComputeScreenTime() {
        const store = new Store({});
        const screenTime = store.getObj('screenTime');
        const date = getDate();
        const screenLogs = screenTime[date];

        let timeInMilSeconds = screenTime.currentST;

        if(screenLogs.length !== 0) {
            timeInMilSeconds += (Date.now() - screenLogs[screenLogs.length - 1].date);
        }

        let seconds = Number.parseInt((timeInMilSeconds / 1000).toString());
        let minutes = Number.parseInt((seconds / 60).toString());
        let hours = Number.parseInt((minutes / 60).toString());

        hours %= 24;
        minutes %= 60;
        seconds %= 60;

        console.log({
            hours: hours,
            minutes: minutes,
            seconds: seconds
        });

        return {
            hours: hours,
            minutes: minutes,
            seconds: seconds
        };

}

export { getDate, LogScreenTime, ComputeScreenTime };