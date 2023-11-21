// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import {contextBridge, ipcRenderer} from "electron";

contextBridge.exposeInMainWorld('electronAPI', {
    closeWindow: () => ipcRenderer.send('closeWindow'),
    maximizeWindow: () => ipcRenderer.send('maximizeWindow'),
    minimizeWindow: () => ipcRenderer.send('minimizeWindow'),

    getScreenTime: (callback) => {
        ipcRenderer.on('updateScreenTime', callback);
        return ipcRenderer.invoke('screenTime');
    },

    getScreenLogs: (range) => {
        return ipcRenderer.invoke('screenLogs', range);
    },

    getAppUsages: (range) => {
        return ipcRenderer.invoke('appUsages', range);
    },
    // getScreenTime: (callback) => ipcRenderer.on('screenTime', callback)
    getConfig: (key) => {
        return ipcRenderer.invoke('getConfig', key);
    },

    toConfig: (key, status, options) => {
        return ipcRenderer.invoke('toConfig', key, status, options);
    },

    getAppVersion: () => {
        return ipcRenderer.invoke('appVersion');
    }
})
