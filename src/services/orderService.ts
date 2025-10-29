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

export type OrderPriority = "VIP" | "Normal";

export interface Order {
  id: string;
  status: "Pending" | "Processing" | "Completed";
  labelClass: string;
  bot?: string;
  priority: OrderPriority;
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

  addOrder(priority: OrderPriority = "Normal") {
    const newOrder: Order = {
      id: String(this.counter++),
      status: "Pending",
      labelClass: "bg-yellow-100 text-yellow-800",
      priority,
    };

    this.insertOrderWithPriority(this.pending.value, newOrder);
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

  /**
   * Inserts a new order into the queue respecting multi tier priority rules.
   * Order of precedence: VIP > NORMAL
   * Within the same tier, preserve FIFO order.
   */
  private insertOrderWithPriority(queue: Order[], order: Order) {
    const priorityRank = { VIP: 2, Normal: 1 } as const;
    let insertAt = queue.length;

    const newRank = priorityRank[order.priority];

    for (let i = 0; i < queue.length; i++) {
      const existing = queue[i];
      if (!existing) continue;

      const existingRank = priorityRank[existing.priority];
      if (newRank > existingRank) {
        insertAt = i;
        break;
      }
    }

    queue.splice(insertAt, 0, order);
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
      priority: removed.priority,
    };

    this.insertOrderWithPriority(this.pending.value, returned);
  }
}
