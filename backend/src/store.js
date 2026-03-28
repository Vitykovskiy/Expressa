const STATUSES = Object.freeze({
  CREATED: "Created",
  CONFIRMED: "Confirmed",
  READY_FOR_PICKUP: "Ready for pickup",
  REJECTED: "Rejected",
  CLOSED: "Closed"
});

const ACTIVE_SLOT_STATUSES = new Set([
  STATUSES.CREATED,
  STATUSES.CONFIRMED,
  STATUSES.READY_FOR_PICKUP
]);

const BACKOFFICE_ROLES = new Set(["barista", "administrator"]);

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function minutesToTimeString(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function timeStringToMinutes(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    throw httpError(500, `Invalid time format in settings: ${value}`);
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function parseInteger(value, fieldName) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) {
    return Number(value.trim());
  }
  throw httpError(400, `${fieldName} must be an integer`);
}

function parseBoolean(value, fieldName) {
  if (typeof value !== "boolean") {
    throw httpError(400, `${fieldName} must be boolean`);
  }
  return value;
}

function parseTimeValue(value, fieldName) {
  if (!isNonEmptyString(value)) {
    throw httpError(400, `${fieldName} must use HH:MM format`);
  }
  const trimmed = value.trim();
  const match = /^(\d{2}):(\d{2})$/.exec(trimmed);
  if (!match) {
    throw httpError(400, `${fieldName} must use HH:MM format`);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw httpError(400, `${fieldName} must use HH:MM format`);
  }
  return trimmed;
}

function normalizeTelegramId(value) {
  if (!isNonEmptyString(value) || !/^-?\d+$/.test(value.trim())) {
    throw httpError(400, "telegramId must be a numeric string");
  }
  return String(Number(value.trim()));
}

function resolveEntityId(providedId, prefix, collection) {
  if (providedId !== undefined) {
    if (!isNonEmptyString(providedId)) {
      throw httpError(400, "id must be a non-empty string when provided");
    }
    return providedId.trim();
  }

  let maxSuffix = 0;
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  for (const item of collection) {
    const match = pattern.exec(String(item.id ?? ""));
    if (!match) {
      continue;
    }
    maxSuffix = Math.max(maxSuffix, Number(match[1]));
  }
  return `${prefix}-${maxSuffix + 1}`;
}

function buildDefaultMenu() {
  return {
    categories: [
      { id: "cat-coffee", name: "Coffee", sortOrder: 10, isActive: true }
    ],
    products: [
      {
        id: "prod-cappuccino",
        categoryId: "cat-coffee",
        name: "Cappuccino",
        description: "Espresso with milk foam",
        baseState: "active",
        isTemporarilyAvailable: true
      }
    ],
    sizes: [
      { id: "size-s", productId: "prod-cappuccino", sizeCode: "S", priceRub: 220 },
      { id: "size-m", productId: "prod-cappuccino", sizeCode: "M", priceRub: 260 },
      { id: "size-l", productId: "prod-cappuccino", sizeCode: "L", priceRub: 300 }
    ],
    addonGroups: [
      {
        id: "group-milk",
        ownerType: "product",
        ownerId: "prod-cappuccino",
        name: "Milk type",
        selectionRule: "single",
        minCount: 1,
        maxCount: 1
      },
      {
        id: "group-extras",
        ownerType: "product",
        ownerId: "prod-cappuccino",
        name: "Extras",
        selectionRule: "multi",
        minCount: 0,
        maxCount: 2
      }
    ],
    addons: [
      {
        id: "addon-milk-regular",
        addonGroupId: "group-milk",
        name: "Regular milk",
        priceRub: 0,
        isTemporarilyAvailable: true
      },
      {
        id: "addon-milk-oat",
        addonGroupId: "group-milk",
        name: "Oat milk",
        priceRub: 40,
        isTemporarilyAvailable: true
      },
      {
        id: "addon-extra-shot",
        addonGroupId: "group-extras",
        name: "Extra espresso shot",
        priceRub: 60,
        isTemporarilyAvailable: true
      },
      {
        id: "addon-syrup-vanilla",
        addonGroupId: "group-extras",
        name: "Vanilla syrup",
        priceRub: 30,
        isTemporarilyAvailable: true
      }
    ]
  };
}

