// StarHustler style contract: the supplied one-piece SVG is a stable homeward brand anchor on every route.
const logoSrc = "/manus-storage/StarthustlerLogoWeb_297db291.svg";

export function BrandLogo({ light = true }) {
  return (
    <a className={`brand-logo ${light ? "brand-logo--light" : "brand-logo--dark"}`} href="/" aria-label="StarHustler beranda">
      <img src={logoSrc} alt="StarHustler" />
    </a>
  );
}

export { logoSrc };
