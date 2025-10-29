// This service is responsible only for:
// 1. Starting countdown timers when a bot begins processing an order.
// 2. Tracking timers individually for each bot.
// 3. Stopping and cleaning up timers safely when a bot is removed.
import { ref, reactive } from "vue";
import type { Bot } from "./botService";

export class SimulationEngine {
  private intervals = new Map<string, ReturnType<typeof setInterval>>();

  /**
   * Start a countdown timer for a bot.
   * Each tick decrements timeLeft and triggers completion when 0.
   */
  startCountdown(bot: Bot, onComplete: () => void) {
    const botId = bot.id;

    this.stopProcessing(bot);

    const interval = setInterval(() => {
      if (bot.timeLeft && bot.timeLeft > 0) {
        bot.timeLeft--;
        if (bot.timeLeft === 0) {
          this.stopProcessing(bot);
          onComplete();
        }
      }
    }, 1000);
    this.intervals.set(botId, interval);
  }
  /**
   * Stop countdown for a specific bot.
   * This is used during bot removal to prevent timers from running after bot is destroyed.
   */
  stopProcessing(bot: Bot) {
    const botId = bot.id;
    const interval = this.intervals.get(botId);
    if (interval) clearInterval(interval);
    this.intervals.delete(botId);
  }
}
