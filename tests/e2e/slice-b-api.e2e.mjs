import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

function parseArgs(argv) {
  const args = {
    "--base-url": "http://127.0.0.1:18081",
    "--actors": "tests/e2e/fixtures/actors.json"
  };

  for (let index = 2; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!value) {
      throw new Error(`Missing value for argument ${key}`);
    }
    args[key] = value;
  }

  return {
    baseUrl: args["--base-url"].replace(/\/+$/, ""),
    actorsFile: args["--actors"]
  };
}

async function loadJson(path) {
  const content = await readFile(path, "utf8");
  return JSON.parse(content);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(baseUrl) {
  const attempts = 30;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/healthz`);
      if (response.ok) {
        return;
      }
    } catch {
      // Service can be unavailable while booting.
    }
    await sleep(1000);
  }
  throw new Error(`Backend is not healthy at ${baseUrl}/healthz`);
}

async function request(baseUrl, { path, method = "GET", actorId, body }) {
  const headers = {};
  if (actorId) {
    headers["x-telegram-id"] = String(actorId);
  }
  if (body !== undefined) {
    headers["content-type"] = "application/json";
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : { raw: await response.text() };

  return { status: response.status, payload };
}

function requireArray(payload, key) {
  assert.ok(payload && Array.isArray(payload[key]), `Response must include array '${key}'`);
  return payload[key];
}

async function main() {
  const { baseUrl, actorsFile } = parseArgs(process.argv);
  const actors = await loadJson(actorsFile);

  const adminId = process.env.ADMIN_TELEGRAM_ID || actors.adminTelegramId;
  const baristaId = process.env.BARISTA_TELEGRAM_ID || actors.baristaTelegramId;
  const customerId = process.env.CUSTOMER_TELEGRAM_ID || actors.customerTelegramId;

  await waitForHealth(baseUrl);
  console.log(`Backend is healthy at ${baseUrl}`);

  console.log("Scenario 1: administrator read-model endpoints and role boundaries");
  const settingsRead = await request(baseUrl, {
    method: "POST",
    path: "/admin/settings",
    actorId: adminId,
    body: {}
  });
  assert.equal(settingsRead.status, 200, "Admin settings read must succeed");
  assert.ok(settingsRead.payload.settings, "Settings payload must contain settings object");
  assert.ok(settingsRead.payload.settings.workingHoursStart, "Settings must contain workingHoursStart");
  assert.ok(settingsRead.payload.settings.workingHoursEnd, "Settings must contain workingHoursEnd");
  assert.ok(Number.isInteger(settingsRead.payload.settings.slotCapacity), "Settings must contain slotCapacity");

  const menuRead = await request(baseUrl, {
    method: "POST",
    path: "/admin/menu/list",
    actorId: adminId,
    body: {}
  });
  assert.equal(menuRead.status, 200, "Admin menu list must succeed");
  assert.ok(menuRead.payload.menu, "Menu payload must contain menu object");
  requireArray(menuRead.payload.menu, "categories");
  requireArray(menuRead.payload.menu, "products");
  requireArray(menuRead.payload.menu, "sizes");

  const usersRead = await request(baseUrl, {
    method: "POST",
    path: "/admin/users/list",
    actorId: adminId,
    body: {}
  });
  assert.equal(usersRead.status, 200, "Admin users list must succeed");
  const users = requireArray(usersRead.payload, "users");
  assert.ok(
    users.some((candidate) => String(candidate.telegramId) === String(baristaId)),
    "Users list must include the seeded barista actor"
  );
  assert.ok(
    users.some((candidate) => String(candidate.telegramId) === String(customerId)),
    "Users list must include the seeded customer actor"
  );

  const baristaAdminDenied = await request(baseUrl, {
    method: "POST",
    path: "/admin/menu/list",
    actorId: baristaId,
    body: {}
  });
  assert.equal(baristaAdminDenied.status, 403, "Barista must be denied from /admin/menu/list");

  console.log("Scenario 2: backoffice availability read-model and mutation round-trip");
  const customerAvailabilityDenied = await request(baseUrl, {
    method: "POST",
    path: "/backoffice/availability/list",
    actorId: customerId,
    body: {}
  });
  assert.equal(customerAvailabilityDenied.status, 403, "Customer must be denied from backoffice availability");

  const availabilityRead = await request(baseUrl, {
    method: "POST",
    path: "/backoffice/availability/list",
    actorId: baristaId,
    body: {}
  });
  assert.equal(availabilityRead.status, 200, "Barista availability read-model must succeed");
  const products = requireArray(availabilityRead.payload, "products");
  const product = products[0];
  assert.ok(product?.id, "Availability read-model must include at least one product");
  assert.equal(
    typeof product.isTemporarilyAvailable,
    "boolean",
    "Availability read-model must include boolean availability flags"
  );

  const targetAvailability = !product.isTemporarilyAvailable;
  const toggleAvailability = await request(baseUrl, {
    method: "POST",
    path: "/backoffice/availability/product",
    actorId: baristaId,
    body: {
      productId: product.id,
      isTemporarilyAvailable: targetAvailability
    }
  });
  assert.equal(toggleAvailability.status, 200, "Availability toggle must succeed");
  assert.equal(
    toggleAvailability.payload.isTemporarilyAvailable,
    targetAvailability,
    "Availability mutation response must reflect the new state"
  );

  const availabilityReload = await request(baseUrl, {
    method: "POST",
    path: "/backoffice/availability/list",
    actorId: baristaId,
    body: {}
  });
  assert.equal(availabilityReload.status, 200, "Availability reload after mutation must succeed");
  const reloadedProduct = requireArray(availabilityReload.payload, "products")
    .find((candidate) => candidate.id === product.id);
  assert.ok(reloadedProduct, "Reloaded availability payload must still include the mutated product");
  assert.equal(
    reloadedProduct.isTemporarilyAvailable,
    targetAvailability,
    "Availability reload must reflect the mutated availability state"
  );

  const restoreAvailability = await request(baseUrl, {
    method: "POST",
    path: "/backoffice/availability/product",
    actorId: baristaId,
    body: {
      productId: product.id,
      isTemporarilyAvailable: product.isTemporarilyAvailable
    }
  });
  assert.equal(restoreAvailability.status, 200, "Availability restore must succeed");
  assert.equal(
    restoreAvailability.payload.isTemporarilyAvailable,
    product.isTemporarilyAvailable,
    "Availability restore must return the original state"
  );

  console.log("Scenario 3: administrator settings update remains round-trippable");
  const originalSettings = settingsRead.payload.settings;
  const updatedSettings = {
    workingHoursStart: "00:00",
    workingHoursEnd: "23:59",
    slotCapacity: Math.max(Number(originalSettings.slotCapacity || 0), 1) + 1
  };
  const settingsUpdate = await request(baseUrl, {
    method: "POST",
    path: "/admin/settings",
    actorId: adminId,
    body: updatedSettings
  });
  assert.equal(settingsUpdate.status, 200, "Settings update must succeed");
  assert.deepEqual(settingsUpdate.payload.settings, updatedSettings, "Updated settings must persist");

  const settingsRestore = await request(baseUrl, {
    method: "POST",
    path: "/admin/settings",
    actorId: adminId,
    body: originalSettings
  });
  assert.equal(settingsRestore.status, 200, "Settings restore must succeed");
  assert.deepEqual(
    settingsRestore.payload.settings,
    originalSettings,
    "Restored settings must match the original baseline"
  );

  console.log("All Slice B QA integration scenarios passed.");
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
