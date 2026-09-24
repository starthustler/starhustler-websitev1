// StarHustler style contract: action controls are generous rounded blue signals that work across the complete route system.
import React from "react";
import { ArrowRight, Play } from "lucide-react";

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  startIcon,
  endIcon,
  fullWidth = false,
  disabled = false,
  type = "button",
  tabIndex,
  onClick,
  ...props
}) {
  const Component = href ? "a" : "button";
  const classes = [
    "button",
    `button--${variant}`,
    `button--${size}`,
    fullWidth ? "button--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const handleClick = event => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <Component
      className={classes}
      href={disabled ? undefined : href}
      type={href ? undefined : type}
      disabled={href ? undefined : disabled}
      aria-disabled={href && disabled ? "true" : undefined}
      tabIndex={href && disabled ? -1 : tabIndex}
      onClick={handleClick}
      {...props}
    >
      <span className="button__content">
        {startIcon && <span className="button__icon">{startIcon}</span>}
        <span className="button__label">{children}</span>
        {endIcon && <span className="button__icon">{endIcon}</span>}
      </span>
    </Component>
  );
}

export function PrimaryButton({
  children,
  href = "/kelas",
  className = "",
  arrow = false,
  onClick,
  target,
  rel,
}) {
  return (
    <Button
      variant="primary"
      className={className}
      href={href}
      onClick={onClick}
      target={target}
      rel={rel}
      endIcon={arrow ? <ArrowRight aria-hidden="true" size={17} strokeWidth={2.5} /> : null}
    >
      {children}
    </Button>
  );
}

export function SecondaryButton({
  children,
  href = "/kelas",
  className = "",
  play = false,
}) {
  return (
    <Button
      variant="secondary"
      className={className}
      href={href}
      startIcon={play ? <Play aria-hidden="true" size={15} fill="currentColor" /> : null}
    >
      {children}
    </Button>
  );
}
