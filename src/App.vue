<script setup lang="ts">
import { ref, computed } from "vue";
import BotTable from "@/components/BotTable.vue";
import ActionButton from "@/components/ActionButton.vue";
import OrderSection from "@/components/OrderSection.vue";
import { BotService, type Bot } from "@/services/botService";
import { OrderService, type Order } from "@/services/orderService";
import { SimulationEngine } from "@/services/simulationEngine";

const pendingOrders = ref<Order[]>([]);
const processingOrders = ref<Order[]>([]);
const completedOrders = ref<Order[]>([]);
const bots = ref<Bot[]>([]);

const simulation = new SimulationEngine();
const botService = new BotService(bots);
const orderService = new OrderService(
  pendingOrders,
  processingOrders,
  completedOrders,
  botService,
  simulation
);

const activeBots = computed(() => bots.value.length);

const addOrder = (isVip = false) => orderService.addOrder(isVip);

const addBot = () => {
  botService.addBot();
  orderService.assignOrders();
};

const removeBot = () => {
  botService.removeBot((bot) => {
    simulation.stopProcessing(bot);
    orderService.rollbackBotOrder(bot);
  });

  // After returning to pending, try to assign to any remaining bots
  orderService.assignOrders();
};
</script>

<template>
  <main class="container mx-auto px-4 sm:px-6 lg:px-6 py-6">
    <!-- Header -->
    <div
      class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
    >
      <h2 class="text-2xl font-bold">Dashboard</h2>
      <div class="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-2">
        <ActionButton
          color="primary"
          label="&plus; Normal Order"
          @click="addOrder()"
        />
        <ActionButton
          color="secondary"
          label="&plus; VIP Order"
          @click="addOrder(true)"
        />
      </div>
    </div>

    <!-- Order sections -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <OrderSection title="Pending Orders" :orders="pendingOrders" />
      <OrderSection title="Processing Orders" :orders="processingOrders" />
      <OrderSection title="Completed Orders" :orders="completedOrders" />
    </div>

    <!-- Bot Management -->
    <BotTable class="mt-4" :bots="bots" :activeCount="activeBots">
      <template #actions>
        <ActionButton color="primary" label="&plus; Bot" @click="addBot" />
        <ActionButton color="danger" label="&minus; Bot" @click="removeBot" />
      </template>
    </BotTable>
  </main>
</template>
