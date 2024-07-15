const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("ipc", {
	getFiles: () => ipcRenderer.invoke("getFiles"),
});
