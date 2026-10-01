import { Check } from "lucide-react";

const enabledItems = items => (items || []).filter(item => item.enabled);

export default function ClassManagedListSection({
  className = "",
  eyebrow,
  title,
  items,
  icon = Check,
}) {
  const Icon = icon;
  const visible = enabledItems(items);
  if (!visible.length) return null;

  return (
    <section className={`class-managed-list class-deferred-section section-shell ${className}`.trim()}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <div className="class-managed-list__grid">
        {visible.map(item => (
          <article key={item.id}>
            <Icon size={20} aria-hidden="true" />
            <div>
              <h3>{item.title}</h3>
              {item.description && <p>{item.description}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
