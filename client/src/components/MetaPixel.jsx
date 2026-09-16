import { useEffect } from "react";
import { trpc } from "../lib/trpc";
import { useLocation } from "wouter";

export default function MetaPixel() {
  const query = trpc.settings.public.useQuery(undefined, { retry: 1, staleTime: 300000 });
  const track = trpc.tracking.pageView.useMutation();
  const [location] = useLocation();
  const pixelId = query.data?.metaPixelId;
  useEffect(() => {
    if (!pixelId || !/^\d{5,30}$/.test(pixelId)) return;
    if (!window.fbq) {
      const fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
      fbq.queue = []; fbq.loaded = true; fbq.version = "2.0"; window.fbq = fbq;
      const script = document.createElement("script"); script.async = true; script.src = "https://connect.facebook.net/en_US/fbevents.js"; document.head.appendChild(script);
      fbq("init", pixelId);
    }
    const eventId = crypto.randomUUID();
    window.fbq("track", "PageView", {}, { eventID: eventId });
    track.mutate({ eventId, url: window.location.href });
  }, [pixelId, location]);
  return null;
}
