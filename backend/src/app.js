const express = require("express");
const { createStore, httpError } = require("./store");

function parseBoolean(value, fallbackValue) {
  if (value === undefined) {
    return fallbackValue;
  }
  return String(value).toLowerCase() === "true";
}

function createConfigFromEnv(env = process.env) {
  const adminTelegramId = env.ADMIN_TELEGRAM_ID;
  if (!adminTelegramId) {
    throw new Error("ADMIN_TELEGRAM_ID is required");
  }

  return {
    adminTelegramId: String(adminTelegramId),
    disableTgAuth: parseBoolean(env.DISABLE_TG_AUTH, false),
    defaultBaristaTelegramId: String(env.BARISTA_TELEGRAM_ID ?? "2001"),
    defaultCustomerTelegramId: String(env.CUSTOMER_TELEGRAM_ID ?? "3001")
  };
}

function toNumericTelegramId(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }
  if (!/^-?\d+$/.test(value.trim())) {
    return null;
  }
  return String(Number(value.trim()));
}

function createApp({ config = createConfigFromEnv(), store = createStore(config) } = {}) {
  const app = express();
  app.use(express.json());

  function resolveActor(req, surface) {
    const headerTelegramId = toNumericTelegramId(req.header("x-telegram-id") ?? "");

    let telegramId = headerTelegramId;
    if (!telegramId && config.disableTgAuth && surface === "customer") {
      telegramId = config.defaultCustomerTelegramId;
    }

    if (!telegramId) {
      throw httpError(401, "x-telegram-id header is required");
    }

    const actor =
      surface === "customer"
        ? store.getOrCreateCustomerByTelegramId(telegramId)
        : store.getUserByTelegramId(telegramId);

    if (!actor) {
      throw httpError(403, "Access denied");
    }
    if (actor.isBlocked) {
      throw httpError(403, "User is blocked");
    }
    if (surface === "backoffice" && !store.isBackofficeRole(actor.role)) {
      throw httpError(403, "Backoffice access requires barista or administrator role");
    }

    return actor;
  }

  function withActor(surface, handler) {
    return (req, res, next) => {
      try {
        req.actor = resolveActor(req, surface);
        handler(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }

  function withAdministrator(handler) {
    return withActor("backoffice", (req, res, next) => {
      if (req.actor.role !== "administrator") {
        throw httpError(403, "Administrator role is required");
      }
      handler(req, res, next);
    });
  }

  app.get("/", (_req, res) => {
    res.json({ service: "expressa-backend", slice: "A" });
  });

  app.get("/healthz", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get(
    "/customer/menu",
    withActor("customer", (_req, res) => {
      res.json(store.listMenu());
    })
  );

  app.post(
    "/customer/cart/items",
    withActor("customer", (req, res) => {
      const payload = {
        productId: req.body?.productId,
        selectedSize: req.body?.selectedSize ?? req.body?.sizeCode,
        selectedAddons: req.body?.selectedAddons ?? req.body?.addonIds ?? []
      };
      res.status(201).json(store.addCartItem(req.actor.id, payload));
    })
  );

  app.post(
    "/customer/cart/items/:id/quantity",
    withActor("customer", (req, res) => {
      res.json(store.mutateCartItemQuantity(req.actor.id, req.params.id, req.body));
    })
  );

  app.get(
    "/customer/cart",
    withActor("customer", (req, res) => {
      res.json(store.getCartByUserId(req.actor.id));
    })
  );

  app.get(
    "/customer/slots",
    withActor("customer", (_req, res) => {
      res.json(store.listSlots(new Date()));
    })
  );

  app.post(
    "/customer/orders",
    withActor("customer", (req, res) => {
      const payload = {
        slotStart: req.body?.slotStart ?? req.body?.slot
      };
      const createdOrder = store.createOrder(req.actor.id, payload, new Date());
      res.status(201).json(createdOrder);
    })
  );

  app.get(
    "/customer/orders",
    withActor("customer", (req, res) => {
      res.json(store.listCustomerOrders(req.actor.id));
    })
  );

  app.get(
    "/backoffice/orders",
    withActor("backoffice", (_req, res) => {
      res.json(store.listBackofficeOrders());
    })
  );

  app.post(
    "/backoffice/orders/:id/confirm",
    withActor("backoffice", (req, res) => {
      res.json(store.transitionOrder(req.params.id, "confirm", req.actor, req.body));
    })
  );

  app.post(
    "/backoffice/orders/:id/reject",
    withActor("backoffice", (req, res) => {
      res.json(store.transitionOrder(req.params.id, "reject", req.actor, req.body));
    })
  );

  app.post(
    "/backoffice/orders/:id/ready",
    withActor("backoffice", (req, res) => {
      res.json(store.transitionOrder(req.params.id, "ready", req.actor, req.body));
    })
  );

  app.post(
    "/backoffice/orders/:id/close",
    withActor("backoffice", (req, res) => {
      res.json(store.transitionOrder(req.params.id, "close", req.actor, req.body));
    })
  );

  app.post(
    "/backoffice/availability/:target",
    withActor("backoffice", (req, res) => {
      res.json(store.setAvailability(req.params.target, req.body));
    })
  );

  app.post(
    "/admin/menu/:target",
    withAdministrator((req, res) => {
      res.json(store.adminMutateMenu(req.params.target, req.body));
    })
  );

  app.post(
    "/admin/users/:target",
    withAdministrator((req, res) => {
      res.json(store.adminMutateUsers(req.params.target, req.body));
    })
  );

  app.post(
    "/admin/settings",
    withAdministrator((req, res) => {
      res.json(store.adminUpdateSettings(req.body));
    })
  );

  app.use((error, _req, res, _next) => {
    const status = Number(error?.status) || 500;
    res.status(status).json({
      error: status >= 500 ? "Internal server error" : error.message
    });
  });

  return app;
}

module.exports = {
  createApp,
  createConfigFromEnv
};
