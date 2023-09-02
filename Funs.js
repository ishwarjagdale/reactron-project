import {store} from "./Store";
import {logger} from "./Logger";
import {app} from "electron";

function getDate(date=null) {
    let today;
    if(date !== null) {
        if(typeof date === "number") {
            today = new Date(date);
        } else {
            today = date;
        }
    } else {
        today = new Date();
    }
    const yyyy = today.getFullYear();
    let mm = (today.getMonth() + 1).toString(); // Months start at 0!
    let dd = today.getDate().toString();

    mm = mm.padStart(2, '0');
    dd = dd.padStart(2, '0');

    return dd + '-' + mm + '-' + yyyy;
}

function getEpoch(date=null) {
    let today;
    if(date !== null) {
        if(typeof date === "number") {
            today = new Date(date);
        } else {
            today = date;
        }
    } else {
        today = new Date();
    }
    return new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
}

function LogScreenTime(on, epoch=null) {
    const screenTime = store.getObj('screenTime');
    const todayDate = getDate();
    const screenLogs = screenTime[todayDate] || [];

    if(screenLogs.length && on === "start-up" && screenLogs[screenLogs.length - 1].on === "suspend") {
        return;
    }

    let obj = {
        on: on,
        date: epoch || Date.now()
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


function ComputeScreenTime(screenTime = null, ms = false) {
    if(!screenTime) {
        screenTime = store.getObj('screenTime');
    }

    const epoch = getEpoch();
    const today = getDate();
    const logs = screenTime[today] || [];

    let timeInMilSeconds = 0;
    const procLogs = [];
    if(logs.length) {
        let i = 0;
        if(logs[i].on === "suspend") {
            procLogs.push({start: 0, end: logs[i].date - epoch});
            timeInMilSeconds += logs[i].date - epoch
            i += 1;
        }
        while(i + 1 < logs.length) {
            procLogs.push({start: logs[i].date - epoch, end: logs[i + 1].date - epoch});
            timeInMilSeconds += (logs[i + 1].date - epoch) - (logs[i].date - epoch);
            i += 2;
        }
        while(i < logs.length) {
            procLogs.push({start: logs[i].date - epoch, end: Date.now() - epoch});
            timeInMilSeconds += (Date.now() - epoch) - (logs[i].date - epoch);
            i += 1;
        }
    }

    if(!ms) {
        return procLogs;
    }

    let seconds = Number.parseInt((timeInMilSeconds / 1000).toString());
    let minutes = Number.parseInt((seconds / 60).toString());
    let hours = Number.parseInt((minutes / 60).toString());

    hours %= 24;
    minutes %= 60;
    seconds %= 60;

    return {
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };

}

function LogApplicationChange(chunk) {
    chunk = chunk.toString().split('\n').map(r => r.trim()).filter(r => r.length).pop()
    try {
        chunk = JSON.parse(chunk);
        const appUsage = store.getObj('appUsage');
        const todayUsage = appUsage[getDate()] || {};
        let lastProc = appUsage._;

        if(lastProc && lastProc.process && lastProc.epoch) {
            let then = getDate(lastProc.epoch);
            let now = getDate();

            if(then !== now) {
                const thenUsage = appUsage[then] || {};
                thenUsage[lastProc.process] = Math.abs((thenUsage[lastProc.process] || 0) + ((getEpoch(lastProc.epoch) + (36e5 * 24)) - lastProc.epoch));

                appUsage[then] = thenUsage;
            } else {
                todayUsage[lastProc.process] = Math.abs((todayUsage[lastProc.process] || 0) + (Date.now() - lastProc.epoch));

                appUsage[now] = todayUsage;
            }
        }

        lastProc = {process: chunk.process, epoch: Date.now()};
        appUsage._ = lastProc;

        store.setObj('appUsage', appUsage);
    } catch (e) {
        console.log(e);
        logger.log(e);
    }
}

function GetAppUsages() {
    const appUsage = store.getObj('appUsage');
    const todayUsage = appUsage[getDate()] || {};
    return Object.keys(todayUsage).map((k) => {
        return {
            name: k,
            path: k,
            usage: todayUsage[k]
        }
    })
}

export { getDate, LogScreenTime, ComputeScreenTime, getEpoch, LogApplicationChange, GetAppUsages };