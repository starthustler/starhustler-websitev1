// StarHustler style contract: section headings are high-contrast Poppins editorial statements with compact blue eyebrow labels.
export default function SectionHeading({ eyebrow, title, description, center = false, light = false }) {
  return (
    <div className={`section-heading ${center ? "section-heading--center" : ""} ${light ? "section-heading--light" : ""}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </div>
  );
}
