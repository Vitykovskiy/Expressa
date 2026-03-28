<script setup>
import { computed } from "vue";
import CustomerApp from "./components/CustomerApp.vue";
import BackofficeApp from "./components/BackofficeApp.vue";
import { resolveAppSurface } from "./lib/api";

const surface = computed(() => resolveAppSurface());
</script>

<template>
  <BackofficeApp v-if="surface === 'backoffice'" />
  <CustomerApp v-else />
</template>
