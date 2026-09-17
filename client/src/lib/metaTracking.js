import { trpc } from "./trpc";

const eventSetting = {
  PageView: "pageView",
  ViewContent: "viewContent",
  Lead: "lead",
  InitiateCheckout: "initiateCheckout",
};

export function createMetaEventId() {
  return crypto.randomUUID();
}

export function getCookie(name) {
  const prefix = `${name}=`;
  const entry = document.cookie
    .split(";")
    .map(value => value.trim())
    .find(value => value.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : undefined;
}

export function trackMetaBrowserEvent(eventName, eventId, customData = {}) {
  if (typeof window.fbq !== "function") return false;
  window.fbq("track", eventName, customData, { eventID: eventId });
  return true;
}

export function useMetaTracking() {
  const settings = trpc.settings.public.useQuery(undefined, {
    retry: 1,
    staleTime: 300000,
  });
  const serverEvent = trpc.tracking.event.useMutation();

  const track = async (eventName, customData = {}) => {
    const enabled =
      settings.data?.metaEvents?.[eventSetting[eventName]] !== false;
    if (!enabled) return { sent: false, status: "disabled" };
    const eventId = createMetaEventId();
    trackMetaBrowserEvent(eventName, eventId, customData);
    try {
      return await serverEvent.mutateAsync({
        eventName,
        eventId,
        url: window.location.href,
        contentName: customData.content_name,
        contentIds: customData.content_ids,
        value: customData.value,
        currency: customData.currency,
        fbp: getCookie("_fbp"),
        fbc: getCookie("_fbc"),
      });
    } catch {
      return { sent: false, status: "failed" };
    }
  };

  const trackCheckoutAndNavigate = async (href, customData) => {
    const delivery = track("InitiateCheckout", customData);
    await Promise.race([
      delivery,
      new Promise(resolve => window.setTimeout(resolve, 180)),
    ]);
    window.location.assign(href);
  };

  return {
    pixelId: settings.data?.metaPixelId || "",
    events: settings.data?.metaEvents,
    track,
    trackCheckoutAndNavigate,
  };
}
