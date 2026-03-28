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
  users: {
    type: Array,
    default: () => []
  },
  filter: {
    type: String,
    default: "all"
  },
  search: {
    type: String,
    default: ""
  },
  searchOpen: {
    type: Boolean,
    default: false
  },
  userMenuId: {
    type: Number,
    default: null
  },
  userActionId: {
    type: String,
    default: ""
  },
  formatInitials: {
    type: Function,
    required: true
  },
  formatRole: {
    type: Function,
    required: true
  },
  formatUserSubtitle: {
    type: Function,
    required: true
  }
});

defineEmits([
  "retry",
  "set-filter",
  "toggle-search",
  "update-search",
  "toggle-user-menu",
  "set-role",
  "set-blocked"
]);

const filters = [
  { id: "all", label: "Все" },
  { id: "barista", label: "Баристы" },
  { id: "blocked", label: "Заблокированные" }
];

function roleClass(role) {
  return role === "administrator"
    ? "backoffice-status-pill--created"
    : "backoffice-status-pill--confirmed";
}
</script>

<template>
  <section class="backoffice-screen backoffice-screen--users">
    <header class="backoffice-mobile-header">
      <h1 class="backoffice-mobile-header__title">Пользователи</h1>
      <button type="button" class="backoffice-icon-button" @click="$emit('toggle-search')">
        <AppIcon name="search" :size="18" />
      </button>
    </header>

    <header class="backoffice-desktop-header">
      <h1 class="backoffice-desktop-header__title">Пользователи</h1>
    </header>

    <div v-if="searchOpen" class="backoffice-search-box">
      <input
        :value="search"
        type="text"
        placeholder="Поиск по имени или Telegram"
        @input="$emit('update-search', $event.target.value)"
      />
    </div>

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

    <div v-if="loading" class="backoffice-empty-state">
      <h2>Загружаем пользователей…</h2>
    </div>

    <div v-else-if="error" class="backoffice-empty-state">
      <h2>Не удалось загрузить пользователей.</h2>
      <p>{{ error }}</p>
      <button type="button" class="backoffice-secondary-button" @click="$emit('retry')">
        Повторить
      </button>
    </div>

    <section v-else class="backoffice-panel">
      <div v-if="users.length === 0" class="backoffice-empty-state backoffice-empty-state--compact">
        <h2>Подходящих пользователей нет.</h2>
      </div>

      <article v-for="user in users" :key="user.id" class="backoffice-user-row">
        <div class="backoffice-user-row__identity">
          <div class="backoffice-avatar">{{ formatInitials(user.profileName) }}</div>
          <div>
            <div class="backoffice-user-row__title">{{ user.profileName }}</div>
            <div class="backoffice-user-row__subtitle">{{ formatUserSubtitle(user) }}</div>
          </div>
        </div>

        <div class="backoffice-user-row__actions">
          <span class="backoffice-status-pill" :class="roleClass(user.role)">
            {{ formatRole(user.role) }}
          </span>
          <button
            type="button"
            class="backoffice-icon-button backoffice-icon-button--ghost"
            @click="$emit('toggle-user-menu', user.id)"
          >
            <AppIcon name="more-vertical" :size="16" />
          </button>
        </div>

        <div v-if="userMenuId === user.id" class="backoffice-user-menu">
          <button
            v-if="user.role !== 'administrator'"
            type="button"
            class="backoffice-user-menu__item"
            :disabled="userActionId === `${user.id}:role`"
            @click="$emit('set-role', user, user.role === 'barista' ? 'customer' : 'barista')"
          >
            {{ user.role === "barista" ? "Сделать клиентом" : "Сделать бариста" }}
          </button>
          <button
            v-if="user.role !== 'administrator'"
            type="button"
            class="backoffice-user-menu__item"
            :disabled="userActionId === `${user.id}:block`"
            @click="$emit('set-blocked', user, !user.isBlocked)"
          >
            {{ user.isBlocked ? "Разблокировать" : "Заблокировать" }}
          </button>
        </div>
      </article>
    </section>
  </section>
</template>
