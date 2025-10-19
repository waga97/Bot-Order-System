<!-- <script setup lang="ts">
import { ref, computed } from "vue";
import OrderSection from "@/components/OrderSection.vue";
import BotTable from "@/components/BotTable.vue";
import ActionButton from "@/components/ActionButton.vue";
import type { Bot } from "@/services/botService";
import type { Order } from "@/services/orderService";

// -----------------------
// State (start empty)
// -----------------------
const orderCounter = ref(10000);
const pendingOrders = ref<Order[]>([]);
const processingOrders = ref<Order[]>([]);
const completedOrders = ref<Order[]>([]);
const bots = ref<Bot[]>([]);

// -----------------------
// Computed
// -----------------------
const activeBots = computed(() => bots.value.length);

// -----------------------
// Core Functions
// -----------------------

// Add Normal or VIP Order
function addOrder(isVip = false) {
  const newOrder: Order = {
    id: String(orderCounter.value++),
    status: "Pending",
    labelClass: "bg-yellow-100 text-yellow-800",
    isVip,
  };

  if (isVip) {
    // VIPs go to front of queue
    pendingOrders.value.unshift(newOrder);
  } else {
    pendingOrders.value.push(newOrder);
  }

  assignOrdersToIdleBots();
}

// assign pending orders to idle bots
function assignOrdersToIdleBots() {
  const idleBots = bots.value.filter((b) => b.status === "Idle");
  for (const bot of idleBots) {
    const nextOrder = pendingOrders.value.shift();
    if (!nextOrder) break;
    processOrder(bot, nextOrder);
  }
}

// Process an order
function processOrder(bot: Bot, order: Order) {
  bot.status = "Processing";
  bot.order = `#${order.id}`;
  bot.timeLeft = 10;
  bot.colorClass = "bg-blue-100 text-blue-800";

  const processingOrder: Order = {
    ...order,
    status: "Processing",
    labelClass: "bg-blue-100 text-blue-800",
    bot: bot.id,
  };

  processingOrders.value.push(processingOrder);

  // Countdown simulation
  const interval = setInterval(() => {
    if (bot.timeLeft && bot.timeLeft > 0) {
      bot.timeLeft--;
    }
  }, 1000);

  // After 10s complete order
  setTimeout(() => {
    clearInterval(interval);
    completeOrder(bot, order);
  }, 10000);
}

// Move order to completed
function completeOrder(bot: Bot, order: Order) {
  bot.status = "Idle";
  bot.order = null;
  bot.timeLeft = null;
  bot.colorClass = "bg-gray-200 ";

  const index = processingOrders.value.findIndex((o) => o.id === order.id);
  if (index !== -1) processingOrders.value.splice(index, 1);

  completedOrders.value.push({
    ...order,
    status: "Completed",
    labelClass: "bg-green-100 text-green-800",
  });

  assignOrdersToIdleBots();
}

// Add a new bot
function addBot() {
  const newBotId = `Bot #${bots.value.length + 1}`;
  bots.value.push({
    id: newBotId,
    status: "Idle",
    order: null,
    timeLeft: null,
    colorClass: "bg-gray-200 ",
  });

  assignOrdersToIdleBots();
}

// Remove last bot (only if idle)
function removeBot() {
  const lastBot = bots.value[bots.value.length - 1];
  if (lastBot && lastBot.status === "Idle") {
    bots.value.pop();
  }
}
</script> -->

<script setup lang="ts">
import { ref, computed } from "vue";
import BotTable from "@/components/BotTable.vue";
import ActionButton from "@/components/ActionButton.vue";
import OrderSection from "@/components/OrderSection.vue";
import { BotService, type Bot } from "@/services/botService";
import { OrderService, type Order } from "@/services/orderService";
import { SimulationEngine } from "@/services/simulationEngine";

// State
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
