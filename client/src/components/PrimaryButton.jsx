// StarHustler style contract: action controls are generous rounded blue signals that work across the complete route system.
import { ArrowRight, Play } from "lucide-react";

export function PrimaryButton({ children, href = "/kelas", className = "", arrow = false }) {
  return (
    <a className={`button button--primary ${className}`} href={href}>
      <span>{children}</span>
      {arrow && <ArrowRight aria-hidden="true" size={17} strokeWidth={2.5} />}
    </a>
  );
}

export function SecondaryButton({ children, href = "/kelas", className = "", play = false }) {
  return (
    <a className={`button button--secondary ${className}`} href={href}>
      {play && <Play aria-hidden="true" size={15} fill="currentColor" />}
      <span>{children}</span>
    </a>
  );
}
