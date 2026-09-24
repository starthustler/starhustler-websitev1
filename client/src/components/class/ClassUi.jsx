import React from "react";
import { Check } from "lucide-react";
import { formatRupiah } from "@shared/classContent";

export function PriceDisplay({
  sellingPrice,
  originalPrice = 0,
  label = "",
  variant = "section",
  className = "",
}) {
  return (
    <div className={`price-display price-display--${variant} ${className}`.trim()}>
      {label && <span className="price-display__label">{label}</span>}
      <strong>{formatRupiah(sellingPrice)}</strong>
      {originalPrice > sellingPrice && <s>{formatRupiah(originalPrice)}</s>}
    </div>
  );
}

export function EventInfo({ items, variant = "hero", className = "" }) {
  const visible = items.filter(item => item?.value);
  if (!visible.length) return null;
  return (
    <div className={`event-info event-info--${variant} ${className}`.trim()}>
      {visible.map(item => (
        <div key={item.key || item.value} className={`event-info__item${item.emphasis ? " is-emphasis" : ""}`}>
          {item.icon && <span className="event-info__icon">{item.icon}</span>}
          <span className="event-info__content">
            {item.label && <strong>{item.label}</strong>}
            <span>{item.value}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function BenefitItem({ children, icon: Icon = Check }) {
  return (
    <div className="benefit-item">
      <Icon size={18} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export function FormField({ label, name, className = "", ...inputProps }) {
  return (
    <label className={`form-field ${className}`.trim()}>
      <span>{label}</span>
      <input name={name} {...inputProps} />
    </label>
  );
}
