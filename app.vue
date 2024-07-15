<template>
	<div class="container">
		<input type="file" accept="video/*" @change="checkUpload" />
		<button @click="cleanPlayer">Close</button>

		<video ref="videoPlayer" v-show="showPlayer" width="300"></video>
	</div>
</template>

<script setup>
const videoPlayer = ref(null);
const showPlayer = ref(false);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checkUpload = (e) => {
	const file = e.target.files[0];
	if (!file) return (showPlayer.value = false);

	const url = URL.createObjectURL(file);
	videoPlayer.value.src = url;
	showPlayer.value = true;
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
