<script setup>
import { computed } from "vue";
import AppIcon from "./AppIcon.vue";

const props = defineProps({
  orders: {
    type: Array,
    default: () => []
  },
  filter: {
    type: String,
    default: "all"
  },
  loadingActionId: {
    type: String,
    default: ""
  },
  formatOrderStatus: {
    type: Function,
    required: true
  },
  formatRub: {
    type: Function,
    required: true
  }
});

defineEmits(["set-filter", "refresh", "confirm", "ready", "close", "reject"]);

const filters = [
  { id: "all", label: "Все" },
  { id: "created", label: "Новые" },
  { id: "confirmed", label: "Подтверждённые" },
  { id: "ready", label: "Готовы" }
];

const emptyMessage = computed(() => {
  if (props.filter === "created") {
    return "Новых заказов нет.";
  }
  if (props.filter === "confirmed") {
    return "Подтверждённых заказов нет.";
  }
  if (props.filter === "ready") {
    return "Заказов, готовых к выдаче, нет.";
  }
  return "Очередь заказов пуста.";
});

function statusClass(status) {
  if (status === "Created") {
    return "backoffice-status-pill--created";
  }
  if (status === "Confirmed") {
    return "backoffice-status-pill--confirmed";
  }
  if (status === "Ready for pickup") {
    return "backoffice-status-pill--ready";
  }
  if (status === "Rejected") {
    return "backoffice-status-pill--rejected";
  }
  return "backoffice-status-pill--closed";
}

function customerLabel(order) {
  return order.customer.telegramId ? `Клиент ${order.customer.telegramId}` : "Клиент";
}

function itemSummary(order) {
  return order.items
    .map((item) => {
      const addonSummary = item.addons.map((addon) => addon.name).join(", ");
      return [item.productName, item.selectedSize, addonSummary].filter(Boolean).join(", ");
    })
    .join(" · ");
}
</script>

<template>
  <section class="backoffice-screen">
    <header class="backoffice-mobile-header">
      <h1 class="backoffice-mobile-header__title">Заказы</h1>
      <button type="button" class="backoffice-icon-button" @click="$emit('refresh')">
        <AppIcon name="refresh" :size="18" />
      </button>
    </header>

    <header class="backoffice-desktop-header">
      <h1 class="backoffice-desktop-header__title">Заказы</h1>
    </header>

    <div class="backoffice-filter-bar">
      <button
        v-for="item in filters"
        :key="item.id"
        type="button"
        class="backoffice-filter-pill"
        :class="{ 'backoffice-filter-pill--active': item.id === filter }"
        @click="$emit('set-filter', item.id)"
      >
        {{ item.label }}
      </button>
    </div>

    <div v-if="orders.length === 0" class="backoffice-empty-state">
      <h2>{{ emptyMessage }}</h2>
      <button type="button" class="backoffice-secondary-button" @click="$emit('refresh')">
        Обновить
      </button>
    </div>

    <div v-else class="backoffice-orders-grid">
      <article v-for="order in orders" :key="order.id" class="backoffice-order-card">
        <div class="backoffice-order-card__row">
          <span class="backoffice-order-card__id">#{{ order.id }}</span>
          <span class="backoffice-status-pill" :class="statusClass(order.status)">
            {{ formatOrderStatus(order.status) }}
          </span>
        </div>

        <div class="backoffice-order-card__time">
          <AppIcon name="clock" :size="14" />
          <span>{{ order.slot.start }}</span>
        </div>

        <div class="backoffice-order-card__customer">{{ customerLabel(order) }}</div>
        <p class="backoffice-order-card__summary">{{ itemSummary(order) }}</p>
        <div class="backoffice-order-card__total">{{ formatRub(order.totalRub) }}</div>

        <div v-if="order.status === 'Created'" class="backoffice-order-card__actions backoffice-order-card__actions--split">
          <button
            type="button"
            class="backoffice-primary-button"
            :disabled="loadingActionId === `${order.id}:confirm`"
            @click="$emit('confirm', order)"
          >
            Подтвердить
          </button>
          <button
            type="button"
            class="backoffice-danger-button"
            :disabled="loadingActionId === `${order.id}:reject`"
            @click="$emit('reject', order)"
          >
            Отклонить
          </button>
        </div>

        <div v-else-if="order.status === 'Confirmed'" class="backoffice-order-card__actions">
          <button
            type="button"
            class="backoffice-primary-button backoffice-primary-button--full"
            :disabled="loadingActionId === `${order.id}:ready`"
            @click="$emit('ready', order)"
          >
            Готово к выдаче
          </button>
        </div>

        <div v-else-if="order.status === 'Ready for pickup'" class="backoffice-order-card__actions">
          <button
            type="button"
            class="backoffice-neutral-button backoffice-primary-button--full"
            :disabled="loadingActionId === `${order.id}:close`"
            @click="$emit('close', order)"
          >
            Выдан
          </button>
        </div>

        <p v-if="order.rejectionReason" class="backoffice-order-card__reason">
          Причина: {{ order.rejectionReason }}
        </p>
      </article>
    </div>
  </section>
</template>
