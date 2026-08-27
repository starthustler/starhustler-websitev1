// StarHustler style contract: interior heroes pair a bold editorial message with practical human learning imagery and orbit accents.
export default function PageHero({ eyebrow, title, description, image, tone = "dark", variant = "default", children, imageClassName = "" }) {
  return (
    <section className={`page-hero page-hero--${tone} page-hero--${variant}`}>
      <div className="page-hero__shell">
        <div className="page-hero__copy">
          <p className="page-hero__eyebrow">✦ {eyebrow}</p>
          <h1 className="page-hero__title">{title}</h1>
          <p className="page-hero__description">{description}</p>
          {children && <div className="page-hero__actions">{children}</div>}
        </div>
        <div className={`page-hero__media ${imageClassName}`}>
          <img src={image} alt="" />
          <span className="page-hero__spark page-hero__spark--one">✦</span>
          <span className="page-hero__spark page-hero__spark--two">✦</span>
          <span className="page-hero__orbit page-hero__orbit--one" aria-hidden="true" />
          <span className="page-hero__orbit page-hero__orbit--two" aria-hidden="true" />
        </div>
      </div>
      <span className="page-hero__constellation page-hero__constellation--one" aria-hidden="true" />
      <span className="page-hero__constellation page-hero__constellation--two" aria-hidden="true" />
    </section>
  );
}
