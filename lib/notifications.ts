import "server-only";

import { money, orderId as fmtOrderId } from "./format";
import { getDictionary } from "./i18n/dictionary";
import type { Locale, Order } from "./types";

/* Transactional notifications.

   No provider is wired yet — the confirmation page promises an email, and
   until a provider is configured this logs instead of silently doing nothing,
   so the gap is visible in the server output rather than invisible.

   To make it real, implement `send` against your provider. In Egypt SMS
   usually matters more than email, so both hooks are here:

     - Email: Resend, Postmark, SES
     - SMS:   Twilio, Vonage, or a local aggregator

   Set NOTIFY_FROM_EMAIL and the provider key, then replace the body of
   `send`. Everything upstream already awaits it. */

interface Message {
  channel: "email" | "sms";
  to: string;
  subject: string;
  body: string;
}

async function send(message: Message) {
  const configured = Boolean(process.env.NOTIFY_PROVIDER_KEY);
  if (!configured) {
    console.info(
      `[notify:${message.channel}] -> ${message.to}: ${message.subject}` +
        " (no provider configured; nothing sent)",
    );
    return { sent: false as const };
  }

  // Provider call goes here. Deliberately not implemented against a guess.
  console.warn(
    "[notify] NOTIFY_PROVIDER_KEY is set but no provider is implemented in lib/notifications.ts",
  );
  return { sent: false as const };
}

export async function notifyOrderPlaced(order: Order, locale: Locale) {
  const d = getDictionary(locale);
  const total = money(order.totals.total, locale);
  const id = fmtOrderId(order.id, locale);

  await Promise.all([
    send({
      channel: "email",
      to: order.customer.email,
      subject: `${d.brand} — ${d.confirm.orderNumber} ${order.id}`,
      body: `${d.confirm.title}\n${d.confirm.orderNumber}: ${id}\n${d.checkout.total}: ${total}`,
    }),
    send({
      channel: "sms",
      to: order.customer.phone,
      subject: `${d.brand} ${order.id}`,
      body: `${d.brand}: ${d.confirm.orderNumber} ${order.id} · ${total}`,
    }),
  ]);
}

export async function notifyOrderStatus(order: Order, locale: Locale) {
  const d = getDictionary(locale);
  await send({
    channel: "sms",
    to: order.customer.phone,
    subject: `${d.brand} ${order.id}`,
    body: `${d.brand}: ${order.id} — ${d.status[order.status]}`,
  });
}
