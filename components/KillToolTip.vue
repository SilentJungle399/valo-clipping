<template>
	<div class="group">
		<div class="kill" v-for="kill in group">x - {{ formatSeconds(kill[0] / 1000) }}</div>
	</div>
</template>

<script setup lang="ts">
import { formatSeconds } from "../utils";

const props = defineProps<{
	group: number[][];
}>();
</script>

<style scoped>
.group {
	display: flex;
	flex-direction: column;
	position: absolute;
	bottom: calc(100% + 5px);
	left: -9px;
	width: max-content;
	background: white;
	border-radius: 5px;
	transition: all 0.3s;
	box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
	user-select: none;
}

.kill {
	padding: 10px 20px;
}
</style>
