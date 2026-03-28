import { computed, reactive } from "vue";
import { adminApi, backofficeApi } from "../lib/api";
import {
  formatCategoryCount,
  formatInitials,
  formatOrderStatus,
  formatRole,
  formatRub,
  formatUserSubtitle
} from "../lib/format";

const baseTabs = [
  { id: "orders", label: "Заказы", icon: "orders" },
  { id: "availability", label: "Доступность", icon: "availability" }
];

const adminTabs = [
  { id: "menu", label: "Меню", icon: "menu-book" },
  { id: "users", label: "Пользователи", icon: "users" },
  { id: "settings", label: "Настройки", icon: "settings" }
];

const orderFilterMap = {
  all: () => true,
  created: (order) => order.status === "Created",
  confirmed: (order) => order.status === "Confirmed",
  ready: (order) => order.status === "Ready for pickup"
};

function buildAvailabilitySections(snapshot) {
  const sizesByProduct = new Map();
  snapshot.sizes.forEach((size) => {
    const entry = sizesByProduct.get(size.productId) ?? [];
    entry.push(size);
    sizesByProduct.set(size.productId, entry);
  });

  const groupsByProduct = new Map();
  snapshot.addonGroups.forEach((group) => {
    if (group.ownerType !== "product") {
      return;
    }
    const entry = groupsByProduct.get(group.ownerId) ?? [];
    entry.push(group);
    groupsByProduct.set(group.ownerId, entry);
  });

  const addonsByGroup = new Map();
  snapshot.addons.forEach((addon) => {
    const entry = addonsByGroup.get(addon.addonGroupId) ?? [];
    entry.push(addon);
    addonsByGroup.set(addon.addonGroupId, entry);
  });

  return [...snapshot.categories]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((category) => {
      const products = snapshot.products
        .filter((product) => product.categoryId === category.id)
        .map((product) => {
          const sizes = [...(sizesByProduct.get(product.id) ?? [])];
          const addonGroups = [...(groupsByProduct.get(product.id) ?? [])].map((group) => ({
            ...group,
            addons: [...(addonsByGroup.get(group.id) ?? [])]
          }));

          return {
            ...product,
            subtitle:
              sizes.length > 0
                ? `${sizes.length === 1 ? "1 размер" : `${sizes.length} размеров`}`
                : addonGroups.length > 0
                  ? `${addonGroups.length} групп добавок`
                  : "Без модификаторов",
            sizes,
            addonGroups
          };
        });

      return {
        ...category,
        products
      };
    })
    .filter((category) => category.products.length > 0);
}

function buildMenuModel(menu) {
  const productsByCategory = new Map();
  const sizesByProduct = new Map();
  const groupsByProduct = new Map();
  const addonsByGroup = new Map();

  menu.products.forEach((product) => {
    const entry = productsByCategory.get(product.categoryId) ?? [];
    entry.push(product);
    productsByCategory.set(product.categoryId, entry);
  });

  menu.sizes.forEach((size) => {
    const entry = sizesByProduct.get(size.productId) ?? [];
    entry.push(size);
    sizesByProduct.set(size.productId, entry);
  });

  menu.addonGroups.forEach((group) => {
    const entry = groupsByProduct.get(group.ownerId) ?? [];
    entry.push(group);
    groupsByProduct.set(group.ownerId, entry);
  });

  menu.addons.forEach((addon) => {
    const entry = addonsByGroup.get(addon.addonGroupId) ?? [];
    entry.push(addon);
    addonsByGroup.set(addon.addonGroupId, entry);
  });

  return [...menu.categories]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((category) => {
      const products = [...(productsByCategory.get(category.id) ?? [])].map((product) => ({
        ...product,
        sizes: [...(sizesByProduct.get(product.id) ?? [])],
        addonGroups: [...(groupsByProduct.get(product.id) ?? [])].map((group) => ({
          ...group,
          addons: [...(addonsByGroup.get(group.id) ?? [])]
        }))
      }));

      return {
        ...category,
        productCountLabel: formatCategoryCount(products.length),
        products
      };
    });
}

function cloneSettings(settings) {
  return {
    workingHoursStart: settings.workingHoursStart ?? "",
    workingHoursEnd: settings.workingHoursEnd ?? "",
    slotCapacity: String(settings.slotCapacity ?? "")
  };
}

