import { createHash } from "node:crypto";
import * as db from "./db.js";

export type MetaEventName =
  "PageView" | "ViewContent" | "Lead" | "InitiateCheckout" | "Purchase";

type MetaCustomData = {
  content_name?: string;
  content_ids?: string[];
  content_type?: "product";
  value?: number;
  currency?: "IDR";
  order_id?: string;
};

type MetaUserData = {
  email?: string;
  phone?: string;
  clientIp?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
};

export type SendMetaEventInput = {
  eventName: MetaEventName;
  eventId: string;
  sourceUrl: string;
  customData?: MetaCustomData;
  userData?: MetaUserData;
  useTestEventCode?: boolean;
};

const settingKey: Record<
  MetaEventName,
  keyof Awaited<ReturnType<typeof db.getMetaServerSettings>>["events"]
> = {
  PageView: "pageView",
  ViewContent: "viewContent",
  Lead: "lead",
  InitiateCheckout: "initiateCheckout",
  Purchase: "purchase",
};

export const normalizeEmail = (value: string) => value.trim().toLowerCase();
export const normalizePhone = (value: string) => value.replace(/\D/g, "");
export const sha256 = (value: string) =>
  createHash("sha256").update(value).digest("hex");

export function buildHashedUserData(userData: MetaUserData = {}) {
  const result: Record<string, string | string[]> = {};
  if (userData.email) {
    const normalized = normalizeEmail(userData.email);
    if (normalized) result.em = [sha256(normalized)];
  }
  if (userData.phone) {
    const normalized = normalizePhone(userData.phone);
    if (normalized) result.ph = [sha256(normalized)];
  }
  if (userData.clientIp) result.client_ip_address = userData.clientIp;
  if (userData.clientUserAgent)
    result.client_user_agent = userData.clientUserAgent;
  if (userData.fbp) result.fbp = userData.fbp;
  if (userData.fbc) result.fbc = userData.fbc;
  return result;
}

async function recordResult(
  input: SendMetaEventInput,
  status: "sent" | "failed" | "skipped"
) {
  const safe = {
    eventName: input.eventName,
    eventId: input.eventId,
    sentAt: new Date().toISOString(),
    status,
  } as const;
  try {
    await db.setMetaLastServerEvent(safe);
  } catch (error) {
    console.warn("[MetaCAPI] Unable to update status", {
      eventName: input.eventName,
      eventId: input.eventId,
      reason: error instanceof Error ? error.message : "unknown",
    });
  }
  return safe;
}

export async function sendMetaEvent(input: SendMetaEventInput) {
  const settings = await db.getMetaServerSettings();
  if (
    !input.useTestEventCode &&
    !settings.events[settingKey[input.eventName]]
  ) {
    await recordResult(input, "skipped");
    return { sent: false, status: "skipped" as const, reason: "disabled" };
  }
  if (!settings.pixelId || !settings.capiToken) {
    await recordResult(input, "skipped");
    return {
      sent: false,
      status: "skipped" as const,
      reason: "not_configured",
    };
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        event_source_url: input.sourceUrl,
        user_data: buildHashedUserData(input.userData),
        ...(input.customData ? { custom_data: input.customData } : {}),
      },
    ],
    access_token: settings.capiToken,
  };
  if (input.useTestEventCode && settings.testEventCode) {
    payload.test_event_code = settings.testEventCode;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${encodeURIComponent(settings.pixelId)}/events`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      }
    );
    const metaResult = (await response.json().catch(() => ({}))) as {
      events_received?: number;
      fbtrace_id?: string;
      error?: { code?: number; type?: string };
    };
    const status = response.ok ? "sent" : "failed";
    await recordResult(input, status);
    console.info("[MetaCAPI] Event delivery", {
      eventName: input.eventName,
      eventId: input.eventId,
      timestamp: new Date().toISOString(),
      httpStatus: response.status,
      status,
      eventsReceived: metaResult.events_received,
      metaErrorCode: metaResult.error?.code,
      metaErrorType: metaResult.error?.type,
      traceId: metaResult.fbtrace_id,
    });
    return { sent: response.ok, status, httpStatus: response.status };
  } catch (error) {
    await recordResult(input, "failed");
    console.warn("[MetaCAPI] Event delivery failed", {
      eventName: input.eventName,
      eventId: input.eventId,
      timestamp: new Date().toISOString(),
      reason: error instanceof Error ? error.message : "unknown",
    });
    return { sent: false, status: "failed" as const, reason: "request_failed" };
  }
}

// Call this only from a verified gateway webhook or backend payment-status flow.
export async function trackConfirmedPurchase(input: {
  eventId: string;
  sourceUrl: string;
  orderId: string;
  productId: string;
  productName: string;
  value: number;
  email?: string;
  phone?: string;
  clientIp?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
}) {
  return sendMetaEvent({
    eventName: "Purchase",
    eventId: input.eventId,
    sourceUrl: input.sourceUrl,
    customData: {
      content_name: input.productName,
      content_ids: [input.productId],
      content_type: "product",
      value: input.value,
      currency: "IDR",
      order_id: input.orderId,
    },
    userData: input,
  });
}
