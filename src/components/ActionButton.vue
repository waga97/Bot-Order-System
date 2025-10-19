<script setup lang="ts">
defineProps<{
  color: "primary" | "secondary" | "danger";
  label: string;
}>();

const colorMap = {
  primary: "bg-gray-100 hover:bg-gray-500/30 ",
  secondary: "bg-yellow-100 text-yellow-800 hover:bg-yellow-500/30",
  danger: "bg-red-100 text-red-800 hover:bg-red-500/30",
};
</script>

<template>
  <button
    :class="[
      'flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-lg shadow-md focus:outline-none cursor-pointer',
      colorMap[color],
    ]"
  >
    <span>{{ label }}</span>
  </button>
</template>
