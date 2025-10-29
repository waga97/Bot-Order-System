<script setup lang="ts">
import type { Bot } from "@/services/botService";

const props = defineProps<{ bot: Bot }>();
</script>

<template>
  <tr class="bg-background-light border-b">
    <td class="px-6 py-4 font-medium">{{ bot.id }}</td>
    <td class="px-6 py-4">
      <span
        :class="['px-3 py-1 text-xs font-medium rounded-full', bot.colorClass]"
        >{{ bot.status }}</span
      >
    </td>
    <td class="px-6 py-4 font-medium">
      {{ bot.order ? `#${bot.order}` : "-" }}
    </td>
    <td class="px-6 py-4">
      {{ bot.timeLeft !== null ? `${bot.timeLeft}s` : "-" }}
    </td>
  </tr>
</template>
