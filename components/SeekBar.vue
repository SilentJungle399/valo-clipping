<template>
	<div ref="seekbar" class="seekbar">
		<div class="timeline">
			<div
				v-for="kill in filteredKills"
				:style="`left: ${kill[0][0] / metadata.meta.format.duration / 10}%`"
				class="killstamp"
			>
				<span>x</span>
			</div>
		</div>
		<div class="progress"></div>
	</div>
</template>

<script setup lang="ts">
interface MetaData {
	kills: number[][];
	meta: any;
}

const props = defineProps<{
	metadata: MetaData;
}>();

const seekbar = ref<HTMLDivElement>();

const filteredKills = computed(() => {
	const kills = props.metadata.kills ? props.metadata.kills.filter((x) => x[1]) : [];
	const retKills: number[][][] = [];

	let curPush = [];
	for (let i = 0; i < kills.length - 1; i++) {
		const curKill = kills[i];

		if (curPush.length === 0) {
			curPush.push(curKill);
			continue;
		}

		const refKill = curPush[0];

		const width = seekbar.value!.clientWidth!;
		const gapPercent = ((curKill[0] - refKill[0]) * 0.001) / props.metadata.meta.format.duration; /* prettier-ignore */

		if (width * gapPercent < 10) {
			curPush.push(curKill);
		} else {
			retKills.push(curPush);
			curPush = [];
		}
	}

	return retKills;
});

onMounted(() => {
	const video = document.getElementById("video") as HTMLVideoElement;

	video.addEventListener("timeupdate", () => {
		const progress = (video.currentTime / video.duration) * 100;
		const progressBar = document.querySelector(".progress") as HTMLElement;
		progressBar.style.background = `linear-gradient(to right, #c0c0c0 ${progress}%, #e9e9e9 ${progress}%)`;
	});
});

const formatSeconds = (sec: number) => {
	const hours = Math.floor(sec / 3600);
	const minutes = Math.floor((sec % 3600) / 60);
	const seconds = Math.floor(sec % 60);
	return (
		(hours ? `${hours}:` : "") +
		`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
	);
};
</script>

<style scoped>
.seekbar {
	width: 95vw;
	margin-top: 20px;
	position: relative;
}

.progress {
	width: 100%;
	height: 40px;
	background: linear-gradient(to right, #c0c0c0 0%, #e9e9e9 0%);
	border-radius: 10px;
	transition: all 0.1s;
}

.timeline {
	width: 100%;
	height: 40px;
}

.killstamp {
	position: absolute;
}
</style>
