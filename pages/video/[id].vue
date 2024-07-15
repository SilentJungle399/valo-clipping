<template>
	<video :src="vidSrc" controls></video>
</template>

<script setup>
import NProgress from "nprogress";
const vidSrc = ref("");
const route = useRoute();

onMounted(async () => {
	vidSrc.value = localStorage.getItem("path") + "/" + route.params.id;
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
