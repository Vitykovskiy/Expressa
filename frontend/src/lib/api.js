function resolveApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL ?? "";
}

function resolveQueryValue(name) {
  if (typeof window === "undefined") {
    return "";
  }
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

export function resolveAppSurface() {
  const override = resolveQueryValue("surface") || import.meta.env.VITE_APP_SURFACE;
  if (override === "backoffice") {
    return "backoffice";
  }
  if (typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/backoffice") || window.location.pathname.startsWith("/admin")) {
      return "backoffice";
    }
  }
  return "customer";
}

function resolveTelegramId(surface) {
  const override = resolveQueryValue("telegramId") || import.meta.env.VITE_TELEGRAM_ID;
  if (override) {
    return override;
  }
  if (surface === "backoffice") {
    return import.meta.env.VITE_BACKOFFICE_TELEGRAM_ID ?? "2001";
  }
  return import.meta.env.VITE_CUSTOMER_TELEGRAM_ID ?? "3001";
}

async function request(path, { method = "GET", body, surface = resolveAppSurface() } = {}) {
  const headers = {
    "x-telegram-id": resolveTelegramId(surface)
  };
  if (body !== undefined) {
    headers["content-type"] = "application/json";
  }

  const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const json = await response.json();
  if (!response.ok) {
    const error = new Error(json.error ?? "Request failed");
    error.status = response.status;
    throw error;
  }
  return json;
}

export const customerApi = {
  getMenu() {
    return request("/customer/menu", { surface: "customer" });
  },
  getCart() {
    return request("/customer/cart", { surface: "customer" });
  },
  addCartItem(payload) {
    return request("/customer/cart/items", {
      method: "POST",
      body: payload,
      surface: "customer"
    });
  },
  updateCartItemQuantity(cartItemId, delta) {
    return request(`/customer/cart/items/${cartItemId}/quantity`, {
      method: "POST",
      body: { delta },
      surface: "customer"
    });
  },
  getSlots() {
    return request("/customer/slots", { surface: "customer" });
  },
  createOrder(slotStart) {
    return request("/customer/orders", {
      method: "POST",
      body: { slotStart },
      surface: "customer"
    });
  },
  getOrders() {
    return request("/customer/orders", { surface: "customer" });
  }
};

export const backofficeApi = {
  getOrders() {
    return request("/backoffice/orders", { surface: "backoffice" });
  },
  confirmOrder(orderId) {
    return request(`/backoffice/orders/${orderId}/confirm`, {
      method: "POST",
      surface: "backoffice"
    });
  },
  rejectOrder(orderId, reason) {
    return request(`/backoffice/orders/${orderId}/reject`, {
      method: "POST",
      body: { reason },
      surface: "backoffice"
    });
  },
  markReady(orderId) {
    return request(`/backoffice/orders/${orderId}/ready`, {
      method: "POST",
      surface: "backoffice"
    });
  },
  closeOrder(orderId) {
    return request(`/backoffice/orders/${orderId}/close`, {
      method: "POST",
      surface: "backoffice"
    });
  },
  getAvailability() {
    return request("/backoffice/availability/list", {
      method: "POST",
      body: {},
      surface: "backoffice"
    });
  },
  updateAvailability(target, payload) {
    return request(`/backoffice/availability/${target}`, {
      method: "POST",
      body: payload,
      surface: "backoffice"
    });
  }
};

export const adminApi = {
  getMenu() {
    return request("/admin/menu/list", {
      method: "POST",
      body: {},
      surface: "backoffice"
    });
  },
  saveMenuEntity(target, payload) {
    return request(`/admin/menu/${target}`, {
      method: "POST",
      body: payload,
      surface: "backoffice"
    });
  },
  getUsers() {
    return request("/admin/users/list", {
      method: "POST",
      body: {},
      surface: "backoffice"
    });
  },
  updateUserRole(telegramId, role) {
    return request("/admin/users/role", {
      method: "POST",
      body: { telegramId, role },
      surface: "backoffice"
    });
  },
  updateUserBlock(telegramId, isBlocked) {
    return request("/admin/users/block", {
      method: "POST",
      body: { telegramId, isBlocked },
      surface: "backoffice"
    });
  },
  getSettings() {
    return request("/admin/settings", {
      method: "POST",
      body: {},
      surface: "backoffice"
    });
  },
  updateSettings(payload) {
    return request("/admin/settings", {
      method: "POST",
      body: payload,
      surface: "backoffice"
    });
  }
};
