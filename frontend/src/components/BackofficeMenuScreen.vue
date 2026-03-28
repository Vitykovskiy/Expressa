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
  categories: {
    type: Array,
    default: () => []
  },
  expandedCategoryId: {
    type: String,
    default: ""
  },
  formatRub: {
    type: Function,
    required: true
  }
});

defineEmits(["retry", "toggle-category", "open-dialog"]);
</script>

<template>
  <section class="backoffice-screen">
    <header class="backoffice-mobile-header">
      <h1 class="backoffice-mobile-header__title">Меню</h1>
    </header>

    <header class="backoffice-desktop-header backoffice-desktop-header--with-action">
      <h1 class="backoffice-desktop-header__title">Меню</h1>
      <button type="button" class="backoffice-primary-button" @click="$emit('open-dialog', 'category', 'create')">
        Новая категория
      </button>
    </header>

    <div v-if="loading" class="backoffice-empty-state">
      <h2>Загружаем меню…</h2>
    </div>

    <div v-else-if="error" class="backoffice-empty-state">
      <h2>Не удалось загрузить меню.</h2>
      <p>{{ error }}</p>
      <button type="button" class="backoffice-secondary-button" @click="$emit('retry')">
        Повторить
      </button>
    </div>

    <div v-else class="backoffice-stack">
      <button
        type="button"
        class="backoffice-primary-button backoffice-primary-button--mobile"
        @click="$emit('open-dialog', 'category', 'create')"
      >
        Новая категория
      </button>

      <section
        v-for="category in categories"
        :key="category.id"
        class="backoffice-panel backoffice-panel--clickable"
      >
        <button
          type="button"
          class="backoffice-menu-summary"
          @click="$emit('toggle-category', category.id)"
        >
          <div>
            <div class="backoffice-menu-summary__title">{{ category.name }}</div>
            <div class="backoffice-menu-summary__meta">{{ category.productCountLabel }}</div>
          </div>
          <AppIcon name="arrow-right" :size="18" />
        </button>

        <div v-if="expandedCategoryId === category.id" class="backoffice-menu-details">
          <div class="backoffice-menu-toolbar">
            <button type="button" class="backoffice-secondary-button" @click="$emit('open-dialog', 'category', 'edit', category)">
              Категория
            </button>
            <button type="button" class="backoffice-primary-button" @click="$emit('open-dialog', 'product', 'create', { categoryId: category.id })">
              Добавить товар
            </button>
          </div>

          <article
            v-for="product in category.products"
            :key="product.id"
            class="backoffice-menu-entity"
          >
            <div class="backoffice-menu-entity__row">
              <div>
                <div class="backoffice-menu-entity__title">{{ product.name }}</div>
                <div class="backoffice-menu-entity__meta">{{ product.description || "Без описания" }}</div>
              </div>
              <button type="button" class="backoffice-secondary-button" @click="$emit('open-dialog', 'product', 'edit', product)">
                Изменить
              </button>
            </div>

            <div class="backoffice-menu-inline-actions">
              <button type="button" class="backoffice-inline-link" @click="$emit('open-dialog', 'size', 'create', { productId: product.id })">
                + Размер
              </button>
              <button type="button" class="backoffice-inline-link" @click="$emit('open-dialog', 'addon-group', 'create', { ownerId: product.id })">
                + Группа добавок
              </button>
            </div>

            <div v-if="product.sizes.length" class="backoffice-menu-subgroup">
              <div class="backoffice-menu-subgroup__label">Размеры</div>
              <div v-for="size in product.sizes" :key="size.id" class="backoffice-menu-subgroup__row">
                <span>{{ size.sizeCode }}</span>
                <span>{{ formatRub(size.priceRub) }}</span>
                <button type="button" class="backoffice-inline-link" @click="$emit('open-dialog', 'size', 'edit', size)">
                  Изменить
                </button>
              </div>
            </div>

            <div v-if="product.addonGroups.length" class="backoffice-menu-subgroup">
              <div class="backoffice-menu-subgroup__label">Добавки</div>
              <div
                v-for="group in product.addonGroups"
                :key="group.id"
                class="backoffice-menu-group"
              >
                <div class="backoffice-menu-group__header">
                  <div>
                    <div class="backoffice-menu-group__title">{{ group.name }}</div>
                    <div class="backoffice-menu-entity__meta">
                      {{ group.selectionRule === "single" ? "Один выбор" : "Несколько выборов" }}
                    </div>
                  </div>
                  <div class="backoffice-menu-group__actions">
                    <button type="button" class="backoffice-inline-link" @click="$emit('open-dialog', 'addon-group', 'edit', group)">
                      Изменить
                    </button>
                    <button type="button" class="backoffice-inline-link" @click="$emit('open-dialog', 'addon', 'create', { addonGroupId: group.id })">
                      + Добавка
                    </button>
                  </div>
                </div>

                <div v-for="addon in group.addons" :key="addon.id" class="backoffice-menu-subgroup__row">
                  <span>{{ addon.name }}</span>
                  <span>{{ formatRub(addon.priceRub) }}</span>
                  <button type="button" class="backoffice-inline-link" @click="$emit('open-dialog', 'addon', 'edit', addon)">
                    Изменить
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>