function buildMenuDialogSeed(state, target, mode, entity = null) {
  const firstCategory = state.menu.categories[0];
  const firstProduct = state.menu.products[0];
  const firstGroup = state.menu.addonGroups[0];

  if (target === "category") {
    return {
      id: entity?.id ?? "",
      name: entity?.name ?? "",
      sortOrder: String(entity?.sortOrder ?? 100),
      isActive: entity?.isActive ?? true
    };
  }

  if (target === "product") {
    return {
      id: entity?.id ?? "",
      categoryId: entity?.categoryId ?? state.menuExpandedCategoryId ?? firstCategory?.id ?? "",
      name: entity?.name ?? "",
      description: entity?.description ?? "",
      baseState: entity?.baseState ?? "active",
      isTemporarilyAvailable: entity?.isTemporarilyAvailable ?? true
    };
  }

  if (target === "size") {
    return {
      id: entity?.id ?? "",
      productId: entity?.productId ?? firstProduct?.id ?? "",
      sizeCode: entity?.sizeCode ?? "S",
      priceRub: String(entity?.priceRub ?? 0),
      isTemporarilyAvailable: entity?.isTemporarilyAvailable ?? true
    };
  }

  if (target === "addon-group") {
    return {
      id: entity?.id ?? "",
      ownerType: "product",
      ownerId: entity?.ownerId ?? firstProduct?.id ?? "",
      name: entity?.name ?? "",
      selectionRule: entity?.selectionRule ?? "single",
      minCount: String(entity?.minCount ?? 0),
      maxCount: String(entity?.maxCount ?? 1),
      isTemporarilyAvailable: entity?.isTemporarilyAvailable ?? true
    };
  }

  return {
    id: entity?.id ?? "",
    addonGroupId: entity?.addonGroupId ?? firstGroup?.id ?? "",
    name: entity?.name ?? "",
    priceRub: String(entity?.priceRub ?? 0),
    isTemporarilyAvailable: entity?.isTemporarilyAvailable ?? true
  };
}

function buildMenuDialogPayload(dialog) {
  const payload = { ...dialog.form };
  if (!payload.id) {
    delete payload.id;
  }
  if ("sortOrder" in payload) {
    payload.sortOrder = Number(payload.sortOrder);
  }
  if ("priceRub" in payload) {
    payload.priceRub = Number(payload.priceRub);
  }
  if ("minCount" in payload) {
    payload.minCount = Number(payload.minCount);
  }
  if ("maxCount" in payload) {
    payload.maxCount = Number(payload.maxCount);
  }
  return payload;
}

