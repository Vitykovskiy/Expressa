import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import App from "../App.vue";
import { vuetify } from "../plugins/vuetify";

function jsonResponse(payload, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload
  });
}

function buildOrders() {
  return {
    orders: [
      {
        id: 1,
        status: "Created",
        totalRub: 220,
        slot: { start: "09:00", end: "09:10" },
        rejectionReason: null,
        customer: { id: 3, telegramId: "3001" },
        items: [
          {
            id: 1,
            productId: "prod-cappuccino",
            productName: "Cappuccino",
            selectedSize: "S",
            addons: [{ id: "addon-milk-regular", name: "Regular milk", priceRub: 0 }],
            quantity: 1,
            lineTotalRub: 220
          }
        ],
        availableActions: ["confirm", "reject"],
        createdAt: "2026-03-28T09:00:00.000Z",
        updatedAt: "2026-03-28T09:00:00.000Z"
      }
    ]
  };
}

function buildAvailability() {
  return {
    categories: [{ id: "cat-coffee", name: "Coffee", sortOrder: 10 }],
    products: [
      {
        id: "prod-cappuccino",
        categoryId: "cat-coffee",
        name: "Cappuccino",
        isTemporarilyAvailable: true
      }
    ],
    sizes: [
      { id: "size-s", productId: "prod-cappuccino", name: "S", isTemporarilyAvailable: true }
    ],
    addonGroups: [],
    addons: [],
    updatedAt: "2026-03-28T10:34:44.525Z"
  };
}

function buildMenu() {
  return {
    menu: {
      categories: [{ id: "cat-coffee", name: "Coffee", sortOrder: 10, isActive: true }],
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
        {
          id: "size-s",
          productId: "prod-cappuccino",
          sizeCode: "S",
          priceRub: 220,
          isTemporarilyAvailable: true
        }
      ],
      addonGroups: [],
      addons: []
    }
  };
}

function buildSettings() {
  return {
    settings: {
      workingHoursStart: "09:00",
      workingHoursEnd: "20:00",
      slotCapacity: 5
    }
  };
}

function mountApp(fetchMock) {
  vi.stubGlobal("fetch", fetchMock);
  return mount(App, {
    global: {
      plugins: [vuetify]
    }
  });
}

function findButton(wrapper, label) {
  return wrapper
    .findAll("button")
    .find((button) => button.text().trim() === label);
}

function findButtonContaining(wrapper, label) {
  return wrapper
    .findAll("button")
    .find((button) => button.text().includes(label));
}

describe("backoffice app", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows administrator tabs and keeps menu collapsed by default", async () => {
    window.history.replaceState({}, "", "/?surface=backoffice&telegramId=1");

    const fetchMock = vi.fn((input, init = {}) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url.endsWith("/backoffice/orders")) {
        return jsonResponse(buildOrders());
      }
      if (url.endsWith("/backoffice/availability/list")) {
        return jsonResponse(buildAvailability());
      }
      if (url.endsWith("/admin/settings")) {
        return jsonResponse(buildSettings());
      }
      if (url.endsWith("/admin/menu/list")) {
        return jsonResponse(buildMenu());
      }

      throw new Error(`Unhandled request: ${url} ${init.method ?? "GET"}`);
    });

    const wrapper = mountApp(fetchMock);
    await flushPromises();

    expect(wrapper.text()).toContain("Меню");
    expect(wrapper.text()).toContain("Пользователи");
    expect(wrapper.text()).toContain("Настройки");

    await findButton(wrapper, "Меню").trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("Новая категория");
    expect(wrapper.text()).not.toContain("Espresso with milk foam");

    await findButtonContaining(wrapper, "Coffee").trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("Cappuccino");
    expect(wrapper.text()).toContain("Espresso with milk foam");
  });

  it("limits barista navigation to orders and availability", async () => {
    window.history.replaceState({}, "", "/?surface=backoffice&telegramId=2001");

    const fetchMock = vi.fn((input) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url.endsWith("/backoffice/orders")) {
        return jsonResponse(buildOrders());
      }
      if (url.endsWith("/backoffice/availability/list")) {
        return jsonResponse(buildAvailability());
      }
      if (url.endsWith("/admin/settings")) {
        return jsonResponse({ error: "Administrator role is required" }, 403);
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    const wrapper = mountApp(fetchMock);
    await flushPromises();

    expect(wrapper.text()).toContain("Заказы");
    expect(wrapper.text()).toContain("Доступность");
    expect(wrapper.text()).not.toContain("Меню");
    expect(wrapper.text()).not.toContain("Пользователи");
    expect(wrapper.text()).not.toContain("Настройки");
  });

  it("submits reject reason for created orders", async () => {
    window.history.replaceState({}, "", "/?surface=backoffice&telegramId=2001");

    const fetchMock = vi.fn((input, init = {}) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url.endsWith("/backoffice/orders")) {
        return jsonResponse(buildOrders());
      }
      if (url.endsWith("/backoffice/availability/list")) {
        return jsonResponse(buildAvailability());
      }
      if (url.endsWith("/admin/settings")) {
        return jsonResponse({ error: "Administrator role is required" }, 403);
      }
      if (url.endsWith("/backoffice/orders/1/reject")) {
        expect(JSON.parse(init.body)).toEqual({ reason: "Нет ингредиентов" });
        return jsonResponse({
          ...buildOrders().orders[0],
          status: "Rejected",
          rejectionReason: "Нет ингредиентов",
          availableActions: []
        });
      }

      throw new Error(`Unhandled request: ${url}`);
    });

    const wrapper = mountApp(fetchMock);
    await flushPromises();

    await findButton(wrapper, "Отклонить").trigger("click");
    await flushPromises();

    await wrapper.get("textarea").setValue("Нет ингредиентов");
    await wrapper.get(".backoffice-dialog__actions .backoffice-danger-button").trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("Отклонён");
    expect(wrapper.text()).toContain("Нет ингредиентов");
  });
});
