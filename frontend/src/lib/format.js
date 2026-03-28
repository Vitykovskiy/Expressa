const statusLabels = {
  Created: "Создан",
  Confirmed: "Подтверждён",
  "Ready for pickup": "Готов",
  Rejected: "Отклонён",
  Closed: "Выдан"
};

const roleLabels = {
  administrator: "Администратор",
  barista: "Бариста",
  customer: "Клиент"
};

export function formatRub(value) {
  return `${value} ₽`;
}

export function formatOrderCount(count) {
  const tail = count % 10;
  const teen = count % 100;
  if (teen >= 11 && teen <= 14) {
    return `${count} заказов`;
  }
  if (tail === 1) {
    return `${count} заказ`;
  }
  if (tail >= 2 && tail <= 4) {
    return `${count} заказа`;
  }
  return `${count} заказов`;
}

export function formatItemCount(count) {
  if (count === 1) {
    return "1 позиция";
  }
  if (count >= 2 && count <= 4) {
    return `${count} позиции`;
  }
  return `${count} позиций`;
}

export function formatSlot(slot) {
  return `${slot.start} - ${slot.end}`;
}

export function formatOrderStatus(status) {
  return statusLabels[status] ?? status;
}

export function formatRole(role) {
  return roleLabels[role] ?? role;
}

export function formatInitials(value) {
  const parts = String(value ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) {
    return "EX";
  }
  return parts
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatUserSubtitle(user) {
  if (user.telegramId) {
    return `Telegram ${user.telegramId}`;
  }
  return "Без Telegram ID";
}

export function formatCategoryCount(count) {
  if (count === 1) {
    return "1 товар";
  }
  if (count >= 2 && count <= 4) {
    return `${count} товара`;
  }
  return `${count} товаров`;
}

export function formatOrderMeta(order) {
  const date = new Date(order.createdAt);
  const day = date.getUTCDate();
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  const months = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  return `${day} ${months[date.getUTCMonth()]}, ${hour}:${minute} · ${formatItemCount(order.items.length)}`;
}