function createStore(config) {
  const adminTelegramId = String(config.adminTelegramId);
  const defaultBaristaTelegramId = String(config.defaultBaristaTelegramId);
  const defaultCustomerTelegramId = String(config.defaultCustomerTelegramId);

  const state = {
    users: [],
    menu: buildDefaultMenu(),
    settings: {
      workingHoursStart: "09:00",
      workingHoursEnd: "20:00",
      slotCapacity: 5
    },
    carts: new Map(),
    orders: [],
    nextUserId: 1,
    nextCartItemId: 1,
    nextOrderId: 1
  };

  function createUser(telegramId, role, profileName) {
    const user = {
      id: state.nextUserId++,
      telegramId: String(telegramId),
      role,
      isBlocked: false,
      profileName
    };
    state.users.push(user);
    return user;
  }

  createUser(adminTelegramId, "administrator", "Root Administrator");
  createUser(defaultBaristaTelegramId, "barista", "Seed Barista");
  createUser(defaultCustomerTelegramId, "customer", "Seed Customer");

  function getUserByTelegramId(telegramId) {
    return state.users.find((user) => user.telegramId === String(telegramId)) ?? null;
  }

  function getOrCreateCustomerByTelegramId(telegramId) {
    const existing = getUserByTelegramId(telegramId);
    if (existing) {
      return existing;
    }
    return createUser(telegramId, "customer", "Customer");
  }

  function setUserBlockedByTelegramId(telegramId, isBlocked) {
    const user = getUserByTelegramId(telegramId);
    if (!user) {
      throw httpError(404, "User not found");
    }
    user.isBlocked = Boolean(isBlocked);
    return user;
  }

  function getCart(userId) {
    let cart = state.carts.get(userId);
    if (!cart) {
      cart = {
        id: `cart-${userId}`,
        userId,
        items: [],
        updatedAt: new Date().toISOString()
      };
      state.carts.set(userId, cart);
    }
    return cart;
  }

  function formatCart(cart) {
    const totalRub = cart.items.reduce((sum, item) => sum + item.lineTotalRub, 0);
    return {
      id: cart.id,
      userId: cart.userId,
      totalRub,
      items: cart.items
    };
  }

  function listMenu() {
    const activeCategoryIds = new Set(
      state.menu.categories.filter((category) => category.isActive).map((category) => category.id)
    );

    const visibleProducts = state.menu.products.filter(
      (product) =>
        product.baseState === "active" &&
        product.isTemporarilyAvailable &&
        activeCategoryIds.has(product.categoryId)
    );
    const visibleProductIds = new Set(visibleProducts.map((product) => product.id));

    const sizesByProductId = new Map();
    for (const size of state.menu.sizes) {
      if (!visibleProductIds.has(size.productId)) {
        continue;
      }
      if (!sizesByProductId.has(size.productId)) {
        sizesByProductId.set(size.productId, []);
      }
      sizesByProductId.get(size.productId).push({
        sizeCode: size.sizeCode,
        priceRub: size.priceRub
      });
    }

    const groupsByProductId = new Map();
    for (const group of state.menu.addonGroups) {
      if (group.ownerType !== "product" || !visibleProductIds.has(group.ownerId)) {
        continue;
      }
      if (!groupsByProductId.has(group.ownerId)) {
        groupsByProductId.set(group.ownerId, []);
      }
      groupsByProductId.get(group.ownerId).push({
        id: group.id,
        name: group.name,
        selectionRule: group.selectionRule,
        minCount: group.minCount,
        maxCount: group.maxCount,
        addons: []
      });
    }

    const groupIndex = new Map();
    for (const groups of groupsByProductId.values()) {
      for (const group of groups) {
        groupIndex.set(group.id, group);
      }
    }

    for (const addon of state.menu.addons) {
      if (!addon.isTemporarilyAvailable) {
        continue;
      }
      const targetGroup = groupIndex.get(addon.addonGroupId);
      if (!targetGroup) {
        continue;
      }
      targetGroup.addons.push({
        id: addon.id,
        name: addon.name,
        priceRub: addon.priceRub
      });
    }

    const categories = state.menu.categories
      .filter((category) => category.isActive)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((category) => ({
        id: category.id,
        name: category.name,
        products: visibleProducts
          .filter((product) => product.categoryId === category.id)
          .map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            sizes: sizesByProductId.get(product.id) ?? [],
            addonGroups: (groupsByProductId.get(product.id) ?? []).filter((group) => group.addons.length > 0)
          }))
      }));

    return { categories };
  }

  function validateAndResolveCartItem(payload) {
    if (!payload || typeof payload !== "object") {
      throw httpError(400, "Request body must be a JSON object");
    }

    const productId = payload.productId;
    const selectedSize = payload.selectedSize;
    const selectedAddons = payload.selectedAddons ?? [];

    if (!isNonEmptyString(productId) || !isNonEmptyString(selectedSize)) {
      throw httpError(400, "productId and selectedSize are required");
    }
    if (!Array.isArray(selectedAddons)) {
      throw httpError(400, "selectedAddons must be an array");
    }

    const product = state.menu.products.find((item) => item.id === productId);
    if (!product || product.baseState !== "active" || !product.isTemporarilyAvailable) {
      throw httpError(400, "Product is unavailable");
    }

    const size = state.menu.sizes.find(
      (item) => item.productId === product.id && item.sizeCode === selectedSize
    );
    if (!size) {
      throw httpError(400, "Invalid size");
    }

    const uniqueSelectedAddons = new Set();
    for (const addonId of selectedAddons) {
      if (!isNonEmptyString(addonId)) {
        throw httpError(400, "Invalid addon id");
      }
      if (uniqueSelectedAddons.has(addonId)) {
        throw httpError(400, "Duplicate addon id is not allowed");
      }
      uniqueSelectedAddons.add(addonId);
    }

    const productGroups = state.menu.addonGroups.filter(
      (group) => group.ownerType === "product" && group.ownerId === product.id
    );

    const addonsById = new Map(
      state.menu.addons
        .filter((addon) => addon.isTemporarilyAvailable)
        .map((addon) => [addon.id, addon])
    );

    const selectedAddonObjects = [];
    for (const addonId of uniqueSelectedAddons) {
      const addon = addonsById.get(addonId);
      if (!addon) {
        throw httpError(400, `Addon ${addonId} is unavailable`);
      }
      selectedAddonObjects.push(addon);
    }

    for (const group of productGroups) {
      const selectedInGroup = selectedAddonObjects.filter((addon) => addon.addonGroupId === group.id);
      const count = selectedInGroup.length;
      if (count < group.minCount || count > group.maxCount) {
        throw httpError(400, `Addon selection violates group limits for ${group.name}`);
      }
      if (group.selectionRule === "single" && count > 1) {
        throw httpError(400, `Addon selection must be single for ${group.name}`);
      }
    }

    for (const addon of selectedAddonObjects) {
      const belongsToProduct = productGroups.some((group) => group.id === addon.addonGroupId);
      if (!belongsToProduct) {
        throw httpError(400, "Addon does not belong to selected product");
      }
    }

    const addons = selectedAddonObjects.map((addon) => ({
      id: addon.id,
      name: addon.name,
      priceRub: addon.priceRub
    }));
    const lineTotalRub = size.priceRub + addons.reduce((sum, addon) => sum + addon.priceRub, 0);

    return {
      id: state.nextCartItemId++,
      productId: product.id,
      productName: product.name,
      selectedSize: size.sizeCode,
      unitPriceRub: size.priceRub,
      addons,
      lineTotalRub
    };
  }

  function addCartItem(userId, payload) {
    const cart = getCart(userId);
    const item = validateAndResolveCartItem(payload);
    cart.items.push(item);
    cart.updatedAt = new Date().toISOString();
    return formatCart(cart);
  }

  function buildSlots(referenceDate) {
    const startMinutes = timeStringToMinutes(state.settings.workingHoursStart);
    const endMinutes = timeStringToMinutes(state.settings.workingHoursEnd);
    const slotDate = referenceDate.toISOString().slice(0, 10);

    const slots = [];
    for (let cursor = startMinutes; cursor < endMinutes; cursor += 10) {
      const slotStart = minutesToTimeString(cursor);
      const slotEnd = minutesToTimeString(Math.min(cursor + 10, endMinutes));

      const activeOrderCount = state.orders.filter(
        (order) =>
          order.slot.date === slotDate &&
          order.slot.start === slotStart &&
          ACTIVE_SLOT_STATUSES.has(order.status)
      ).length;
      const remainingCapacity = Math.max(0, state.settings.slotCapacity - activeOrderCount);

      slots.push({
        date: slotDate,
        start: slotStart,
        end: slotEnd,
        capacityLimit: state.settings.slotCapacity,
        activeOrderCount,
        remainingCapacity,
        selectable: remainingCapacity > 0
      });
    }

    return slots;
  }

  function listSlots(referenceDate = new Date()) {
    return {
      date: referenceDate.toISOString().slice(0, 10),
      slots: buildSlots(referenceDate)
    };
  }

  function toCustomerOrderSummary(order) {
    return {
      id: order.id,
      status: order.status,
      totalRub: order.totalRub,
      slot: order.slot,
      rejectionReason: order.rejectionReason,
      items: order.items.map((item) => ({
        productName: item.productName,
        selectedSize: item.selectedSize,
        lineTotalRub: item.lineTotalRub
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }

  function listCustomerOrders(userId) {
    return {
      orders: state.orders
        .filter((order) => order.userId === userId)
        .map((order) => toCustomerOrderSummary(order))
    };
  }

  function getAvailableActions(status) {
    if (status === STATUSES.CREATED) {
      return ["confirm", "reject"];
    }
    if (status === STATUSES.CONFIRMED) {
      return ["ready", "reject"];
    }
    if (status === STATUSES.READY_FOR_PICKUP) {
      return ["close"];
    }
    return [];
  }

  function toBackofficeQueueItem(order) {
    const customer = state.users.find((user) => user.id === order.userId);
    return {
      id: order.id,
      status: order.status,
      totalRub: order.totalRub,
      slot: order.slot,
      rejectionReason: order.rejectionReason,
      customer: {
        id: customer?.id ?? null,
        telegramId: customer?.telegramId ?? null
      },
      items: order.items,
      audit: order.audit,
      availableActions: getAvailableActions(order.status),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }

  function listBackofficeOrders() {
    return {
      orders: state.orders.map((order) => toBackofficeQueueItem(order))
    };
  }

  function createOrder(userId, payload, referenceDate = new Date()) {
    if (!payload || typeof payload !== "object") {
      throw httpError(400, "Request body must be a JSON object");
    }
    const slotStart = payload.slotStart;
    if (!isNonEmptyString(slotStart)) {
      throw httpError(400, "slotStart is required");
    }

    const cart = getCart(userId);
    if (cart.items.length === 0) {
      throw httpError(400, "Cart is empty");
    }

    const slots = buildSlots(referenceDate);
    const selectedSlot = slots.find((slot) => slot.start === slotStart);
    if (!selectedSlot) {
      throw httpError(400, "Invalid slot");
    }
    if (!selectedSlot.selectable) {
      throw httpError(409, "Selected slot is full");
    }

    const nowIso = new Date().toISOString();
    const order = {
      id: state.nextOrderId++,
      userId,
      status: STATUSES.CREATED,
      slot: {
        date: selectedSlot.date,
        start: selectedSlot.start,
        end: selectedSlot.end
      },
      items: cart.items.map((item) => ({ ...item })),
      totalRub: cart.items.reduce((sum, item) => sum + item.lineTotalRub, 0),
      rejectionReason: null,
      audit: {
        confirmedBy: null,
        readyBy: null,
        rejectedBy: null
      },
      createdAt: nowIso,
      updatedAt: nowIso
    };
    state.orders.push(order);

    cart.items = [];
    cart.updatedAt = nowIso;

    return toCustomerOrderSummary(order);
  }

  function findOrder(orderId) {
    const numericOrderId = Number(orderId);
    if (!Number.isInteger(numericOrderId) || numericOrderId <= 0) {
      throw httpError(400, "Order id must be a positive integer");
    }
    const order = state.orders.find((entry) => entry.id === numericOrderId);
    if (!order) {
      throw httpError(404, "Order not found");
    }
    return order;
  }

  function transitionOrder(orderId, action, actor, payload) {
    const order = findOrder(orderId);
    const nowIso = new Date().toISOString();

    if (action === "confirm") {
      if (order.status !== STATUSES.CREATED) {
        throw httpError(409, "Order cannot be confirmed from current status");
      }
      order.status = STATUSES.CONFIRMED;
      order.audit.confirmedBy = actor.telegramId;
    } else if (action === "reject") {
      const reason = payload?.reason;
      if (order.status !== STATUSES.CREATED && order.status !== STATUSES.CONFIRMED) {
        throw httpError(409, "Order cannot be rejected from current status");
      }
      if (!isNonEmptyString(reason)) {
        throw httpError(400, "Rejection reason is required");
      }
      order.status = STATUSES.REJECTED;
      order.rejectionReason = reason.trim();
      order.audit.rejectedBy = actor.telegramId;
    } else if (action === "ready") {
      if (order.status !== STATUSES.CONFIRMED) {
        throw httpError(409, "Order cannot be marked ready from current status");
      }
      order.status = STATUSES.READY_FOR_PICKUP;
      order.audit.readyBy = actor.telegramId;
    } else if (action === "close") {
      if (order.status !== STATUSES.READY_FOR_PICKUP) {
        throw httpError(409, "Order cannot be closed from current status");
      }
      order.status = STATUSES.CLOSED;
    } else {
      throw httpError(404, "Unsupported action");
    }

    order.updatedAt = nowIso;
    return toBackofficeQueueItem(order);
  }

  function setAvailability(target, payload) {
    if (!payload || typeof payload !== "object") {
      throw httpError(400, "Request body must be a JSON object");
    }
    if (target === "product") {
      if (!isNonEmptyString(payload.productId)) {
        throw httpError(400, "productId is required");
      }
      const product = state.menu.products.find((entry) => entry.id === payload.productId);
      if (!product) {
        throw httpError(404, "Product not found");
      }
      product.isTemporarilyAvailable = Boolean(payload.isTemporarilyAvailable);
      return {
        type: "product",
        id: product.id,
        isTemporarilyAvailable: product.isTemporarilyAvailable
      };
    }

    if (target === "addon") {
      if (!isNonEmptyString(payload.addonId)) {
        throw httpError(400, "addonId is required");
      }
      const addon = state.menu.addons.find((entry) => entry.id === payload.addonId);
      if (!addon) {
        throw httpError(404, "Addon not found");
      }
      addon.isTemporarilyAvailable = Boolean(payload.isTemporarilyAvailable);
      return {
        type: "addon",
        id: addon.id,
        isTemporarilyAvailable: addon.isTemporarilyAvailable
      };
    }

    throw httpError(404, "Unsupported availability target");
  }

  function asMenuSnapshot() {
    return {
      categories: state.menu.categories.map((category) => ({ ...category })),
      products: state.menu.products.map((product) => ({ ...product })),
      sizes: state.menu.sizes.map((size) => ({ ...size })),
      addonGroups: state.menu.addonGroups.map((group) => ({ ...group })),
      addons: state.menu.addons.map((addon) => ({ ...addon }))
    };
  }

  function upsertMenuCategory(payload) {
    if (!payload || typeof payload !== "object") {
      throw httpError(400, "Request body must be a JSON object");
    }
    if (!isNonEmptyString(payload.name)) {
      throw httpError(400, "name is required");
    }

    const id = resolveEntityId(payload.id, "cat", state.menu.categories);
    const existingIndex = state.menu.categories.findIndex((item) => item.id === id);
    const sortOrder = payload.sortOrder === undefined ? undefined : parseInteger(payload.sortOrder, "sortOrder");
    if (sortOrder !== undefined && sortOrder < 0) {
      throw httpError(400, "sortOrder must be greater than or equal to 0");
    }

    const isActive =
      payload.isActive === undefined ? undefined : parseBoolean(payload.isActive, "isActive");

    const existing = existingIndex >= 0 ? state.menu.categories[existingIndex] : null;
    const entity = {
      id,
      name: payload.name.trim(),
      sortOrder: sortOrder ?? existing?.sortOrder ?? 100,
      isActive: isActive ?? existing?.isActive ?? true
    };

    if (existingIndex >= 0) {
      state.menu.categories[existingIndex] = entity;
      return { target: "category", operation: "updated", entity };
    }

    state.menu.categories.push(entity);
    return { target: "category", operation: "created", entity };
  }

  function upsertMenuProduct(payload) {
    if (!payload || typeof payload !== "object") {
      throw httpError(400, "Request body must be a JSON object");
    }
    if (!isNonEmptyString(payload.name)) {
      throw httpError(400, "name is required");
    }
    if (!isNonEmptyString(payload.categoryId)) {
      throw httpError(400, "categoryId is required");
    }

    const categoryExists = state.menu.categories.some((item) => item.id === payload.categoryId);
    if (!categoryExists) {
      throw httpError(400, "categoryId references an unknown category");
    }

    const baseState = payload.baseState ?? "active";
    if (baseState !== "active" && baseState !== "inactive") {
      throw httpError(400, "baseState must be active or inactive");
    }

    const id = resolveEntityId(payload.id, "prod", state.menu.products);
    const existingIndex = state.menu.products.findIndex((item) => item.id === id);
    const existing = existingIndex >= 0 ? state.menu.products[existingIndex] : null;

    const entity = {
      id,
      categoryId: payload.categoryId,
      name: payload.name.trim(),
      description:
        payload.description === undefined
          ? existing?.description ?? ""
          : String(payload.description),
      baseState,
      isTemporarilyAvailable:
        payload.isTemporarilyAvailable === undefined
          ? existing?.isTemporarilyAvailable ?? true
          : parseBoolean(payload.isTemporarilyAvailable, "isTemporarilyAvailable")
    };

    if (existingIndex >= 0) {
      state.menu.products[existingIndex] = entity;
      return { target: "product", operation: "updated", entity };
    }

    state.menu.products.push(entity);
    return { target: "product", operation: "created", entity };
  }

  function upsertMenuSize(payload) {
    if (!payload || typeof payload !== "object") {
      throw httpError(400, "Request body must be a JSON object");
    }
    if (!isNonEmptyString(payload.productId)) {
      throw httpError(400, "productId is required");
    }
    if (!isNonEmptyString(payload.sizeCode)) {
      throw httpError(400, "sizeCode is required");
    }

    const productExists = state.menu.products.some((item) => item.id === payload.productId);
    if (!productExists) {
      throw httpError(400, "productId references an unknown product");
    }

    const sizeCode = payload.sizeCode.trim().toUpperCase();
    if (!["S", "M", "L"].includes(sizeCode)) {
      throw httpError(400, "sizeCode must be one of S, M, L");
    }

    const priceRub = parseInteger(payload.priceRub, "priceRub");
    if (priceRub < 0) {
      throw httpError(400, "priceRub must be greater than or equal to 0");
    }

    const id = resolveEntityId(payload.id, "size", state.menu.sizes);
    const existingIndex = state.menu.sizes.findIndex((item) => item.id === id);
    const entity = {
      id,
      productId: payload.productId,
      sizeCode,
      priceRub
    };

    if (existingIndex >= 0) {
      state.menu.sizes[existingIndex] = entity;
      return { target: "size", operation: "updated", entity };
    }

    state.menu.sizes.push(entity);
    return { target: "size", operation: "created", entity };
  }

  function upsertMenuAddonGroup(payload) {
    if (!payload || typeof payload !== "object") {
      throw httpError(400, "Request body must be a JSON object");
    }
    if (payload.ownerType !== "product") {
      throw httpError(400, "ownerType must be product");
    }
    if (!isNonEmptyString(payload.ownerId)) {
      throw httpError(400, "ownerId is required");
    }
    if (!isNonEmptyString(payload.name)) {
      throw httpError(400, "name is required");
    }
    if (!["single", "multi"].includes(payload.selectionRule)) {
      throw httpError(400, "selectionRule must be single or multi");
    }

    const productExists = state.menu.products.some((item) => item.id === payload.ownerId);
    if (!productExists) {
      throw httpError(400, "ownerId references an unknown product");
    }

    const minCount = parseInteger(payload.minCount, "minCount");
    const maxCount = parseInteger(payload.maxCount, "maxCount");
    if (minCount < 0 || maxCount < 0 || maxCount < minCount) {
      throw httpError(400, "minCount and maxCount must satisfy 0 <= minCount <= maxCount");
    }

    const id = resolveEntityId(payload.id, "group", state.menu.addonGroups);
    const existingIndex = state.menu.addonGroups.findIndex((item) => item.id === id);
    const entity = {
      id,
      ownerType: "product",
      ownerId: payload.ownerId,
      name: payload.name.trim(),
      selectionRule: payload.selectionRule,
      minCount,
      maxCount
    };

    if (existingIndex >= 0) {
      state.menu.addonGroups[existingIndex] = entity;
      return { target: "addon-group", operation: "updated", entity };
    }

    state.menu.addonGroups.push(entity);
    return { target: "addon-group", operation: "created", entity };
  }

  function upsertMenuAddon(payload) {
    if (!payload || typeof payload !== "object") {
      throw httpError(400, "Request body must be a JSON object");
    }
    if (!isNonEmptyString(payload.addonGroupId)) {
      throw httpError(400, "addonGroupId is required");
    }
    if (!isNonEmptyString(payload.name)) {
      throw httpError(400, "name is required");
    }

    const groupExists = state.menu.addonGroups.some((item) => item.id === payload.addonGroupId);
    if (!groupExists) {
      throw httpError(400, "addonGroupId references an unknown addon group");
    }

    const priceRub = parseInteger(payload.priceRub, "priceRub");
    if (priceRub < 0) {
      throw httpError(400, "priceRub must be greater than or equal to 0");
    }

    const id = resolveEntityId(payload.id, "addon", state.menu.addons);
    const existingIndex = state.menu.addons.findIndex((item) => item.id === id);
    const existing = existingIndex >= 0 ? state.menu.addons[existingIndex] : null;
    const entity = {
      id,
      addonGroupId: payload.addonGroupId,
      name: payload.name.trim(),
      priceRub,
      isTemporarilyAvailable:
        payload.isTemporarilyAvailable === undefined
          ? existing?.isTemporarilyAvailable ?? true
          : parseBoolean(payload.isTemporarilyAvailable, "isTemporarilyAvailable")
    };

    if (existingIndex >= 0) {
      state.menu.addons[existingIndex] = entity;
      return { target: "addon", operation: "updated", entity };
    }

    state.menu.addons.push(entity);
    return { target: "addon", operation: "created", entity };
  }

  function adminMutateMenu(target, payload) {
    if (target === "list") {
      return { target: "list", menu: asMenuSnapshot() };
    }

    if (target === "category") {
      return upsertMenuCategory(payload);
    }
    if (target === "product") {
      return upsertMenuProduct(payload);
    }
    if (target === "size") {
      return upsertMenuSize(payload);
    }
    if (target === "addon-group") {
      return upsertMenuAddonGroup(payload);
    }
    if (target === "addon") {
      return upsertMenuAddon(payload);
    }

    throw httpError(404, "Unsupported menu target");
  }

  function toAdminUserView(user) {
    return {
      id: user.id,
      telegramId: user.telegramId,
      role: user.role,
      isBlocked: user.isBlocked,
      profileName: user.profileName
    };
  }

  function adminMutateUsers(target, payload) {
    if (target === "list") {
      return { target: "list", users: state.users.map((user) => toAdminUserView(user)) };
    }
    if (!payload || typeof payload !== "object") {
      throw httpError(400, "Request body must be a JSON object");
    }

    const telegramId = normalizeTelegramId(payload.telegramId);
    const user = getUserByTelegramId(telegramId);
    if (!user) {
      throw httpError(404, "User not found");
    }

    if (target === "role") {
      if (!isNonEmptyString(payload.role)) {
        throw httpError(400, "role is required");
      }
      const role = payload.role.trim();
      if (!["customer", "barista"].includes(role)) {
        throw httpError(400, "role must be customer or barista");
      }
      if (user.telegramId === adminTelegramId) {
        throw httpError(400, "Root administrator role cannot be changed");
      }
      user.role = role;
      return { target: "role", user: toAdminUserView(user) };
    }

    if (target === "block") {
      const isBlocked = parseBoolean(payload.isBlocked, "isBlocked");
      if (user.telegramId === adminTelegramId && isBlocked) {
        throw httpError(400, "Root administrator cannot be blocked");
      }
      user.isBlocked = isBlocked;
      return { target: "block", user: toAdminUserView(user) };
    }

    throw httpError(404, "Unsupported users target");
  }

  function adminUpdateSettings(payload) {
    if (payload === undefined || payload === null) {
      return { settings: { ...state.settings } };
    }
    if (typeof payload !== "object") {
      throw httpError(400, "Request body must be a JSON object");
    }

    const allowedKeys = new Set(["workingHoursStart", "workingHoursEnd", "slotCapacity"]);
    const payloadKeys = Object.keys(payload);
    for (const key of payloadKeys) {
      if (!allowedKeys.has(key)) {
        throw httpError(400, `Unsupported settings field: ${key}`);
      }
    }
    if (payloadKeys.length === 0) {
      return { settings: { ...state.settings } };
    }

    const nextSettings = { ...state.settings };
    if (payload.workingHoursStart !== undefined) {
      nextSettings.workingHoursStart = parseTimeValue(payload.workingHoursStart, "workingHoursStart");
    }
    if (payload.workingHoursEnd !== undefined) {
      nextSettings.workingHoursEnd = parseTimeValue(payload.workingHoursEnd, "workingHoursEnd");
    }
    if (payload.slotCapacity !== undefined) {
      const slotCapacity = parseInteger(payload.slotCapacity, "slotCapacity");
      if (slotCapacity <= 0) {
        throw httpError(400, "slotCapacity must be greater than 0");
      }
      nextSettings.slotCapacity = slotCapacity;
    }

    const startMinutes = timeStringToMinutes(nextSettings.workingHoursStart);
    const endMinutes = timeStringToMinutes(nextSettings.workingHoursEnd);
    if (startMinutes >= endMinutes) {
      throw httpError(400, "workingHoursStart must be earlier than workingHoursEnd");
    }

    state.settings = nextSettings;
    return { settings: { ...state.settings } };
  }

  function isBackofficeRole(role) {
    return BACKOFFICE_ROLES.has(role);
  }

  return {
    getUserByTelegramId,
    getOrCreateCustomerByTelegramId,
    setUserBlockedByTelegramId,
    isBackofficeRole,
    listMenu,
    addCartItem,
    getCartByUserId(userId) {
      return formatCart(getCart(userId));
    },
    listSlots,
    createOrder,
    listCustomerOrders,
    listBackofficeOrders,
    transitionOrder,
    setAvailability,
    adminMutateMenu,
    adminMutateUsers,
    adminUpdateSettings
  };
}

module.exports = {
  createStore,
  httpError,
  STATUSES
};
