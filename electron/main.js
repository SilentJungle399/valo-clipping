import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { promises } from "fs";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: join(__dirname, "preload.cjs"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: false,
			allowRunningInsecureContent: true,
		},
	});

	mainWindow.loadURL("http://localhost:3000");
};

ipcMain.handle("getFiles", async (ev, loc = process.env.USERPROFILE + "/Videos") => {
	const retfiles = [];

	const files = await promises.readdir(loc);

	files.forEach((file, i) => {
		if (file.endsWith(".mp4") || file.endsWith(".mkv")) {
			const data = {
				name: file,
			};
			const stream = new PassThrough();
			ffmpeg(loc + "/" + file)
				.format("mjpeg")
				.frames(1)
				.on("end", function () {
					data.thumb = stream.read().toString("base64");
					retfiles.push(data);
				})
				.pipe(stream, { end: true }); // -vframes 1

			ffmpeg.ffprobe(loc + "/" + file, function (err, metadata) {
				data.duration = metadata.format.duration;
			});
		} else {
			retfiles.push({
				name: file,
				thumb: "",
				duration: 0,
			});
		}
	});

	// wait for all files to be processed
	while (retfiles.length < files.length) {
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	return retfiles;
});

app.whenReady().then(() => {
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
