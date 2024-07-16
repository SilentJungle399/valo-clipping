<template>
	<video ref="video" id="video" :src="vidSrc" controls></video>
	<seek-bar :metadata="metadata"></seek-bar>
</template>

<script setup>
import NProgress from "nprogress";
const vidSrc = ref("");
const route = useRoute();
const metadata = ref({});
const video = ref(null);

onMounted(async () => {
	vidSrc.value = localStorage.getItem("path") + "/" + route.params.id;
	try {
		metadata.value = await window.ipc.getMetadata(vidSrc.value);
		console.log(metadata.value);
	} catch (e) {
		console.error(e);
	}
	const videoStream = metadata.value.meta.streams.find((stream) => stream.codec_type === "video");
	const fps = videoStream.r_frame_rate.split("/")[0] / videoStream.r_frame_rate.split("/")[1];

	document.addEventListener("keydown", (e) => {
		console.log(e.target.tagName);
		if (e.key === "ArrowLeft") {
			if (e.target.tagName === "VIDEO") return;
			video.value.currentTime -= e.ctrl ? 1 : 5;
		} else if (e.key === "ArrowRight") {
			if (e.target.tagName === "VIDEO") return;
			video.value.currentTime += e.ctrl ? 1 : 5;
		} else if (e.key === " ") {
			if (e.target.tagName === "VIDEO") return;
			video.value.paused ? video.value.play() : video.value.pause();
		} else if (e.key === ".") {
			video.value.currentTime += 1 / fps;
		} else if (e.key === ",") {
			video.value.currentTime -= 1 / fps;
		}
	});

	NProgress.done();
});
</script>

<style scoped>
video {
	max-width: 80vw;
	max-height: 70vh;
	border-radius: 10px;
}
</style>
