<template>
	<div ref="seekbar" class="seekbar">
		<div class="timeline">
			<div
				v-for="kills in filteredKills"
				:style="`left: calc(${kills[0][0] / metadata.meta.format.duration / 10}% - 15px)`"
				class="killstamp"
				@mouseenter="() => mouseenterEffect(kills)"
				@mouseleave="(e) => mouseoutEffect(filteredKills.indexOf(kills), e)"
			>
				<kill-tool-tip
					:group="kills"
					v-if="showKillIndex === filteredKills.indexOf(kills)"
					@mouseenter="(e) => (preventDisappear = true)"
					@mouseleave="(e) => (preventDisappear = false)"
				></kill-tool-tip>
				<div class="killicon" @click="() => seekVideo(kills[0][0])">
					<span style="margin: auto">x</span>
				</div>
			</div>
		</div>
		<div class="progress">
			<div class="peg" ref="peg"></div>
			<div
				class="clip"
				v-if="clip[1] - clip[0] !== 0 && metadata.meta"
				ref="clipDiv"
				:style="`
					left: ${(clip[0] * 100) / metadata.meta.format.duration}%; 
					width: ${((clip[1] - clip[0]) * 100) / metadata.meta.format.duration}%;
				`"
			>
				<div class="dragpoint start" @mousedown="(e) => mouseDownPoint(e, 0)"></div>
				<div
					style="width: 100%"
					ref="spaceCheck"
					@mousedown="(e) => mouseDownPoint(e, -1)"
				></div>
				<div class="dragpoint end" @mousedown="(e) => mouseDownPoint(e, 1)"></div>
			</div>
		</div>

		<div class="toggle-buttons">
			<button class="toggle" @click="manageClip">
				{{ clip[1] - clip[0] ? "Remove clip" : "Add clip" }}
			</button>
		</div>
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
const clipDiv = ref<HTMLDivElement>();
const spaceCheck = ref<HTMLDivElement>();
const peg = ref<HTMLDivElement>();

const showKillIndex = ref<number | null>(null);
const preventDisappear = ref(false);
const curTimeout = ref<any>(null);
const clip = ref<number[]>([0, 0]);

const seekVideo = (time: number) => {
	const video = document.getElementById("video") as HTMLVideoElement;
	video.currentTime = Math.floor(time / 1000);
};

const mouseoutEffect = (killNo: number, e: MouseEvent) => {
	curTimeout.value = setTimeout(() => {
		if (preventDisappear.value) return;
		showKillIndex.value = null;
	}, 200);
};

const mouseenterEffect = (kills: number[][]) => {
	if (curTimeout.value) clearTimeout(curTimeout.value);
	showKillIndex.value = filteredKills.value.indexOf(kills);
};

const resolveBounds = (val: number, min: number, max: number) => {
	return Math.min(Math.max(val, min), max);
};

// prettier-ignore
const dragKeypoint = (
	e: MouseEvent,
	idx: number,
	startPointX: number,
	initLeft: number,
	initWidth: number,
	spaceWidth: number
) => {
	const movePercent = ((e.clientX - startPointX) * 100) / seekbar.value!.clientWidth;
	const video = document.getElementById("video") as HTMLVideoElement;
	if (idx === 0) {
		const leftPlacement = resolveBounds(initLeft + movePercent, 0, initLeft + spaceWidth);
		const widthPlacement = resolveBounds(initWidth - movePercent, 0, initLeft + initWidth)
		clipDiv.value!.style.width = `${widthPlacement}%`;
		clipDiv.value!.style.left = `${leftPlacement}%`;
		video.currentTime = leftPlacement * props.metadata.meta.format.duration / 100;
		clip.value[0] = leftPlacement * props.metadata.meta.format.duration / 100
	} else if (idx === 1) {
		const widthPlacement = resolveBounds(initWidth + movePercent, 0, 100 - initLeft)
		clipDiv.value!.style.width = `${widthPlacement}%`;
		video.currentTime = (initLeft + widthPlacement) * props.metadata.meta.format.duration / 100;
		clip.value[1] = (initLeft + widthPlacement) * props.metadata.meta.format.duration / 100;
	} else if (idx === -1) {
		const leftPlacement = resolveBounds(initLeft + movePercent, 0, 100 - initWidth)
		clipDiv.value!.style.left = `${leftPlacement}%`;
		video.currentTime = leftPlacement * props.metadata.meta.format.duration / 100;
		
		clip.value = [
			leftPlacement * props.metadata.meta.format.duration / 100,
			(leftPlacement + initWidth) * props.metadata.meta.format.duration / 100
		]
	}
};

const mouseDownPoint = (e: MouseEvent, idx: number) => {
	console.log(e.target, idx);
	const initLeft = parseFloat(clipDiv.value!.style.left.slice(0, -1));
	const initWidth = parseFloat(clipDiv.value!.style.width.slice(0, -1));
	const spaceWidth = (spaceCheck.value!.clientWidth * 100) / seekbar.value!.clientWidth;

	const evListener = (_e: MouseEvent) =>
		dragKeypoint(_e, idx, e.clientX, initLeft, initWidth, spaceWidth);
	const removeListener = (_e: MouseEvent) => {
		console.log("up called");
		window.removeEventListener("mousemove", evListener);
		window.removeEventListener("mouseup", removeListener);
	};

	window.addEventListener("mousemove", evListener);
	window.addEventListener("mouseup", removeListener);
};

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

		if (width * gapPercent < 20) {
			curPush.push(curKill);
		} else {
			retKills.push(curPush);
			curPush = [];
		}
	}

	return retKills;
});

const manageClip = () => {
	if (clip.value[1] - clip.value[0] != 0) {
		clip.value = [0, 0];
	} else {
		const video = document.getElementById("video") as HTMLVideoElement;
		clip.value = [video.currentTime, video.currentTime + 15];
	}
};

onMounted(() => {
	const video = document.getElementById("video") as HTMLVideoElement;

	video.addEventListener("timeupdate", () => {
		if (Math.floor(video.currentTime) === Math.floor(clip.value[1])) {
			video.currentTime = clip.value[0];
		}

		const progress = (video.currentTime / video.duration) * 100;
		const progressBar = document.querySelector(".progress") as HTMLElement;
		progressBar.style.background = `linear-gradient(to right, #c0c0c0 ${progress}%, #e9e9e9 ${progress}%)`;
		peg.value!.style.left = `${progress}%`;
	});
});
</script>

