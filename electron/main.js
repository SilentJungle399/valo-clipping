import { app, BrowserWindow, ipcMain } from "electron";
import ffmpeg from "fluent-ffmpeg";
import { promises, lstatSync } from "fs";
import { dirname, join } from "path";
import { PassThrough } from "stream";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: join(__dirname, "preload.cjs"),
		},
	});

	mainWindow.maximize();

	mainWindow.loadURL("http://localhost:3000");
	mainWindow.webContents.openDevTools();
};

ipcMain.handle("getFiles", async (ev, loc = process.env.USERPROFILE + "/Videos") => {
	const retfiles = [];

	const files = await promises.readdir(loc);
	let numFiles = files.filter((file) => file.endsWith(".mp4") || file.endsWith(".mkv")).length;

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
				data.duration = Math.floor(metadata.format.duration);
			});
		} else if (lstatSync(loc + "/" + file).isDirectory()) {
			retfiles.push({
				name: file,
				thumb: null,
				duration: 0,
			});
			numFiles++;
		}
	});

	// wait for all files to be processed
	while (retfiles.length < numFiles) {
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
