<template>
	<div class="container">
		<input type="file" accept="video/*" @change="checkUpload" />
		<button @click="cleanPlayer">Close</button>

		<video controls ref="videoPlayer" v-show="showPlayer" width="300"></video>
	</div>
</template>

<script setup>
const videoPlayer = ref(null);
const showPlayer = ref(false);

const { $io } = useNuxtApp();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checkUpload = (e) => {
	const file = e.target.files[0];
	if (!file) return (showPlayer.value = false);

	const url = URL.createObjectURL(file);
	videoPlayer.value.src = url;
	showPlayer.value = true;

	const videoFile = e.target.files[0];

	const chunkSize = 0.5 * 1024 * 1024; // 1MB chunks (adjust as needed)
	let chunkStart = 0;
	let totalChunks = Math.ceil(videoFile.size / chunkSize);

	const reader = new FileReader();
	reader.onload = async (e) => {
		const chunk = e.target.result;
		$io.emit("video_chunk", {
			name: videoFile.name,
			data: chunk,
			chunkNumber: chunkStart / chunkSize + 1,
			totalChunks,
		});
		chunkStart += chunkSize;

		if (chunkStart < videoFile.size) {
			reader.readAsArrayBuffer(videoFile.slice(chunkStart, chunkStart + chunkSize));
		} else {
			$io.emit("video_end", { name: videoFile.name }); // Signal end of transmission
		}
	};

	reader.readAsArrayBuffer(videoFile.slice(0, chunkSize));
};

const cleanPlayer = () => {
	showPlayer.value = false;
	videoPlayer.value.src = "";
};
</script>

<style>
body {
	background: #2e3440;
}

.container {
	display: flex;
	flex-direction: column;
	align-items: center;
}
</style>