<style scoped>
.seekbar {
	width: 95vw;
	margin-top: 20px;
	position: relative;
}

.segment {
	display: flex;
}

.toggle-buttons {
	display: flex;
	gap: 20px;
	margin-top: 10px;
}

.toggle {
	padding: 5px 15px;
}

.progress {
	width: 100%;
	height: 60px;
	background: linear-gradient(to right, #c0c0c0 0%, #e9e9e9 0%);
	border-radius: 10px;
	position: relative;
	transition: all 0.1s;
}

.clip {
	height: inherit;
	display: flex;
	width: 50%;
	position: absolute;
	cursor: move;
	background-color: #583da15f;
	user-select: none;
}

.peg {
	position: absolute;
	width: 1px;
	height: 120%;
	transform: translate(0px, -10%);
	background-color: indianred;
}

.dragpoint {
	width: 7px;
	height: 110%;
	background-color: #583da1;
	box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
	cursor: e-resize;
	flex-shrink: 0;
	content: "";
	transform: translate(0px, -5%);
	display: block;
}

.start {
	border-top-left-radius: 5px;
	border-bottom-left-radius: 5px;
}
.end {
	border-top-right-radius: 5px;
	border-bottom-right-radius: 5px;
}

.timeline {
	width: 100%;
	height: 40px;
}

.killstamp {
	position: absolute;
	display: flex;
	border-radius: 50%;
}

.killicon:hover {
	background-color: #e9e9e9;
}

.killicon {
	height: 30px;
	width: 30px;
	transition: all 0.2s;
	border-radius: 50%;
	user-select: none;
	cursor: pointer;
	display: flex;
}
</style>
