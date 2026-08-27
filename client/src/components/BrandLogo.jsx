// StarHustler style contract: use the supplied single-piece SVG logo lockup at a clear, Canva-compliant size.
const logoSrc = "/manus-storage/StarthustlerLogoWeb_297db291.svg";

export function BrandLogo({ light = true }) {
  return (
    <a className={`brand-logo ${light ? "brand-logo--light" : "brand-logo--dark"}`} href="#beranda" aria-label="StarHustler beranda">
      <img src={logoSrc} alt="StarHustler" />
    </a>
  );
}

export { logoSrc };
