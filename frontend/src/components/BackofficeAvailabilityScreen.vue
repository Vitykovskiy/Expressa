<script setup>
import AppIcon from "./AppIcon.vue";

defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ""
  },
  filters: {
    type: Array,
    default: () => []
  },
  activeFilter: {
    type: String,
    default: "all"
  },
  sections: {
    type: Array,
    default: () => []
  },
  actionKey: {
    type: String,
    default: ""
  }
});

defineEmits(["retry", "set-filter", "toggle"]);

function toggleKey(target, id) {
  return `${target}:${id}`;
}

function productSubtitle(product) {
  const fragments = [];
  if (product.sizes.length > 0) {
    fragments.push(`${product.sizes.length} размеров`);
  }
  if (product.addonGroups.length > 0) {
    fragments.push(`${product.addonGroups.length} групп добавок`);
  }
  return fragments.join(" • ");
}
</script>

<template>
  <section class="backoffice-screen">
    <header class="backoffice-mobile-header">
      <h1 class="backoffice-mobile-header__title">Доступность</h1>
    </header>

    <header class="backoffice-desktop-header">
      <h1 class="backoffice-desktop-header__title">Доступность</h1>
    </header>

    <div class="backoffice-filter-bar">
      <button
        v-for="item in filters"
        :key="item.id"
        type="button"
        class="backoffice-filter-pill"
        :class="{ 'backoffice-filter-pill--active': item.id === activeFilter }"
        @click="$emit('set-filter', item.id)"
      >
        {{ item.label }}
      </button>
    </div>

    <div v-if="loading" class="backoffice-empty-state">
      <h2>Загружаем доступность…</h2>
    </div>

    <div v-else-if="error" class="backoffice-empty-state">
      <h2>Не удалось загрузить данные.</h2>
      <p>{{ error }}</p>
      <button type="button" class="backoffice-secondary-button" @click="$emit('retry')">
        Повторить
      </button>
    </div>

    <div v-else class="backoffice-stack">
      <section
        v-for="section in sections"
        :key="section.id"
        class="backoffice-panel"
      >
        <header class="backoffice-panel__header">
          <span>{{ section.name }}</span>
        </header>

        <div v-for="product in section.products" :key="product.id" class="backoffice-toggle-row">
          <div class="backoffice-toggle-row__content">
            <div class="backoffice-toggle-row__title">{{ product.name }}</div>
            <div class="backoffice-toggle-row__subtitle">{{ productSubtitle(product) || "Без опций" }}</div>
          </div>

          <label class="backoffice-switch">
            <input
              type="checkbox"
              :checked="product.isTemporarilyAvailable"
              :disabled="actionKey === toggleKey('product', product.id)"
              @change="$emit('toggle', 'product', 'productId', product.id, $event.target.checked)"
            />
            <span></span>
          </label>

          <div v-if="product.sizes.length || product.addonGroups.length" class="backoffice-toggle-row__children">
            <div
              v-for="size in product.sizes"
              :key="size.id"
              class="backoffice-toggle-row backoffice-toggle-row--nested"
            >
              <div class="backoffice-toggle-row__content">
                <div class="backoffice-toggle-row__title">{{ size.name }}</div>
                <div class="backoffice-toggle-row__subtitle">Размер</div>
              </div>

              <label class="backoffice-switch">
                <input
                  type="checkbox"
                  :checked="size.isTemporarilyAvailable"
                  :disabled="actionKey === toggleKey('size', size.id)"
                  @change="$emit('toggle', 'size', 'sizeId', size.id, $event.target.checked)"
                />
                <span></span>
              </label>
            </div>

            <div
              v-for="group in product.addonGroups"
              :key="group.id"
              class="backoffice-toggle-row backoffice-toggle-row--nested"
            >
              <div class="backoffice-toggle-row__content">
                <div class="backoffice-toggle-row__title">{{ group.name }}</div>
                <div class="backoffice-toggle-row__subtitle">Группа добавок</div>
              </div>

              <label class="backoffice-switch">
                <input
                  type="checkbox"
                  :checked="group.isTemporarilyAvailable"
                  :disabled="actionKey === toggleKey('addon-group', group.id)"
                  @change="$emit('toggle', 'addon-group', 'addonGroupId', group.id, $event.target.checked)"
                />
                <span></span>
              </label>

              <div v-if="group.addons.length" class="backoffice-toggle-row__children">
                <div
                  v-for="addon in group.addons"
                  :key="addon.id"
                  class="backoffice-toggle-row backoffice-toggle-row--deep"
                >
                  <div class="backoffice-toggle-row__content">
                    <div class="backoffice-toggle-row__title">{{ addon.name }}</div>
                    <div class="backoffice-toggle-row__subtitle">Добавка</div>
                  </div>

                  <label class="backoffice-switch">
                    <input
                      type="checkbox"
                      :checked="addon.isTemporarilyAvailable"
                      :disabled="actionKey === toggleKey('addon', addon.id)"
                      @change="$emit('toggle', 'addon', 'addonId', addon.id, $event.target.checked)"
                    />
                    <span></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>
