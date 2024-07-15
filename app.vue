<template>
	<div class="container">
		<Video
			v-for="item in files"
			:key="item.name"
			:name="item.name"
			:duration="item.duration"
			:thumb="item.thumb"
		></Video>
	</div>
</template>

<script setup>
const files = ref(await window.ipc.getFiles());
console.log(files);
// onMounted(async () => {
// 	;
// 	console.log(files);
// });
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");

body {
	font-family: "Poppins", sans-serif;
	background: #f6f6f6;
	/* color: #000; */
}

.container {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: center;
}
</style>
