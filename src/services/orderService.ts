// This service handles only order related logic:
// 1. Create orders (normal & vip) with increasing ID
// 2. Maintain correct pending queue behavior:
//    - vip orders always stay grouped before normal orders
//    - New vip go behind existing vip
// 3. Assign available bots to pending orders
// 4. Start countdown via SimulationEngine when a bot picks up an order
// 5. Rollback logic if a processing bot is removed

import type { Ref } from "vue";
import { BotService, type Bot } from "./botService";
import { SimulationEngine } from "./simulationEngine";

export interface Order {
  id: string;
  status: "Pending" | "Processing" | "Completed";
  labelClass: string;
  bot?: string;
  isVip?: boolean;
}

export class OrderService {
  private counter = 10000;

  constructor(
    private pending: Ref<Order[]>,
    private processing: Ref<Order[]>,
    private completed: Ref<Order[]>,
    private botService: BotService,
    private simulation: SimulationEngine
  ) {}

  getPendingOrders(): Order[] {
    return this.pending.value;
  }

  getProcessingOrders(): Order[] {
    return this.processing.value;
  }

  getCompletedOrders(): Order[] {
    return this.completed.value;
  }

  // Add Order (Normal or VIP)
  addOrder(isVip = false) {
    const newOrder: Order = {
      id: String(this.counter++),
      status: "Pending",
      labelClass: "bg-yellow-100 text-yellow-800",
      isVip,
    };

    this.insertOrderWithVipRules(this.pending.value, newOrder);
    this.assignOrders(); // Assign immediately if bots are available
  }

  // Assign pending orders to idle bots
  assignOrders() {
    const idleBots = this.botService.getIdleBots();
    for (const bot of idleBots) {
      const nextOrder = this.pending.value.shift();
      if (!nextOrder) break; // No more orders
      this.startProcessing(bot, nextOrder);
    }
  }

  // Start processing: Update bot, track order as processing & start countdown
  startProcessing(bot: Bot, order: Order) {
    this.botService.assignOrderToBot(bot, order);

    const processingOrder: Order = {
      ...order,
      status: "Processing",
      labelClass: "bg-blue-100 text-blue-800",
      bot: bot.id,
    };

    this.processing.value.push(processingOrder);

    this.simulation.startCountdown(bot, () => {
      this.completeOrder(bot, order);
    });
  }

  // After countdown, complete the order and free the bot
  completeOrder(bot: Bot, order: Order) {
    this.botService.resetBot(bot);

    // Remove from processing
    const index = this.processing.value.findIndex((o) => o.id === order.id);
    if (index !== -1) this.processing.value.splice(index, 1);

    // Move to completed
    this.completed.value.push({
      ...order,
      status: "Completed",
      labelClass: "bg-green-100 text-green-800",
    });

    // Try to assign next order
    this.assignOrders();
  }

  // Insert orders respecting VIP grouping rules
  private insertOrderWithVipRules(queue: Order[], order: Order) {
    if (order.isVip) {
      // Insert after last VIP
      let insertAt = 0;
      while (insertAt < queue.length && queue[insertAt]?.isVip === true) {
        insertAt++;
      }
      queue.splice(insertAt, 0, order);
    } else {
      // Normal orders always go to the end
      queue.push(order);
    }
  }

  // 1. Find the order that the bot was processing
  // 2. Remove it from processing
  // 3. Reinsert it into the pending queue using VIP rules
  rollbackBotOrder(bot: Bot) {
    const orderId = bot.order;
    if (!orderId) return;

    const idx = this.processing.value.findIndex((o) => o.id === orderId);
    if (idx === -1) return;

    const [removed] = this.processing.value.splice(idx, 1);
    if (!removed) return;

    const returned: Order = {
      id: removed.id,
      status: "Pending",
      labelClass: "bg-yellow-100 text-yellow-800",
      isVip: removed.isVip,
    };

    this.insertOrderWithVipRules(this.pending.value, returned);
  }
}
