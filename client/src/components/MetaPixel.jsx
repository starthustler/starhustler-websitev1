import { useEffect } from "react";
import { trpc } from "../lib/trpc";
import { useLocation } from "wouter";
import {
  createMetaEventId,
  getCookie,
  trackMetaBrowserEvent,
} from "../lib/metaTracking.js";

export default function MetaPixel() {
  const query = trpc.settings.public.useQuery(undefined, {
    retry: 1,
    staleTime: 300000,
  });
  const track = trpc.tracking.event.useMutation();
  const [location] = useLocation();
  const pixelId = query.data?.metaPixelId;
  useEffect(() => {
    if (
      !pixelId ||
      !/^\d{5,30}$/.test(pixelId) ||
      query.data?.metaEvents?.pageView === false
    )
      return;
    if (!window.fbq) {
      const fbq = function () {
        fbq.callMethod
          ? fbq.callMethod.apply(fbq, arguments)
          : fbq.queue.push(arguments);
      };
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      window.fbq = fbq;
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);
      fbq("init", pixelId);
    }
    const eventId = createMetaEventId();
    trackMetaBrowserEvent("PageView", eventId);
    track.mutate({
      eventName: "PageView",
      eventId,
      url: window.location.href,
      fbp: getCookie("_fbp"),
      fbc: getCookie("_fbc"),
    });
  }, [pixelId, query.data?.metaEvents?.pageView, location]);
  return null;
}
