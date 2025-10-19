<script setup lang="ts">
import type { Order } from "@/services/orderService";

defineProps<{
  title: string;
  orders: Order[];
}>();
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
    <h3 class="text-xl font-semibold mb-4">{{ title }}</h3>
    <div class="space-y-3">
      <div
        v-for="order in orders"
        :key="order.id"
        class="p-4 rounded-lg flex items-center justify-between"
        :class="[
          'bg-gray-100 border border-gray-200',
          order.isVip ? 'bg-blue-50 border-blue-200' : '',
        ]"
      >
        <!-- Left side -->
        <div class="flex items-center gap-2">
          <span class="font-medium">#{{ order.id }}</span>
          <span
            v-if="order.isVip"
            class="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full"
          >
            &#9733;
          </span>
        </div>

        <!-- Right side -->
        <div v-if="order.bot" class="flex items-center gap-2">
          <span
            :class="[
              'px-3 py-1 text-xs font-medium rounded-full',
              order.labelClass,
            ]"
          >
            {{ order.status }}
          </span>
          <span class="text-sm font-medium">({{ order.bot }})</span>
        </div>
        <span
          v-else
          :class="[
            'px-3 py-1 text-xs font-medium rounded-full',
            order.labelClass,
          ]"
        >
          {{ order.status }}
        </span>
      </div>
    </div>
  </div>
</template>
