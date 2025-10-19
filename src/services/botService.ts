// This service handles only bot related logic:
// 1. Creating new bots
// 2. Tracking idle bots, used by OrderService to assign work
// 3. Removing the last bot

import type { Ref } from "vue";
import type { Order } from "./orderService";
export interface Bot {
  id: string;
  status: "Idle" | "Processing";
  order: string | null;
  timeLeft: number | null;
  colorClass: string;
}

export class BotService {
  constructor(private bots: Ref<Bot[]>) {}

  addBot() {
    const newBotId = `Bot #${this.bots.value.length + 1}`;
    this.bots.value.push({
      id: newBotId,
      status: "Idle",
      order: null,
      timeLeft: null,
      colorClass: "bg-gray-200 text-gray-800",
    });
  }

  /**
   * Safely remove the last bot.
   * If a bot is processing, trigger `onForceRemove(bot)` callback
   * to allow external logic to rollback order and stop timers.
   */
  removeBot(onForceRemove?: (bot: Bot) => void) {
    const lastBot = this.bots.value[this.bots.value.length - 1];
    if (!lastBot) return;

    // If bot is currently processing an order, caller should handle rollback logic
    if (lastBot.status === "Processing" && onForceRemove) {
      onForceRemove(lastBot);
    }

    // Now remove the bot (IDLE or already rolled back)
    this.bots.value.pop();
  }

  getAllBots(): Bot[] {
    return this.bots.value;
  }

  /**
   * Returns only bots that are idle (ready to take orders)
   */
  getIdleBots(): Bot[] {
    return this.bots.value.filter((b) => b.status === "Idle");
  }

  /**
   * Updates the bot to reflect that it has taken a job.
   */
  assignOrderToBot(bot: Bot, order: Order) {
    bot.status = "Processing";
    bot.order = `#${order.id}`;
    bot.timeLeft = 10;
    bot.colorClass = "bg-blue-100 text-blue-800";
  }

  /**
   * Resets bot back to Idle state after completing or rolling back order.
   */
  resetBot(bot: Bot) {
    bot.status = "Idle";
    bot.order = null;
    bot.timeLeft = null;
    bot.colorClass = "bg-gray-200";
  }
}
