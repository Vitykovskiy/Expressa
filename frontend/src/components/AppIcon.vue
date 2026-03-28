<script setup>
import { computed } from "vue";

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 18
  },
  strokeWidth: {
    type: Number,
    default: 2
  }
});

const iconProps = computed(() => ({
  width: props.size,
  height: props.size,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  stroke: "currentColor",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "stroke-width": props.strokeWidth
}));
</script>

<template>
  <svg v-bind="iconProps">
    <template v-if="name === 'arrow-left'">
      <path d="M15 6L9 12L15 18" />
    </template>
    <template v-else-if="name === 'history'">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 3v6h6" />
    </template>
    <template v-else-if="name === 'cart'">
      <path d="M4 5h2l2.2 9.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L21 8H8.4" />
      <circle cx="10" cy="19" r="1.4" />
      <circle cx="18" cy="19" r="1.4" />
    </template>
    <template v-else-if="name === 'orders'">
      <path d="M8 4h8" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
      <path d="M5 4h.01" />
      <path d="M5 8h.01" />
      <path d="M5 12h.01" />
      <path d="M5 16h.01" />
    </template>
    <template v-else-if="name === 'availability'">
      <path d="M7 12a5 5 0 0 0 10 0" />
      <path d="M17 12a5 5 0 0 0-10 0" />
      <circle cx="17" cy="12" r="1" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'menu-book'">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17.5A2.5 2.5 0 0 0 17.5 18H4z" />
      <path d="M17.5 18H4V5.5A2.5 2.5 0 0 1 6.5 3" />
      <path d="M9 7h7" />
      <path d="M9 11h7" />
    </template>
    <template v-else-if="name === 'users'">
      <path d="M16 21v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
      <circle cx="9.5" cy="8" r="3" />
      <path d="M20 8v6" />
      <path d="M17 11h6" />
    </template>
    <template v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.82-.33 1.7 1.7 0 0 0-1 1.54V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.54 1.7 1.7 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.63 15a1.7 1.7 0 0 0-1.54-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.54-1 1.7 1.7 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.63a1.7 1.7 0 0 0 1-1.54V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.54 1.7 1.7 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.37 9a1.7 1.7 0 0 0 1.54 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.54 1z" />
    </template>
    <path v-else-if="name === 'plus'" d="M12 5v14M5 12h14" />
    <path v-else-if="name === 'minus'" d="M5 12h14" />
    <template v-else-if="name === 'refresh'">
      <path d="M20 11a8 8 0 1 0 2 5.3" />
      <path d="M20 4v7h-7" />
    </template>
    <template v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-3.5-3.5" />
    </template>
    <template v-else-if="name === 'more-vertical'">
      <circle cx="12" cy="5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.3" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </template>
    <path v-else-if="name === 'chevron-down'" d="M7 10l5 5 5-5" />
    <path v-else-if="name === 'arrow-right'" d="M9 6l6 6-6 6" />
  </svg>
</template>
