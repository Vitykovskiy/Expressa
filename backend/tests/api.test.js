const assert = require("node:assert/strict");
const http = require("node:http");
const { test } = require("node:test");
const { createApp } = require("../src/app");
const { createStore, STATUSES } = require("../src/store");

const TEST_CONFIG = {
  adminTelegramId: "1",
  disableTgAuth: true,
  defaultBaristaTelegramId: "2001",
  defaultCustomerTelegramId: "3001"
};

async function createHarness() {
  const store = createStore(TEST_CONFIG);
  const app = createApp({ config: TEST_CONFIG, store });
  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  async function request({ method = "GET", path, body, telegramId }) {
    const headers = {};
    if (telegramId !== undefined) {
      headers["x-telegram-id"] = String(telegramId);
    }
    if (body !== undefined) {
      headers["content-type"] = "application/json";
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const json = await response.json();
    return { status: response.status, json };
  }

  async function close() {
    await new Promise((resolve) => server.close(resolve));
  }

  return { store, request, close };
}

function pickCartPayload(menuJson) {
  const product = menuJson.categories[0].products[0];
  const selectedAddons = [];
  for (const group of product.addonGroups) {
    if (group.minCount > 0 && group.addons.length > 0) {
      selectedAddons.push(group.addons[0].id);
    }
  }
  return {
    productId: product.id,
    selectedSize: product.sizes[0].sizeCode,
    selectedAddons
  };
}

async function createOrderFlow(harness, customerTelegramId, slotStart) {
  const menuResponse = await harness.request({
    path: "/customer/menu",
    telegramId: customerTelegramId
  });
  assert.equal(menuResponse.status, 200);

  const cartPayload = pickCartPayload(menuResponse.json);
  const addItemResponse = await harness.request({
    method: "POST",
    path: "/customer/cart/items",
    telegramId: customerTelegramId,
    body: cartPayload
  });
  assert.equal(addItemResponse.status, 201);

  let selectedSlotStart = slotStart;
  if (!selectedSlotStart) {
    const slotsResponse = await harness.request({
      path: "/customer/slots",
      telegramId: customerTelegramId
    });
    assert.equal(slotsResponse.status, 200);
    const firstSelectableSlot = slotsResponse.json.slots.find((slot) => slot.selectable);
    selectedSlotStart = firstSelectableSlot.start;
  }

  const orderResponse = await harness.request({
    method: "POST",
    path: "/customer/orders",
    telegramId: customerTelegramId,
    body: { slotStart: selectedSlotStart }
  });
  assert.equal(orderResponse.status, 201);
  return orderResponse.json;
}

test("customer menu to order flow and history endpoint work", async () => {
  const harness = await createHarness();
  try {
    const order = await createOrderFlow(harness, 3001);
    assert.equal(order.status, STATUSES.CREATED);

    const historyResponse = await harness.request({
      path: "/customer/orders",
      telegramId: 3001
    });
    assert.equal(historyResponse.status, 200);
    assert.equal(historyResponse.json.orders.length, 1);
    assert.equal(historyResponse.json.orders[0].id, order.id);
  } finally {
    await harness.close();
  }
});

test("customer cart quantity mutation increments, decrements, and removes a line", async () => {
  const harness = await createHarness();
  try {
    const menuResponse = await harness.request({
      path: "/customer/menu",
      telegramId: 3001
    });
    assert.equal(menuResponse.status, 200);

    const addItemResponse = await harness.request({
      method: "POST",
      path: "/customer/cart/items",
      telegramId: 3001,
      body: pickCartPayload(menuResponse.json)
    });
    assert.equal(addItemResponse.status, 201);
    assert.equal(addItemResponse.json.items.length, 1);
    assert.equal(addItemResponse.json.items[0].quantity, 1);
    assert.equal(typeof addItemResponse.json.items[0].cartItemId, "number");

    const cartItemId = addItemResponse.json.items[0].cartItemId;
    const initialLineTotal = addItemResponse.json.items[0].lineTotalRub;

    const incrementResponse = await harness.request({
      method: "POST",
      path: `/customer/cart/items/${cartItemId}/quantity`,
      telegramId: 3001,
      body: { delta: 1 }
    });
    assert.equal(incrementResponse.status, 200);
    assert.equal(incrementResponse.json.items[0].quantity, 2);
    assert.equal(incrementResponse.json.items[0].lineTotalRub, initialLineTotal * 2);
    assert.equal(incrementResponse.json.totalRub, initialLineTotal * 2);

    const invalidDeltaResponse = await harness.request({
      method: "POST",
      path: `/customer/cart/items/${cartItemId}/quantity`,
      telegramId: 3001,
      body: { delta: 2 }
    });
    assert.equal(invalidDeltaResponse.status, 400);
    assert.equal(invalidDeltaResponse.json.error, "delta must be 1 or -1");

    const decrementToOneResponse = await harness.request({
      method: "POST",
      path: `/customer/cart/items/${cartItemId}/quantity`,
      telegramId: 3001,
      body: { delta: -1 }
    });
    assert.equal(decrementToOneResponse.status, 200);
    assert.equal(decrementToOneResponse.json.items[0].quantity, 1);
    assert.equal(decrementToOneResponse.json.items[0].lineTotalRub, initialLineTotal);

    const decrementToZeroResponse = await harness.request({
      method: "POST",
      path: `/customer/cart/items/${cartItemId}/quantity`,
      telegramId: 3001,
      body: { delta: -1 }
    });
    assert.equal(decrementToZeroResponse.status, 200);
    assert.equal(decrementToZeroResponse.json.items.length, 0);
    assert.equal(decrementToZeroResponse.json.totalRub, 0);

    const unknownLineResponse = await harness.request({
      method: "POST",
      path: `/customer/cart/items/${cartItemId}/quantity`,
      telegramId: 3001,
      body: { delta: 1 }
    });
    assert.equal(unknownLineResponse.status, 404);
    assert.equal(unknownLineResponse.json.error, "Cart item not found");

    const invalidLineIdResponse = await harness.request({
      method: "POST",
      path: "/customer/cart/items/invalid/quantity",
      telegramId: 3001,
      body: { delta: 1 }
    });
    assert.equal(invalidLineIdResponse.status, 400);
  } finally {
    await harness.close();
  }
});

test("rejection requires explicit reason", async () => {
  const harness = await createHarness();
  try {
    const order = await createOrderFlow(harness, 3001);

    const rejectWithoutReason = await harness.request({
      method: "POST",
      path: `/backoffice/orders/${order.id}/reject`,
      telegramId: 2001,
      body: {}
    });
    assert.equal(rejectWithoutReason.status, 400);

    const rejectWithReason = await harness.request({
      method: "POST",
      path: `/backoffice/orders/${order.id}/reject`,
      telegramId: 2001,
      body: { reason: "Machine maintenance" }
    });
    assert.equal(rejectWithReason.status, 200);
    assert.equal(rejectWithReason.json.status, STATUSES.REJECTED);
    assert.equal(rejectWithReason.json.rejectionReason, "Machine maintenance");
  } finally {
    await harness.close();
  }
});

test("status transitions and audit fields are persisted", async () => {
  const harness = await createHarness();
  try {
    const order = await createOrderFlow(harness, 3001);

    const confirmResponse = await harness.request({
      method: "POST",
      path: `/backoffice/orders/${order.id}/confirm`,
      telegramId: 2001
    });
    assert.equal(confirmResponse.status, 200);
    assert.equal(confirmResponse.json.status, STATUSES.CONFIRMED);
    assert.equal(confirmResponse.json.audit.confirmedBy, "2001");

    const readyResponse = await harness.request({
      method: "POST",
      path: `/backoffice/orders/${order.id}/ready`,
      telegramId: 2001
    });
    assert.equal(readyResponse.status, 200);
    assert.equal(readyResponse.json.status, STATUSES.READY_FOR_PICKUP);
    assert.equal(readyResponse.json.audit.readyBy, "2001");

    const closeResponse = await harness.request({
      method: "POST",
      path: `/backoffice/orders/${order.id}/close`,
      telegramId: 2001
    });
    assert.equal(closeResponse.status, 200);
    assert.equal(closeResponse.json.status, STATUSES.CLOSED);
  } finally {
    await harness.close();
  }
});

test("slot capacity counts only active statuses", async () => {
  const harness = await createHarness();
  try {
    const slotsResponse = await harness.request({
      path: "/customer/slots",
      telegramId: 3001
    });
    assert.equal(slotsResponse.status, 200);
    const targetSlot = slotsResponse.json.slots[0].start;

    for (let offset = 0; offset < 5; offset += 1) {
      await createOrderFlow(harness, 3001 + offset, targetSlot);
    }

    const menuResponse = await harness.request({
      path: "/customer/menu",
      telegramId: 3999
    });
    const cartPayload = pickCartPayload(menuResponse.json);
    const addCartResponse = await harness.request({
      method: "POST",
      path: "/customer/cart/items",
      telegramId: 3999,
      body: cartPayload
    });
    assert.equal(addCartResponse.status, 201);

    const fullSlotAttempt = await harness.request({
      method: "POST",
      path: "/customer/orders",
      telegramId: 3999,
      body: { slotStart: targetSlot }
    });
    assert.equal(fullSlotAttempt.status, 409);

    const orderList = await harness.request({
      path: "/backoffice/orders",
      telegramId: 2001
    });
    assert.equal(orderList.status, 200);
    const createdOrderId = orderList.json.orders[0].id;

    const rejectResponse = await harness.request({
      method: "POST",
      path: `/backoffice/orders/${createdOrderId}/reject`,
      telegramId: 2001,
      body: { reason: "Capacity check release" }
    });
    assert.equal(rejectResponse.status, 200);
    assert.equal(rejectResponse.json.status, STATUSES.REJECTED);

    const unblockedOrder = await createOrderFlow(harness, 4000, targetSlot);
    assert.equal(unblockedOrder.status, STATUSES.CREATED);
  } finally {
    await harness.close();
  }
});

test("blocked users and role checks are enforced", async () => {
  const harness = await createHarness();
  try {
    harness.store.setUserBlockedByTelegramId("3001", true);

    const blockedCustomerResponse = await harness.request({
      path: "/customer/menu",
      telegramId: 3001
    });
    assert.equal(blockedCustomerResponse.status, 403);

    const customerBackofficeResponse = await harness.request({
      path: "/backoffice/orders",
      telegramId: 3002
    });
    assert.equal(customerBackofficeResponse.status, 403);
  } finally {
    await harness.close();
  }
});

test("administrator contracts for menu, users, and settings are enforced and validated", async () => {
  const harness = await createHarness();
  try {
    const baristaSettingsAttempt = await harness.request({
      method: "POST",
      path: "/admin/settings",
      telegramId: 2001,
      body: { slotCapacity: 8 }
    });
    assert.equal(baristaSettingsAttempt.status, 403);
    assert.equal(baristaSettingsAttempt.json.error, "Administrator role is required");

    const settingsRead = await harness.request({
      method: "POST",
      path: "/admin/settings",
      telegramId: 1,
      body: {}
    });
    assert.equal(settingsRead.status, 200);
    assert.equal(settingsRead.json.settings.slotCapacity, 5);

    const invalidSettings = await harness.request({
      method: "POST",
      path: "/admin/settings",
      telegramId: 1,
      body: { workingHoursStart: "21:00", workingHoursEnd: "08:00" }
    });
    assert.equal(invalidSettings.status, 400);
    assert.equal(
      invalidSettings.json.error,
      "workingHoursStart must be earlier than workingHoursEnd"
    );

    const settingsUpdate = await harness.request({
      method: "POST",
      path: "/admin/settings",
      telegramId: 1,
      body: { workingHoursStart: "08:30", workingHoursEnd: "21:30", slotCapacity: 7 }
    });
    assert.equal(settingsUpdate.status, 200);
    assert.equal(settingsUpdate.json.settings.workingHoursStart, "08:30");
    assert.equal(settingsUpdate.json.settings.slotCapacity, 7);

    const menuList = await harness.request({
      method: "POST",
      path: "/admin/menu/list",
      telegramId: 1,
      body: {}
    });
    assert.equal(menuList.status, 200);
    assert.equal(menuList.json.menu.categories.length >= 1, true);

    const createCategory = await harness.request({
      method: "POST",
      path: "/admin/menu/category",
      telegramId: 1,
      body: {
        name: "Tea",
        sortOrder: 30,
        isActive: true
      }
    });
    assert.equal(createCategory.status, 200);
    assert.equal(createCategory.json.target, "category");
    assert.equal(createCategory.json.operation, "created");
    assert.equal(createCategory.json.entity.name, "Tea");

    const usersList = await harness.request({
      method: "POST",
      path: "/admin/users/list",
      telegramId: 1,
      body: {}
    });
    assert.equal(usersList.status, 200);
    assert.equal(usersList.json.users.some((user) => user.telegramId === "3001"), true);

    const promoteCustomer = await harness.request({
      method: "POST",
      path: "/admin/users/role",
      telegramId: 1,
      body: { telegramId: "3001", role: "barista" }
    });
    assert.equal(promoteCustomer.status, 200);
    assert.equal(promoteCustomer.json.user.role, "barista");

    const blockPromotedUser = await harness.request({
      method: "POST",
      path: "/admin/users/block",
      telegramId: 1,
      body: { telegramId: "3001", isBlocked: true }
    });
    assert.equal(blockPromotedUser.status, 200);
    assert.equal(blockPromotedUser.json.user.isBlocked, true);

    const blockedBackofficeAccess = await harness.request({
      path: "/backoffice/orders",
      telegramId: 3001
    });
    assert.equal(blockedBackofficeAccess.status, 403);

    const blockRootAdmin = await harness.request({
      method: "POST",
      path: "/admin/users/block",
      telegramId: 1,
      body: { telegramId: "1", isBlocked: true }
    });
    assert.equal(blockRootAdmin.status, 400);
    assert.equal(blockRootAdmin.json.error, "Root administrator cannot be blocked");
  } finally {
    await harness.close();
  }
});
