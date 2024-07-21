export const formatSeconds = (sec: number) => {
	const showMs = localStorage.getItem("showMs");
	const hours = Math.floor(sec / 3600);
	const minutes = Math.floor((sec % 3600) / 60);
	const seconds = Math.floor(sec % 60);
	const ms = Math.floor((sec - Math.floor(sec)) * 1000);
	return (
		(hours ? `${hours}:` : "") +
		`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
		// + (showMs ? "." + String(ms).padStart(3, "0") : "")
	);
};
