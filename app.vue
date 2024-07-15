<template>
	<div class="container">
	</div>
</template>

<script setup>
onMounted(async () => {
	const files = await window.ipc.getFiles();
	console.log(files);
});
</script>

<style>
body {
	background: #000;
}

.container {
	display: flex;
	flex-direction: column;
	align-items: center;
}
</style>