export function useBackofficeApp() {
  const state = reactive({
    bootstrapLoading: true,
    globalError: "",
    blocked: false,
    role: "",
    currentTab: "orders",
    snackbar: "",
    orders: [],
    orderFilter: "all",
    orderActionId: "",
    rejectDialogOpen: false,
    rejectOrderId: null,
    rejectReason: "",
    rejectError: "",
    availability: {
      categories: [],
      products: [],
      sizes: [],
      addonGroups: [],
      addons: [],
      updatedAt: ""
    },
    availabilityLoading: false,
    availabilityError: "",
    availabilityFilter: "all",
    availabilityActionKey: "",
    menu: {
      categories: [],
      products: [],
      sizes: [],
      addonGroups: [],
      addons: []
    },
    menuLoaded: false,
    menuLoading: false,
    menuError: "",
    menuExpandedCategoryId: "",
    menuDialog: {
      open: false,
      target: "category",
      mode: "create",
      title: "",
      form: {},
      error: "",
      saving: false
    },
    users: [],
    usersLoaded: false,
    usersLoading: false,
    usersError: "",
    usersFilter: "all",
    usersSearch: "",
    usersSearchOpen: false,
    userActionId: "",
    userMenuId: null,
    settingsLoaded: false,
    settingsLoading: false,
    settingsSaving: false,
    settingsError: "",
    settings: {
      workingHoursStart: "",
      workingHoursEnd: "",
      slotCapacity: ""
    }
  });

  let snackbarTimer = null;

  const isAdmin = computed(() => state.role === "administrator");

  const visibleTabs = computed(() => [
    ...baseTabs,
    ...(isAdmin.value ? adminTabs : [])
  ]);

  const currentTitle = computed(() => visibleTabs.value.find((tab) => tab.id === state.currentTab)?.label ?? "");

  const filteredOrders = computed(() =>
    state.orders.filter(orderFilterMap[state.orderFilter] ?? orderFilterMap.all)
  );

  const availabilitySections = computed(() => {
    const sections = buildAvailabilitySections(state.availability);
    if (state.availabilityFilter === "all") {
      return sections;
    }
    return sections.filter((section) => section.id === state.availabilityFilter);
  });

  const availabilityTabs = computed(() => [
    { id: "all", label: "Все" },
    ...[...state.availability.categories]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((category) => ({ id: category.id, label: category.name }))
  ]);

  const menuCategories = computed(() => buildMenuModel(state.menu));

  const filteredUsers = computed(() => {
    const query = state.usersSearch.trim().toLowerCase();
    return state.users.filter((user) => {
      if (state.usersFilter === "barista" && user.role !== "barista") {
        return false;
      }
      if (state.usersFilter === "blocked" && !user.isBlocked) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        user.profileName.toLowerCase().includes(query) ||
        user.telegramId.toLowerCase().includes(query)
      );
    });
  });

  const roleLabel = computed(() => formatRole(state.role || "barista"));

  function setSnackbar(message) {
    state.snackbar = message;
    if (snackbarTimer) {
      window.clearTimeout(snackbarTimer);
    }
    if (typeof window !== "undefined") {
      snackbarTimer = window.setTimeout(() => {
        state.snackbar = "";
      }, 3200);
    }
  }

  function updateOrderSnapshot(order) {
    const index = state.orders.findIndex((entry) => entry.id === order.id);
    if (index >= 0) {
      state.orders[index] = order;
      return;
    }
    state.orders.unshift(order);
  }

  async function bootstrap() {
    state.bootstrapLoading = true;
    state.globalError = "";
    state.blocked = false;

    try {
      const [orders, availability] = await Promise.all([
        backofficeApi.getOrders(),
        backofficeApi.getAvailability()
      ]);

      state.orders = orders.orders;
      state.availability = availability;

      try {
        const settings = await adminApi.getSettings();
        state.role = "administrator";
        state.settings = cloneSettings(settings.settings);
        state.settingsLoaded = true;
      } catch (error) {
        if (error.status === 403) {
          state.role = "barista";
          state.settingsLoaded = false;
        } else {
          throw error;
        }
      }
    } catch (error) {
      state.globalError = error.message;
      state.blocked = error.status === 403;
    } finally {
      state.bootstrapLoading = false;
    }
  }

  async function refreshOrders() {
    const payload = await backofficeApi.getOrders();
    state.orders = payload.orders;
  }

  async function runOrderAction(order, action) {
    state.orderActionId = `${order.id}:${action}`;
    try {
      let updated;
      if (action === "confirm") {
        updated = await backofficeApi.confirmOrder(order.id);
        setSnackbar("Заказ подтверждён.");
      } else if (action === "ready") {
        updated = await backofficeApi.markReady(order.id);
        setSnackbar("Заказ отмечен как готовый.");
      } else {
        updated = await backofficeApi.closeOrder(order.id);
        setSnackbar("Заказ закрыт.");
      }
      updateOrderSnapshot(updated);
    } catch (error) {
      setSnackbar(error.message);
    } finally {
      state.orderActionId = "";
    }
  }

  function openRejectDialog(order) {
    state.rejectDialogOpen = true;
    state.rejectOrderId = order.id;
    state.rejectReason = "";
    state.rejectError = "";
  }

  function closeRejectDialog() {
    state.rejectDialogOpen = false;
    state.rejectOrderId = null;
    state.rejectReason = "";
    state.rejectError = "";
  }

  async function submitReject() {
    if (!state.rejectReason.trim()) {
      state.rejectError = "Укажите причину отклонения.";
      return;
    }

    state.orderActionId = `${state.rejectOrderId}:reject`;
    state.rejectError = "";
    try {
      const updated = await backofficeApi.rejectOrder(state.rejectOrderId, state.rejectReason.trim());
      updateOrderSnapshot(updated);
      closeRejectDialog();
      setSnackbar("Заказ отклонён.");
    } catch (error) {
      state.rejectError = error.message;
    } finally {
      state.orderActionId = "";
    }
  }

  async function loadAvailability({ silent = false } = {}) {
    if (!silent) {
      state.availabilityLoading = true;
    }
    state.availabilityError = "";
    try {
      state.availability = await backofficeApi.getAvailability();
    } catch (error) {
      state.availabilityError = error.message;
    } finally {
      state.availabilityLoading = false;
    }
  }

  async function toggleAvailability(target, idField, id, nextValue) {
    state.availabilityActionKey = `${target}:${id}`;
    try {
      await backofficeApi.updateAvailability(target, {
        [idField]: id,
        isTemporarilyAvailable: nextValue
      });
      await loadAvailability({ silent: true });
      setSnackbar("Доступность обновлена.");
    } catch (error) {
      setSnackbar(error.message);
    } finally {
      state.availabilityActionKey = "";
    }
  }

  async function loadMenu() {
    state.menuLoading = true;
    state.menuError = "";
    try {
      const payload = await adminApi.getMenu();
      state.menu = payload.menu;
      state.menuLoaded = true;
    } catch (error) {
      state.menuError = error.message;
    } finally {
      state.menuLoading = false;
    }
  }

  async function loadUsers() {
    state.usersLoading = true;
    state.usersError = "";
    try {
      const payload = await adminApi.getUsers();
      state.users = payload.users;
      state.usersLoaded = true;
    } catch (error) {
      state.usersError = error.message;
    } finally {
      state.usersLoading = false;
    }
  }

  async function loadSettings() {
    state.settingsLoading = true;
    state.settingsError = "";
    try {
      const payload = await adminApi.getSettings();
      state.settings = cloneSettings(payload.settings);
      state.settingsLoaded = true;
    } catch (error) {
      state.settingsError = error.message;
    } finally {
      state.settingsLoading = false;
    }
  }

  async function ensureTabData(tabId) {
    if (tabId === "menu" && isAdmin.value && !state.menuLoaded) {
      await loadMenu();
    }
    if (tabId === "users" && isAdmin.value && !state.usersLoaded) {
      await loadUsers();
    }
    if (tabId === "settings" && isAdmin.value && !state.settingsLoaded) {
      await loadSettings();
    }
  }

  async function selectTab(tabId) {
    if (!visibleTabs.value.some((tab) => tab.id === tabId)) {
      return;
    }
    state.currentTab = tabId;
    state.userMenuId = null;
    await ensureTabData(tabId);
  }

  function toggleMenuCategory(categoryId) {
    state.menuExpandedCategoryId =
      state.menuExpandedCategoryId === categoryId ? "" : categoryId;
  }

  function openMenuDialog(target, mode, entity = null) {
    state.menuDialog.open = true;
    state.menuDialog.target = target;
    state.menuDialog.mode = mode;
    state.menuDialog.error = "";
    state.menuDialog.saving = false;
    state.menuDialog.title =
      mode === "edit" ? `Редактировать ${target}` : `Новый ${target}`;
    state.menuDialog.form = buildMenuDialogSeed(state, target, mode, entity);
  }

  function closeMenuDialog() {
    state.menuDialog.open = false;
  }

  async function submitMenuDialog() {
    state.menuDialog.saving = true;
    state.menuDialog.error = "";
    try {
      await adminApi.saveMenuEntity(
        state.menuDialog.target,
        buildMenuDialogPayload(state.menuDialog)
      );
      closeMenuDialog();
      await Promise.all([loadMenu(), loadAvailability({ silent: true })]);
      setSnackbar("Меню обновлено.");
    } catch (error) {
      state.menuDialog.error = error.message;
    } finally {
      state.menuDialog.saving = false;
    }
  }

  function toggleUserSearch() {
    state.usersSearchOpen = !state.usersSearchOpen;
    if (!state.usersSearchOpen) {
      state.usersSearch = "";
    }
  }

  function toggleUserMenu(userId) {
    state.userMenuId = state.userMenuId === userId ? null : userId;
  }

  function upsertUser(user) {
    const index = state.users.findIndex((entry) => entry.id === user.id);
    if (index >= 0) {
      state.users[index] = user;
    }
  }

  async function updateUserRole(user, role) {
    state.userActionId = `${user.id}:role`;
    try {
      const payload = await adminApi.updateUserRole(user.telegramId, role);
      upsertUser(payload.user);
      state.userMenuId = null;
      setSnackbar("Роль пользователя обновлена.");
    } catch (error) {
      setSnackbar(error.message);
    } finally {
      state.userActionId = "";
    }
  }

  async function updateUserBlocked(user, isBlocked) {
    state.userActionId = `${user.id}:block`;
    try {
      const payload = await adminApi.updateUserBlock(user.telegramId, isBlocked);
      upsertUser(payload.user);
      state.userMenuId = null;
      setSnackbar(isBlocked ? "Пользователь заблокирован." : "Пользователь разблокирован.");
    } catch (error) {
      setSnackbar(error.message);
    } finally {
      state.userActionId = "";
    }
  }

  async function saveSettings() {
    state.settingsSaving = true;
    state.settingsError = "";
    try {
      const payload = await adminApi.updateSettings({
        workingHoursStart: state.settings.workingHoursStart,
        workingHoursEnd: state.settings.workingHoursEnd,
        slotCapacity: Number(state.settings.slotCapacity)
      });
      state.settings = cloneSettings(payload.settings);
      setSnackbar("Настройки сохранены.");
    } catch (error) {
      state.settingsError = error.message;
    } finally {
      state.settingsSaving = false;
    }
  }

  return {
    state,
    visibleTabs,
    currentTitle,
    filteredOrders,
    availabilityTabs,
    availabilitySections,
    menuCategories,
    filteredUsers,
    roleLabel,
    isAdmin,
    bootstrap,
    selectTab,
    refreshOrders,
    runOrderAction,
    openRejectDialog,
    closeRejectDialog,
    submitReject,
    loadAvailability,
    toggleAvailability,
    toggleMenuCategory,
    openMenuDialog,
    closeMenuDialog,
    submitMenuDialog,
    toggleUserSearch,
    toggleUserMenu,
    updateUserRole,
    updateUserBlocked,
    saveSettings,
    formatOrderStatus,
    formatRub,
    formatInitials,
    formatRole,
    formatUserSubtitle
  };
}
