import { useEffect, useMemo, useState } from "react";
import { formatRupiah } from "@shared/classContent";

function useCountdown(config) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!config.enabled || !config.endDateTime) return;
    const tick = () =>
      setRemaining(
        Math.max(0, new Date(config.endDateTime).getTime() - Date.now())
      );
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [config.enabled, config.endDateTime]);
  if (!config.enabled || !config.endDateTime) return "";
  if (!remaining) return config.expiredText || "";
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return `${days ? `${days} hari ` : ""}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function AnnouncementBar({ config, paymentUrl }) {
  if (!config.enabled) return null;
  return (
    <aside
      className={`class-announcement class-announcement--${config.variant}`}
    >
      <span>
        {config.mainText} <strong>{config.highlightText}</strong>
      </span>
      {config.ctaLabel && (
        <a href={config.ctaUrl || paymentUrl}>{config.ctaLabel}</a>
      )}
    </aside>
  );
}

export function FloatingCta({ config, countdown, paymentUrl }) {
  const time = useCountdown(countdown);
  if (!config.enabled) return null;
  return (
    <aside className="class-floating-cta" aria-label="Daftar kelas">
      <div className="class-floating-cta__inner">
        <div className="class-floating-cta__copy">
          <strong>
            {config.icon} {config.title}
          </strong>
          <span>{config.subtitle}</span>
          <div className="class-floating-cta__price">
            <b>{formatRupiah(config.currentPrice)}</b>
            {config.originalPrice > config.currentPrice && (
              <s>{formatRupiah(config.originalPrice)}</s>
            )}
            {time && (
              <small>
                {countdown.label}: {time}
              </small>
            )}
          </div>
        </div>
        <a
          className="button button--primary"
          href={config.ctaUrl || paymentUrl}
        >
          {config.ctaLabel}
        </a>
      </div>
    </aside>
  );
}

export function FloatingNotification({ settings, paymentUrl, hasFloatingCta }) {
  const items = useMemo(
    () => settings.items.filter(item => item.active),
    [settings.items]
  );
  const [index, setIndex] = useState(-1);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!settings.enabled || !items.length) return;
    let hideTimer;
    let interval;
    const show = next => {
      setIndex(next);
      setVisible(true);
      hideTimer = window.setTimeout(
        () => setVisible(false),
        items[next].displayDurationMs || 5000
      );
    };
    const initial = window.setTimeout(
      () => {
        show(0);
        interval = window.setInterval(
          () =>
            setIndex(current => {
              const next = (current + 1) % items.length;
              setVisible(true);
              window.clearTimeout(hideTimer);
              hideTimer = window.setTimeout(
                () => setVisible(false),
                items[next].displayDurationMs || 5000
              );
              return next;
            }),
          Math.max(8000, settings.intervalMs || 30000)
        );
      },
      Math.max(0, settings.initialDelayMs || 0)
    );
    return () => {
      window.clearTimeout(initial);
      window.clearTimeout(hideTimer);
      window.clearInterval(interval);
    };
  }, [items, settings.enabled, settings.initialDelayMs, settings.intervalMs]);
  if (index < 0 || !items[index]) return null;
  const current = items[index];
  const Tag = current.url ? "a" : "div";
  return (
    <Tag
      href={
        current.url
          ? current.url === "payment"
            ? paymentUrl
            : current.url
          : undefined
      }
      className={`class-floating-notification${visible ? " is-visible" : ""}${hasFloatingCta ? " has-floating-cta" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="class-floating-notification__icon">{current.icon}</span>
      <span>
        <strong>{current.title}</strong>
        <small>{current.supportingText}</small>
      </span>
    </Tag>
  );
}
