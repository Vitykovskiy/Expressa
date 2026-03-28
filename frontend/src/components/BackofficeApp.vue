<script setup>
import { onMounted } from "vue";
import BackofficeShell from "./BackofficeShell.vue";
import BackofficeOrdersScreen from "./BackofficeOrdersScreen.vue";
import BackofficeAvailabilityScreen from "./BackofficeAvailabilityScreen.vue";
import BackofficeMenuScreen from "./BackofficeMenuScreen.vue";
import BackofficeUsersScreen from "./BackofficeUsersScreen.vue";
import BackofficeSettingsScreen from "./BackofficeSettingsScreen.vue";
import AppIcon from "./AppIcon.vue";
import { useBackofficeApp } from "../composables/useBackofficeApp";

const app = useBackofficeApp();

const menuDialogLabels = {
  category: "категорию",
  product: "товар",
  size: "размер",
  "addon-group": "группу добавок",
  addon: "добавку"
};

function menuDialogHeading() {
  const noun = menuDialogLabels[app.state.menuDialog.target] ?? "элемент";
  return app.state.menuDialog.mode === "edit" ? `Редактировать ${noun}` : `Новый ${noun}`;
}

function updateSettingsField(field, value) {
  app.state.settings[field] = value;
}

onMounted(() => {
  app.bootstrap();
});
</script>

