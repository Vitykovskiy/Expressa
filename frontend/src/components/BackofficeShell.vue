<script setup>
import AppIcon from "./AppIcon.vue";

defineProps({
  tabs: {
    type: Array,
    default: () => []
  },
  currentTab: {
    type: String,
    default: "orders"
  },
  roleLabel: {
    type: String,
    default: ""
  }
});

defineEmits(["select-tab"]);
</script>

<template>
  <v-app class="backoffice-app">
    <v-main class="backoffice-main">
      <div class="backoffice-layout">
        <aside class="backoffice-side-nav">
          <div class="backoffice-side-nav__brand">
            <div class="backoffice-side-nav__title">Expressa</div>
            <div class="backoffice-side-nav__subtitle">{{ roleLabel }}</div>
          </div>

          <nav class="backoffice-side-nav__links">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              class="backoffice-side-nav__link"
              :class="{ 'backoffice-side-nav__link--active': tab.id === currentTab }"
              @click="$emit('select-tab', tab.id)"
            >
              <AppIcon :name="tab.icon" :size="18" />
              <span>{{ tab.label }}</span>
            </button>
          </nav>
        </aside>

        <section class="backoffice-surface">
          <slot />
        </section>
      </div>

      <nav class="backoffice-tabbar">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="backoffice-tabbar__link"
          :class="{ 'backoffice-tabbar__link--active': tab.id === currentTab }"
          @click="$emit('select-tab', tab.id)"
        >
          <AppIcon :name="tab.icon" :size="20" />
          <span>{{ tab.label }}</span>
        </button>
      </nav>
    </v-main>
  </v-app>
</template>
