const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("ipc", {
	getFiles: (loc) => ipcRenderer.invoke("getFiles", loc),
});
