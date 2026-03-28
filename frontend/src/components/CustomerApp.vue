<script setup>
import { computed, onMounted } from "vue";
import CustomerShell from "./CustomerShell.vue";
import CatalogScreen from "./CatalogScreen.vue";
import GroupScreen from "./GroupScreen.vue";
import ProductDetailScreen from "./ProductDetailScreen.vue";
import CartScreen from "./CartScreen.vue";
import HistoryScreen from "./HistoryScreen.vue";
import SlotDialog from "./SlotDialog.vue";
import { formatItemCount, formatOrderCount } from "../lib/format";
import { useCustomerApp } from "../composables/useCustomerApp";

const app = useCustomerApp();

const screenTitle = computed(() => {
  if (app.state.screen === "catalog") {
    return "Что будем заказывать?";
  }
  if (app.state.screen === "group") {
    return app.category.value?.name ?? "";
  }
  if (app.state.screen === "cart") {
    return "Корзина";
  }
  if (app.state.screen === "history") {
    return "История";
  }
  return "";
});

const screenSubtitle = computed(() => {
  if (app.state.screen === "catalog") {
    return "Меню кофейни";
  }
  if (app.state.screen === "group") {
    return formatItemCount(app.category.value?.products.length ?? 0);
  }
  if (app.state.screen === "cart") {
    return formatItemCount(app.state.cart.items.length);
  }
  if (app.state.screen === "history") {
    return formatOrderCount(app.state.orders.length);
  }
  return "";
});

const showBack = computed(() => app.state.screen !== "catalog");

onMounted(() => {
  app.bootstrap();
});
</script>

<template>
  <CustomerShell
    :title="screenTitle"
    :subtitle="screenSubtitle"
    :show-back="showBack"
    :badge-count="app.badgeCount.value"
    :history-mode="app.state.screen === 'history'"
    @back="app.goBack"
    @open-history="app.openHistory"
    @open-cart="app.openCart"
  >
    <div v-if="app.state.globalError" class="error-state">
      <h2 class="error-state__title">
        {{ app.state.blocked ? "Доступ ограничен" : "Не удалось загрузить данные" }}
      </h2>
      <p class="error-state__body">{{ app.state.globalError }}</p>
      <v-btn class="menu-link" variant="flat" @click="app.bootstrap">Повторить</v-btn>
    </div>

    <template v-else>
      <CatalogScreen
        v-if="app.state.screen === 'catalog'"
        :categories="app.state.menu.categories"
        :loading="app.state.bootstrapLoading"
        @select-category="app.openCategory"
      />

      <GroupScreen
        v-else-if="app.state.screen === 'group' && app.category.value"
        :category="app.category.value"
        @select-product="app.openProduct"
      />

      <ProductDetailScreen
        v-else-if="app.state.screen === 'detail' && app.product.value && app.state.draft"
        :category-name="app.category.value?.name ?? ''"
        :product="app.product.value"
        :draft="app.state.draft"
        :error-message="app.state.inlineError"
        :submitting="app.state.addToCartLoading"
        @toggle-addon="app.toggleAddon"
        @set-size="app.setSize"
        @change-quantity="app.changeDraftQuantity"
        @add-to-cart="app.addToCart"
      />

      <CartScreen
        v-else-if="app.state.screen === 'cart'"
        :cart="app.state.cart"
        :mutating-item-id="app.state.cartMutationId"
        @change-quantity="app.changeCartQuantity"
        @open-checkout="app.openCheckout"
        @go-catalog="app.openCatalog"
      />

      <HistoryScreen
        v-else-if="app.state.screen === 'history'"
        :orders="app.state.orders"
        :expanded-order-id="app.state.expandedOrderId"
        @toggle-order="app.toggleHistoryOrder"
      />
    </template>

    <SlotDialog
      :open="app.state.slotDialogOpen"
      :slots-state="app.state.slotsState"
      :selected-slot="app.state.selectedSlot"
      :total-rub="app.state.cart.totalRub"
      :submitting="app.state.orderSubmitting"
      @close="app.closeCheckout"
      @select-slot="(slot) => (app.state.selectedSlot = slot)"
      @confirm="app.submitOrder"
    />

    <div v-if="app.state.snackbar" class="toast">
      {{ app.state.snackbar }}
    </div>
  </CustomerShell>
</template>
