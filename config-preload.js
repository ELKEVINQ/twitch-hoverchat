const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveChannel: (channel) => ipcRenderer.send('save-channel', channel),
    closeConfigWindow: () => ipcRenderer.send('close-config-window'),
    onLoadChannel: (callback) => ipcRenderer.on('load-channel', (event, channel) => callback(channel))
});
