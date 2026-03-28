<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ""
  },
  settings: {
    type: Object,
    required: true
  },
  saving: {
    type: Boolean,
    default: false
  }
});

defineEmits(["retry", "update:field", "save"]);
</script>

<template>
  <section class="backoffice-screen backoffice-screen--settings">
    <header class="backoffice-mobile-header">
      <h1 class="backoffice-mobile-header__title">Настройки</h1>
    </header>

    <header class="backoffice-desktop-header">
      <h1 class="backoffice-desktop-header__title">Настройки</h1>
    </header>

    <div v-if="loading" class="backoffice-empty-state">
      <h2>Загружаем настройки…</h2>
    </div>

    <div v-else-if="error" class="backoffice-empty-state">
      <h2>Не удалось загрузить настройки.</h2>
      <p>{{ error }}</p>
      <button type="button" class="backoffice-secondary-button" @click="$emit('retry')">
        Повторить
      </button>
    </div>

    <div v-else class="backoffice-settings-stack">
      <section class="backoffice-panel">
        <header class="backoffice-panel__header">
          <span>Рабочие часы</span>
        </header>

        <div class="backoffice-form-grid">
          <label class="backoffice-field">
            <span>Открытие</span>
            <input
              :value="settings.workingHoursStart"
              type="time"
              @input="$emit('update:field', 'workingHoursStart', $event.target.value)"
            />
          </label>

          <label class="backoffice-field">
            <span>Закрытие</span>
            <input
              :value="settings.workingHoursEnd"
              type="time"
              @input="$emit('update:field', 'workingHoursEnd', $event.target.value)"
            />
          </label>
        </div>
      </section>

      <section class="backoffice-panel">
        <header class="backoffice-panel__header">
          <span>Слоты</span>
        </header>

        <label class="backoffice-field">
          <span>Вместимость слота (заказов)</span>
          <input
            :value="settings.slotCapacity"
            type="number"
            min="1"
            step="1"
            @input="$emit('update:field', 'slotCapacity', $event.target.value)"
          />
          <small>Сколько активных заказов помещается в один 10-минутный слот</small>
        </label>
      </section>
    </div>

    <div class="backoffice-settings-footer">
      <button
        type="button"
        class="backoffice-primary-button backoffice-primary-button--full"
        :disabled="saving"
        @click="$emit('save')"
      >
        Сохранить
      </button>
    </div>
  </section>
</template>
