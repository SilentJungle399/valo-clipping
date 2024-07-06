<template>
	<div class="">
		<input type="file" accept="video/*" @change="checkUpload" />

		<video controls ref="videoPlayer"></video>
	</div>
</template>

<script setup>
const videoPlayer = ref(null);

const checkUpload = (e) => {
	const file = e.target.files[0];
	if (!file) return;

	const url = URL.createObjectURL(file);
	videoPlayer.value.src = url;
	videoPlayer.value.play();
};
</script>
