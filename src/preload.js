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
    }
    // getScreenTime: (callback) => ipcRenderer.on('screenTime', callback)
})
