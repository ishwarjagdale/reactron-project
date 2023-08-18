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
    const epoch = when === "suspend" ? -Date.now() : Date.now();
    if(todayDate in screenTime)
        screenTime[todayDate].push(epoch);
    else
        screenTime[todayDate] = [epoch];
    store.setObj('screenTime', screenTime);
}


function ComputeScreenTime() {

        const store = new Store({});
        const screenTime = store.getObj('screenTime');
        const screenLogs = screenTime[getDate()];
        let timeInMilSeconds = 0;
        let n = screenLogs.length;
        if(screenLogs.length % 2 !== 0) {
            n -= 1;
        }
        let i = 0;
        while(i + 1 < n) {
            timeInMilSeconds += Math.abs(screenLogs[i] + screenLogs[i + 1]);
            i += 2;
        }

        if(screenLogs.length % 2 !== 0) {
            timeInMilSeconds += (Date.now() - screenLogs[screenLogs.length - 1]);
        }

        let second = Number.parseInt((timeInMilSeconds / 1000).toString());
        let minute = Number.parseInt((second / 60).toString());
        let hour = Number.parseInt((minute / 60).toString());

        hour %= 24;
        minute %= 60;
        second %= 60;

        console.log({
            hour: hour,
            minute: minute,
            second: second
        });

        return {
            hour: hour,
            minute: minute,
            second: second
        };

}

export { getDate, LogScreenTime, ComputeScreenTime };