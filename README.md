# Bot Order Control Dashboard — Architecture & Service Guide

## Overview

This project simulates an automated order control system with support for:

- VIP & Normal order prioritization
- Dynamic bot creation & task processing
- Automatic processing queue with countdown
- Bot removal rollback logic (returns order to Pending)
- Clean Service-Based Architecture (Separation of Concerns)

---

## Architecture Summary

| Component             | Responsibility                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `OrderService.ts`     | Handles order lifecycle: creation, VIP queue logic, processing routing, rollback, completion |
| `BotService.ts`       | Manages bot lifecycle: add/remove bots, track idle/active state                              |
| `SimulationEngine.ts` | Controls per-bot countdown processing with full timer tracking & cancellation                |
| `main.vue`            | UI layer — delegates all logic to services for clean separation                              |

---

## Core Flow

1. **User places an order**

   - If **VIP**, it is inserted **behind existing VIP orders**
   - If **Normal**, it is added after all pending VIP orders

2. **User adds a bot**

   - Newly added bot immediately checks `PENDING` queue and starts processing

3. **Bot picks order → 10s countdown begins**

   - If completed, order moves to `COMPLETED` section
   - If bot is removed midway, order is returned to `PENDING`

4. **Bot removal**
   - If idle → just removed
   - If processing → timer is stopped, order is moved back to pending, then bot is removed

---

## Setup & Run

```bash
pnpm install
pnpm dev
```

Ensure your `main.vue` imports and initializes the services exactly as in the service integration step.

---
