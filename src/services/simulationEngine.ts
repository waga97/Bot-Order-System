// This service is responsible only for:
// 1. Starting countdown timers when a bot begins processing an order.
// 2. Tracking timers individually for each bot.
// 3. Stopping and cleaning up timers safely when a bot is removed.

import type { Bot } from "./botService";

export class SimulationEngine {
  private intervals = new Map<string, ReturnType<typeof setInterval>>();
  private timeouts = new Map<string, ReturnType<typeof setTimeout>>();

  /**
   * Start a 10-second countdown timer for a bot.
   * Automatically calls `onComplete()` after 10 seconds.
   */
  startCountdown(bot: Bot, onComplete: () => void) {
    const botId = bot.id;

    // Interval to decrease timeLeft every second
    const interval = setInterval(() => {
      if (bot.timeLeft && bot.timeLeft > 0) {
        bot.timeLeft--;
      }
    }, 1000);

    this.intervals.set(botId, interval);

    // Timeout to trigger order completion after 10 seconds
    const timeout = setTimeout(() => {
      this.stopProcessing(bot);
      onComplete();
    }, 10000);

    this.timeouts.set(botId, timeout);
  }

  /**
   * Stop countdown for a specific bot.
   * This is used during bot removal to prevent timers from running after bot is destroyed.
   */
  stopProcessing(bot: Bot) {
    const botId = bot.id;

    const interval = this.intervals.get(botId);
    const timeout = this.timeouts.get(botId);

    if (interval) clearInterval(interval);
    if (timeout) clearTimeout(timeout);

    this.intervals.delete(botId);
    this.timeouts.delete(botId);
  }
}
