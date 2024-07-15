<template>
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
</template>

<script setup>
import NProgress from "nprogress";

NProgress.start();
const files = ref();
const router = useRouter();

watch(files, () => {
	files.value.sort((a, b) => {
		if (a.thumb && !b.thumb) return 1;
		if (!a.thumb && b.thumb) return -1;
		return a.name.localeCompare(b.name);
	});
	NProgress.done();
});

onMounted(async () => {
	const path = localStorage.getItem("path");
	if (path) {
		files.value = await window.ipc.getFiles(path);
	} else {
		files.value = await window.ipc.getFiles();
	}
});

const handleFileClick = async (item) => {
	NProgress.start();
	if (item.path) {
		files.value = await window.ipc.getFiles(item.path);
		localStorage.setItem("path", item.path);
	} else {
		router.push(`/video/${item.name}`);
	}
};
</script>

<style>
.directory-browser {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: center;
}
</style>
