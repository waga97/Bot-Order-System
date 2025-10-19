<script setup lang="ts">
import BotRow from "@/components/BotRow.vue";
import type { Bot } from "@/services/botService";

defineProps<{
  bots: Bot[];
  activeCount: number;
}>();
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between mb-4"
    >
      <h3 class="text-xl font-semibold">Bot Management</h3>
      <div class="flex items-center gap-4 mt-4 md:mt-0">
        <p>
          Active Bots:
          <span class="font-bold text-lg">{{ activeCount }}</span>
        </p>
        <div class="flex gap-2">
          <slot name="actions" />
        </div>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left">
        <thead class="text-xs uppercase bg-gray-50">
          <tr>
            <th class="px-6 py-3">Bot ID</th>
            <th class="px-6 py-3">Status</th>
            <th class="px-6 py-3">Current Order</th>
            <th class="px-6 py-3">Time Left</th>
          </tr>
        </thead>
        <tbody>
          <BotRow v-for="bot in bots" :key="bot.id" :bot="bot" />
        </tbody>
      </table>
    </div>
  </div>
</template>