<template>
  <BackofficeShell
    :tabs="app.visibleTabs.value"
    :current-tab="app.state.currentTab"
    :role-label="app.roleLabel.value"
    @select-tab="app.selectTab"
  >
    <div v-if="app.state.bootstrapLoading" class="backoffice-empty-state backoffice-empty-state--full">
      <h2>Загружаем backoffice…</h2>
    </div>

    <div v-else-if="app.state.globalError" class="backoffice-empty-state backoffice-empty-state--full">
      <h2>{{ app.state.blocked ? "Доступ ограничен" : "Не удалось загрузить данные" }}</h2>
      <p>{{ app.state.globalError }}</p>
      <button type="button" class="backoffice-secondary-button" @click="app.bootstrap">
        Повторить
      </button>
    </div>

    <template v-else>
      <BackofficeOrdersScreen
        v-if="app.state.currentTab === 'orders'"
        :orders="app.filteredOrders.value"
        :filter="app.state.orderFilter"
        :loading-action-id="app.state.orderActionId"
        :format-order-status="app.formatOrderStatus"
        :format-rub="app.formatRub"
        @set-filter="(value) => (app.state.orderFilter = value)"
        @refresh="app.refreshOrders"
        @confirm="(order) => app.runOrderAction(order, 'confirm')"
        @ready="(order) => app.runOrderAction(order, 'ready')"
        @close="(order) => app.runOrderAction(order, 'close')"
        @reject="app.openRejectDialog"
      />

      <BackofficeAvailabilityScreen
        v-else-if="app.state.currentTab === 'availability'"
        :loading="app.state.availabilityLoading"
        :error="app.state.availabilityError"
        :filters="app.availabilityTabs.value"
        :active-filter="app.state.availabilityFilter"
        :sections="app.availabilitySections.value"
        :action-key="app.state.availabilityActionKey"
        @retry="app.loadAvailability"
        @set-filter="(value) => (app.state.availabilityFilter = value)"
        @toggle="app.toggleAvailability"
      />

      <BackofficeMenuScreen
        v-else-if="app.state.currentTab === 'menu'"
        :loading="app.state.menuLoading"
        :error="app.state.menuError"
        :categories="app.menuCategories.value"
        :expanded-category-id="app.state.menuExpandedCategoryId"
        :format-rub="app.formatRub"
        @retry="app.selectTab('menu')"
        @toggle-category="app.toggleMenuCategory"
        @open-dialog="app.openMenuDialog"
      />

      <BackofficeUsersScreen
        v-else-if="app.state.currentTab === 'users'"
        :loading="app.state.usersLoading"
        :error="app.state.usersError"
        :users="app.filteredUsers.value"
        :filter="app.state.usersFilter"
        :search="app.state.usersSearch"
        :search-open="app.state.usersSearchOpen"
        :user-menu-id="app.state.userMenuId"
        :user-action-id="app.state.userActionId"
        :format-initials="app.formatInitials"
        :format-role="app.formatRole"
        :format-user-subtitle="app.formatUserSubtitle"
        @retry="app.selectTab('users')"
        @set-filter="(value) => (app.state.usersFilter = value)"
        @toggle-search="app.toggleUserSearch"
        @update-search="(value) => (app.state.usersSearch = value)"
        @toggle-user-menu="app.toggleUserMenu"
        @set-role="app.updateUserRole"
        @set-blocked="app.updateUserBlocked"
      />

      <BackofficeSettingsScreen
        v-else-if="app.state.currentTab === 'settings'"
        :loading="app.state.settingsLoading"
        :error="app.state.settingsError"
        :settings="app.state.settings"
        :saving="app.state.settingsSaving"
        @retry="app.selectTab('settings')"
        @update:field="updateSettingsField"
        @save="app.saveSettings"
      />
    </template>

    <div v-if="app.state.rejectDialogOpen" class="backoffice-dialog-overlay">
      <div class="backoffice-dialog">
        <h2 class="backoffice-dialog__title">Отклонить заказ</h2>
        <p class="backoffice-dialog__subtitle">Укажите причину отклонения заказа</p>

        <textarea
          v-model="app.state.rejectReason"
          class="backoffice-dialog__input"
          rows="3"
          placeholder="Причина отклонения"
        ></textarea>

        <p v-if="app.state.rejectError" class="backoffice-dialog__error">{{ app.state.rejectError }}</p>

        <div class="backoffice-dialog__actions">
          <button
            type="button"
            class="backoffice-danger-button backoffice-primary-button--full"
            :class="{ 'backoffice-danger-button--disabled': !app.state.rejectReason.trim() }"
            :disabled="app.state.orderActionId === `${app.state.rejectOrderId}:reject`"
            @click="app.submitReject"
          >
            Отклонить
          </button>
          <button type="button" class="backoffice-neutral-link" @click="app.closeRejectDialog">
            Отмена
          </button>
        </div>
      </div>
    </div>

    <div v-if="app.state.menuDialog.open" class="backoffice-dialog-overlay">
      <div class="backoffice-dialog backoffice-dialog--wide">
        <h2 class="backoffice-dialog__title">{{ menuDialogHeading() }}</h2>

        <div class="backoffice-form-grid">
          <label v-if="'name' in app.state.menuDialog.form" class="backoffice-field">
            <span>Название</span>
            <input v-model="app.state.menuDialog.form.name" type="text" />
          </label>

          <label v-if="'sortOrder' in app.state.menuDialog.form" class="backoffice-field">
            <span>Порядок</span>
            <input v-model="app.state.menuDialog.form.sortOrder" type="number" min="0" />
          </label>

          <label v-if="'categoryId' in app.state.menuDialog.form" class="backoffice-field">
            <span>Категория</span>
            <select v-model="app.state.menuDialog.form.categoryId">
              <option
                v-for="category in app.state.menu.categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </label>

          <label v-if="'description' in app.state.menuDialog.form" class="backoffice-field backoffice-field--full">
            <span>Описание</span>
            <textarea v-model="app.state.menuDialog.form.description" rows="3"></textarea>
          </label>

          <label v-if="'baseState' in app.state.menuDialog.form" class="backoffice-field">
            <span>Базовый статус</span>
            <select v-model="app.state.menuDialog.form.baseState">
              <option value="active">Активный</option>
              <option value="inactive">Неактивный</option>
            </select>
          </label>

          <label v-if="'productId' in app.state.menuDialog.form" class="backoffice-field">
            <span>Товар</span>
            <select v-model="app.state.menuDialog.form.productId">
              <option
                v-for="product in app.state.menu.products"
                :key="product.id"
                :value="product.id"
              >
                {{ product.name }}
              </option>
            </select>
          </label>

          <label v-if="'sizeCode' in app.state.menuDialog.form" class="backoffice-field">
            <span>Размер</span>
            <select v-model="app.state.menuDialog.form.sizeCode">
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
            </select>
          </label>

          <label v-if="'priceRub' in app.state.menuDialog.form" class="backoffice-field">
            <span>Цена, ₽</span>
            <input v-model="app.state.menuDialog.form.priceRub" type="number" min="0" />
          </label>

          <label v-if="'ownerId' in app.state.menuDialog.form" class="backoffice-field">
            <span>Товар-владелец</span>
            <select v-model="app.state.menuDialog.form.ownerId">
              <option
                v-for="product in app.state.menu.products"
                :key="product.id"
                :value="product.id"
              >
                {{ product.name }}
              </option>
            </select>
          </label>

          <label v-if="'selectionRule' in app.state.menuDialog.form" class="backoffice-field">
            <span>Правило выбора</span>
            <select v-model="app.state.menuDialog.form.selectionRule">
              <option value="single">Один вариант</option>
              <option value="multi">Несколько вариантов</option>
            </select>
          </label>

          <label v-if="'minCount' in app.state.menuDialog.form" class="backoffice-field">
            <span>Минимум</span>
            <input v-model="app.state.menuDialog.form.minCount" type="number" min="0" />
          </label>

          <label v-if="'maxCount' in app.state.menuDialog.form" class="backoffice-field">
            <span>Максимум</span>
            <input v-model="app.state.menuDialog.form.maxCount" type="number" min="0" />
          </label>

          <label v-if="'addonGroupId' in app.state.menuDialog.form" class="backoffice-field">
            <span>Группа добавок</span>
            <select v-model="app.state.menuDialog.form.addonGroupId">
              <option
                v-for="group in app.state.menu.addonGroups"
                :key="group.id"
                :value="group.id"
              >
                {{ group.name }}
              </option>
            </select>
          </label>

          <label
            v-if="'isActive' in app.state.menuDialog.form || 'isTemporarilyAvailable' in app.state.menuDialog.form"
            class="backoffice-checkbox"
          >
            <input
              v-if="'isActive' in app.state.menuDialog.form"
              v-model="app.state.menuDialog.form.isActive"
              type="checkbox"
            />
            <input
              v-else
              v-model="app.state.menuDialog.form.isTemporarilyAvailable"
              type="checkbox"
            />
            <span>{{
              "isActive" in app.state.menuDialog.form ? "Категория активна" : "Временно доступно"
            }}</span>
          </label>
        </div>

        <p v-if="app.state.menuDialog.error" class="backoffice-dialog__error">
          {{ app.state.menuDialog.error }}
        </p>

        <div class="backoffice-dialog__actions">
          <button
            type="button"
            class="backoffice-primary-button backoffice-primary-button--full"
            :disabled="app.state.menuDialog.saving"
            @click="app.submitMenuDialog"
          >
            Сохранить
          </button>
          <button type="button" class="backoffice-neutral-link" @click="app.closeMenuDialog">
            Отмена
          </button>
        </div>
      </div>
    </div>

    <div v-if="app.state.snackbar" class="backoffice-toast">
      {{ app.state.snackbar }}
    </div>
  </BackofficeShell>
</template>
