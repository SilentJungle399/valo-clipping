<template>
	<div class="container">
		<div class="search">
			<input
				type="text"
				class="path"
				v-model="locationPath"
				@keypress="searchKeypress"
				placeholder="Enter path to open another folder"
			/>
		</div>

		<NuxtPage />
	</div>
</template>

<script setup>
import NProgress from "nprogress";

const router = useRouter();
const locationPath = ref("");

onMounted(async () => {
	const path = localStorage.getItem("path");
	if (path) {
		locationPath.value = path;
	}
});

const searchKeypress = async (e) => {
	if (e.key === "Enter") {
		NProgress.start();
		localStorage.setItem("path", locationPath.value);
		router.push("/");
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

.path {
	background: #f0f0f0;
	border: none;
	border-radius: 5px;
	padding: 10px 20px;
	outline: none;
	transition: all 0.3s;
	border: 1px solid #f0f0f0;
	width: 600px;
}

.path:focus {
	border-color: #d0d0d0;
}
</style>
