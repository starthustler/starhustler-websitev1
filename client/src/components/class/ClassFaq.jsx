import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function ClassFaq({ items }) {
  const visible = items.filter(item => item.enabled);
  const [openId, setOpenId] = useState(visible[0]?.id || "");
  if (!visible.length) return null;
  return (
    <section className="class-faq section-shell" id="faq">
      <p className="eyebrow">Pertanyaan yang Sering Ditanyakan</p>
      <h2>Masih ada yang ingin kamu pastikan?</h2>
      <div className="class-faq__list">
        {visible.map(item => {
          const open = openId === item.id;
          return (
            <article key={item.id} className={open ? "is-open" : ""}>
              <button
                type="button"
                onClick={() => setOpenId(open ? "" : item.id)}
                aria-expanded={open}
              >
                <span>{item.question}</span>
                <ChevronDown size={20} />
              </button>
              {open && <p>{item.answer}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
