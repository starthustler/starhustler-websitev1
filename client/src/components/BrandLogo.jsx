// StarHustler style contract: use the starburst symbol at an immediately recognizable scale beside a bespoke-feeling wordmark.
const logoSrc = "/manus-storage/starhustler-starburst-logo_b5987f20.png";

export function BrandLogo({ light = true, compact = false }) {
  return (
    <a className={`brand-logo ${light ? "brand-logo--light" : "brand-logo--dark"}`} href="#beranda" aria-label="StarHustler beranda">
      <img src={logoSrc} alt="" aria-hidden="true" />
      {!compact && (
        <span className="brand-logo__word">
          <strong>Star</strong><em>Hustler</em><i aria-hidden="true">✦</i>
        </span>
      )}
    </a>
  );
}

export { logoSrc };
