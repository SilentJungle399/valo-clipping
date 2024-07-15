<template>
	<div class="container">
		<div class="search">
			<button class="back" @click="goBack">Back</button>
			<input type="text" class="path" v-model="locationPath" />
		</div>
		<div class="directory-browser">
			<Video
				v-for="item in files"
				:key="item.name"
				:name="item.name"
				:duration="item.duration"
				:thumb="item.thumb"
				@click="() => handleFileClick(item)"
			></Video>
		</div>
	</div>
</template>

<script setup>
import NProgress from "nprogress";

NProgress.start();
const files = ref(await window.ipc.getFiles());
const locationPath = ref("");

onMounted(async () => {
	const path = localStorage.getItem("path");
	if (path) {
		files.value = await window.ipc.getFiles(path);
		locationPath.value = path;
	}
	NProgress.done();
});

const handleFileClick = async (item) => {
	NProgress.start();
	if (item.path) {
		files.value = await window.ipc.getFiles(item.path);
		localStorage.setItem("path", item.path);
		locationPath.value = item.path;
		NProgress.done();
	}
};

const goBack = async () => {
	NProgress.start();
	const path = localStorage.getItem("path");
	if (path) {
		const newPath = path.split("/").slice(0, -1).join("/");
		files.value = await window.ipc.getFiles(newPath);
		localStorage.setItem("path", newPath);
		locationPath.value = newPath;
		NProgress.done();
	}
};
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
	flex-direction: column;
	align-items: center;
}

.search {
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	margin: 20px 0;
}

.back {
	background: #f0f0f0;
	border: none;
	border-radius: 5px;
	padding: 10px 20px;
	margin-right: 10px;
	cursor: pointer;
	transition: all 0.3s;
}

.back:hover {
	background: #e0e0e0;
}

.path {
	background: #f0f0f0;
	border: none;
	border-radius: 5px;
	padding: 10px 20px;
	outline: none;
	transition: all 0.3s;
	border: 1px solid #f0f0f0;
}

.path:focus {
	border-color: #d0d0d0;
}

.directory-browser {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: center;
}
</style>
