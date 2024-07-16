<template>
	<div class="seekbar">
		<div class="progress"></div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	metadata: object;
}>();

onMounted(() => {
	const video = document.getElementById("video") as HTMLVideoElement;

	video.addEventListener("timeupdate", () => {
		const progress = (video.currentTime / video.duration) * 100;
		const progressBar = document.querySelector(".progress") as HTMLElement;
		progressBar.style.background = `linear-gradient(to right, #d0d0d0 ${progress}%, #e9e9e9 ${progress}%)`;
	});
});
</script>

<style scoped>
.seekbar {
	width: 95vw;
	height: 40px;
	margin-top: 20px;
}

.progress {
	height: 100%;
	width: 100%;
	background: linear-gradient(to right, #d0d0d0 0%, #f0f0f0 0%);
	border-radius: 10px;
	transition: all 0.1s;
}
</style>
