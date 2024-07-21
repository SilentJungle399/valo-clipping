<template>
	<div class="video">
		<div class="thumbnail">
			<img :src="`data:image/jpeg;base64,${props.thumb}`" v-if="thumb" alt="thumb" />
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" v-else>
				<path
					d="M64 480H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H288c-10.1 0-19.6-4.7-25.6-12.8L243.2 57.6C231.1 41.5 212.1 32 192 32H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64z"
				/>
			</svg>
			<span v-if="thumb" class="duration">
				{{ formatSeconds(duration) }}
			</span>
		</div>
		<span class="name" :title="name">{{
			name.length > 30 ? name.slice(0, 30) + "..." : name
		}}</span>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	name: string;
	duration: number;
	thumb: string | null;
}>();

const formatSeconds = (sec: number) => {
	const hours = Math.floor(sec / 3600);
	const minutes = Math.floor((sec % 3600) / 60);
	const seconds = sec % 60;
	return (
		(hours ? `${hours}:` : "") +
		`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
	);
};
</script>

<style scoped>
.video {
	display: flex;
	flex-direction: column;
	margin: 10px 25px;
	background-color: #f0f0f0;
	width: 400px;
	height: 280px;
	border-radius: 10px;
	transition: all 0.3s;
}

.video:hover {
	cursor: pointer;
	box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
}

.thumbnail {
	display: flex;
	flex-direction: column;
	background-color: #fff;
	justify-content: center;
	position: relative;
	border-radius: 10px;
	height: 100%;
}

.duration {
	position: absolute;
	bottom: 5px;
	right: 0;
	background: rgba(0, 0, 0, 0.5);
	color: #fff;
	padding: 2px 5px;
	margin: 5px 7px;
	border-radius: 5px;
}

.name {
	font-weight: 500;
	margin: 15px 30px;
	user-select: none;
}

img {
	width: 400px;
	height: auto;
	border-radius: 6px;
}

svg {
	fill: #583da1;
	width: 190px;
	position: absolute;
	top: 15px;
	left: 30px;
	filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.5));
}
</style>
