import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ExternalLink,
  ImagePlus,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { DEFAULT_CLASS_CONTENT } from "@shared/classContent";
import AdminShell from "../components/admin/AdminShell.jsx";
import { trpc } from "../lib/trpc";

const clone = value => structuredClone(value);
const uid = prefix =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const slugify = value =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  min,
  help,
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input
        type={type}
        value={value ?? ""}
        min={min}
        placeholder={placeholder}
        onChange={event =>
          onChange(
            type === "number" ? Number(event.target.value) : event.target.value
          )
        }
      />
      {help && <small>{help}</small>}
    </label>
  );
}
function TextArea({ label, value, onChange, rows = 4 }) {
  return (
    <label className="admin-field admin-field--wide">
      <span>{label}</span>
      <textarea
        rows={rows}
        value={value ?? ""}
        onChange={event => onChange(event.target.value)}
      />
    </label>
  );
}
function Toggle({ label, checked, onChange }) {
  return (
    <label className="admin-toggle">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={event => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
function Panel({ title, description, children }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel__heading">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      <div className="admin-form-grid">{children}</div>
    </section>
  );
}
function ImageField({ label, value, onChange }) {
  const upload = trpc.classAdmin.uploadImage.useMutation({
    onSuccess: data => onChange(data.url),
  });
  const choose = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      upload.mutate({ fileName: file.name, dataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };
  return (
    <div className="admin-image-field">
      <Field label={`${label} URL`} value={value} onChange={onChange} />
      <label className="admin-upload">
        <ImagePlus size={16} />{" "}
        {upload.isPending ? "Mengunggah…" : "Upload / Replace"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={choose}
          disabled={upload.isPending}
        />
      </label>
      {value && (
        <div className="admin-image-preview">
          <img src={value} alt={`Preview ${label}`} />
          <button type="button" onClick={() => onChange("")}>
            Remove
          </button>
        </div>
      )}
      {upload.error && (
        <small className="admin-error">{upload.error.message}</small>
      )}
    </div>
  );
}

function Repeater({ title, items, onChange, kind = "standard" }) {
  const update = (index, key, value) =>
    onChange(
      items.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const add = () => {
    if (kind === "faq")
      onChange([
        ...items,
        {
          id: uid("faq"),
          question: "Pertanyaan baru",
          answer: "",
          enabled: true,
        },
      ]);
    else if (kind === "notification")
      onChange([
        ...items,
        {
          id: uid("notif"),
          icon: "✨",
          title: "Informasi",
          supportingText: "",
          url: "",
          active: true,
          displayDurationMs: 5000,
        },
      ]);
    else
      onChange([
        ...items,
        { id: uid("item"), title: "Item baru", description: "", enabled: true },
      ]);
  };
  return (
    <div className="admin-repeater admin-field--wide">
      <div className="admin-repeater__header">
        <h3>{title}</h3>
        <button type="button" onClick={add}>
          <Plus size={15} /> Add
        </button>
      </div>
      {items.map((item, index) => (
        <article key={item.id}>
          <div className="admin-repeater__tools">
            <button
              type="button"
              onClick={() => move(index, -1)}
              disabled={index === 0}
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              disabled={index === items.length - 1}
            >
              <ArrowDown size={14} />
            </button>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              <Trash2 size={14} />
            </button>
          </div>
          {kind === "faq" ? (
            <>
              <Field
                label="Question"
                value={item.question}
                onChange={v => update(index, "question", v)}
              />
              <TextArea
                label="Answer"
                value={item.answer}
                onChange={v => update(index, "answer", v)}
              />
              <Toggle
                label="Active"
                checked={item.enabled}
                onChange={v => update(index, "enabled", v)}
              />
            </>
          ) : kind === "notification" ? (
            <>
              <div className="admin-form-grid">
                <Field
                  label="Icon"
                  value={item.icon}
                  onChange={v => update(index, "icon", v)}
                />
                <Field
                  label="Title"
                  value={item.title}
                  onChange={v => update(index, "title", v)}
                />
                <Field
                  label="Supporting Text"
                  value={item.supportingText}
                  onChange={v => update(index, "supportingText", v)}
                />
                <Field
                  label="Optional URL"
                  value={item.url}
                  onChange={v => update(index, "url", v)}
                />
                <Field
                  label="Display Duration (ms)"
                  type="number"
                  min="1000"
                  value={item.displayDurationMs}
                  onChange={v => update(index, "displayDurationMs", v)}
                />
              </div>
              <Toggle
                label="Active"
                checked={item.active}
                onChange={v => update(index, "active", v)}
              />
            </>
          ) : (
            <>
              <Field
                label="Title"
                value={item.title}
                onChange={v => update(index, "title", v)}
              />
              <TextArea
                label="Description"
                value={item.description}
                onChange={v => update(index, "description", v)}
                rows={2}
              />
              <Toggle
                label="Enabled"
                checked={item.enabled}
                onChange={v => update(index, "enabled", v)}
              />
            </>
          )}
        </article>
      ))}
    </div>
  );
}

export default function AdminClassEditorPage({ id }) {
  const isNew = id === "new";
  const numericId = Number(id);
  const query = trpc.classAdmin.byId.useQuery(
    { id: numericId },
    { enabled: !isNew && Number.isInteger(numericId), retry: false }
  );
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    name: "Kelas Baru",
    slug: "kelas-baru",
    status: "draft",
    featured: false,
    content: clone(DEFAULT_CLASS_CONTENT),
  });
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (query.data)
      setForm({
        name: query.data.name,
        slug: query.data.slug,
        status: query.data.status,
        featured: query.data.featured,
        content: clone(query.data.content),
      });
  }, [query.data]);
  const mutationOptions = {
    onSuccess: data => {
      setMessage("Perubahan tersimpan.");
      utils.classAdmin.list.invalidate();
      if (isNew) window.location.href = `/admin/kelas/${data.id}/edit`;
    },
    onError: error => setMessage(error.message),
  };
  const createMutation = trpc.classAdmin.create.useMutation(mutationOptions);
  const updateMutation = trpc.classAdmin.update.useMutation(mutationOptions);
  const saving = createMutation.isPending || updateMutation.isPending;
  const set = (path, value) =>
    setForm(current => {
      const next = clone(current);
      const parts = path.split(".");
      let cursor = next;
      parts.slice(0, -1).forEach(key => {
        cursor = cursor[key];
      });
      cursor[parts.at(-1)] = value;
      return next;
    });
  const content = form.content;
  const save = event => {
    event.preventDefault();
    setMessage("");
    const payload = { ...form, slug: slugify(form.slug), content };
    if (isNew) createMutation.mutate(payload);
    else updateMutation.mutate({ id: numericId, ...payload });
  };
  const visibleKeys = useMemo(
    () => Object.keys(content.sectionVisibility),
    [content.sectionVisibility]
  );
  const moveSection = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= content.sectionOrder.length) return;
    const next = [...content.sectionOrder];
    [next[index], next[target]] = [next[target], next[index]];
    set("content.sectionOrder", next);
  };

  return (
    <AdminShell>
      <form onSubmit={save}>
        <div className="admin-editor-bar">
          <a href="/admin/kelas">
            <ArrowLeft size={17} /> Kembali
          </a>
          <div>
            {!isNew && (
              <a
                href={`/kelas/${form.slug}?preview=1`}
                target="_blank"
                rel="noreferrer"
              >
                Preview <ExternalLink size={15} />
              </a>
            )}
            <button
              className="button button--primary"
              type="submit"
              disabled={saving}
            >
              <Save size={16} /> {saving ? "Menyimpan…" : "Save"}
            </button>
          </div>
        </div>
        <div className="admin-title-row">
          <div>
            <p className="eyebrow">Class Editor</p>
            <h1>{isNew ? "Create Class" : form.name}</h1>
            {message && (
              <p
                className={
                  message.includes("tersimpan")
                    ? "admin-success"
                    : "admin-error"
                }
              >
                {message}
              </p>
            )}
          </div>
        </div>
        <Panel title="Basic">
          <Field
            label="Class Name"
            value={form.name}
            onChange={value =>
              setForm(current => ({ ...current, name: value }))
            }
          />
          <Field
            label="Slug"
            value={form.slug}
            onChange={value =>
              setForm(current => ({ ...current, slug: slugify(value) }))
            }
            help={`/kelas/${form.slug}`}
          />
          <label className="admin-field">
            <span>Status</span>
            <select
              value={form.status}
              onChange={event =>
                setForm(current => ({ ...current, status: event.target.value }))
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <Toggle
            label="Featured"
            checked={form.featured}
            onChange={value =>
              setForm(current => ({ ...current, featured: value }))
            }
          />
          <TextArea
            label="Short Description"
            value={content.shortDescription}
            onChange={v => set("content.shortDescription", v)}
          />
        </Panel>

        <Panel title="Hero" description="Headline, media, dan CTA utama.">
          <Field
            label="Eyebrow / Badge"
            value={content.hero.eyebrow}
            onChange={v => set("content.hero.eyebrow", v)}
          />
          <Field
            label="Headline"
            value={content.hero.headline}
            onChange={v => set("content.hero.headline", v)}
          />
          <Field
            label="Highlight Text"
            value={content.hero.highlightText}
            onChange={v => set("content.hero.highlightText", v)}
          />
          <TextArea
            label="Description"
            value={content.hero.description}
            onChange={v => set("content.hero.description", v)}
          />
          <Field
            label="Primary CTA Label"
            value={content.hero.primaryCtaLabel}
            onChange={v => set("content.hero.primaryCtaLabel", v)}
          />
          <Field
            label="Date Badge"
            value={content.hero.dateBadge}
            onChange={v => set("content.hero.dateBadge", v)}
          />
          <TextArea
            label="Schedule"
            value={content.hero.scheduleText}
            onChange={v => set("content.hero.scheduleText", v)}
            rows={2}
          />
          <TextArea
            label="Delivery Info"
            value={content.hero.deliveryText}
            onChange={v => set("content.hero.deliveryText", v)}
            rows={2}
          />
          <ImageField
            label="Hero Image"
            value={content.hero.imageUrl}
            onChange={v => set("content.hero.imageUrl", v)}
          />
        </Panel>

        <Panel
          title="Video"
          description="YouTube iframe dimuat hanya setelah pengunjung menekan Play."
        >
          <Toggle
            label="Video Enabled"
            checked={content.video.enabled}
            onChange={v => set("content.video.enabled", v)}
          />
          <Field
            label="Video URL"
            value={content.video.url}
            onChange={v => set("content.video.url", v)}
            placeholder="https://youtu.be/..."
          />
          <Field
            label="Video Title"
            value={content.video.title}
            onChange={v => set("content.video.title", v)}
          />
          <label className="admin-field">
            <span>Aspect Ratio</span>
            <select
              value={content.video.aspectRatio}
              onChange={e => set("content.video.aspectRatio", e.target.value)}
            >
              <option>16:9</option>
              <option>9:16</option>
              <option>4:3</option>
            </select>
          </label>
          <ImageField
            label="Custom Thumbnail"
            value={content.video.customThumbnailUrl}
            onChange={v => set("content.video.customThumbnailUrl", v)}
          />
        </Panel>

        <Panel
          title="Pricing & Payment"
          description="Semua CTA memakai Payment URL ini, kecuali custom URL diaktifkan pada komponen tertentu."
        >
          <Field
            label="Selling Price"
            type="number"
            min="0"
            value={content.pricing.sellingPrice}
            onChange={v => set("content.pricing.sellingPrice", v)}
          />
          <Field
            label="Original Price"
            type="number"
            min="0"
            value={content.pricing.originalPrice}
            onChange={v => set("content.pricing.originalPrice", v)}
          />
          <Field
            label="Price Label"
            value={content.pricing.priceLabel}
            onChange={v => set("content.pricing.priceLabel", v)}
          />
          <Field
            label="Promo Label"
            value={content.pricing.promoLabel}
            onChange={v => set("content.pricing.promoLabel", v)}
          />
          <Field
            label="Bundling Label"
            value={content.pricing.bundlingLabel}
            onChange={v => set("content.pricing.bundlingLabel", v)}
          />
          <TextArea
            label="Supporting Copy"
            value={content.pricing.supportingText}
            onChange={v => set("content.pricing.supportingText", v)}
          />
          <Field
            label="Central Payment URL"
            value={content.pricing.paymentUrl}
            onChange={v => set("content.pricing.paymentUrl", v)}
          />
        </Panel>

        <Panel title="Core Content">
          <TextArea
            label="Intro Lead"
            value={content.intro.lead}
            onChange={v => set("content.intro.lead", v)}
          />
          <Field
            label="Intro Title 1"
            value={content.intro.firstTitle}
            onChange={v => set("content.intro.firstTitle", v)}
          />
          <TextArea
            label="Intro Body 1"
            value={content.intro.firstBody}
            onChange={v => set("content.intro.firstBody", v)}
          />
          <Field
            label="Intro Title 2"
            value={content.intro.secondTitle}
            onChange={v => set("content.intro.secondTitle", v)}
          />
          <TextArea
            label="Intro Body 2"
            value={content.intro.secondBody}
            onChange={v => set("content.intro.secondBody", v)}
          />
          <Field
            label="Story Title"
            value={content.story.title}
            onChange={v => set("content.story.title", v)}
          />
          <TextArea
            label="Story Paragraphs (one per line)"
            value={content.story.paragraphs.join("\n")}
            onChange={v =>
              set("content.story.paragraphs", v.split("\n").filter(Boolean))
            }
          />
          <ImageField
            label="Story Image"
            value={content.story.imageUrl}
            onChange={v => set("content.story.imageUrl", v)}
          />
          <Field
            label="Solution Title"
            value={content.solution.title}
            onChange={v => set("content.solution.title", v)}
          />
          <TextArea
            label="Solution Paragraphs (one per line)"
            value={content.solution.paragraphs.join("\n")}
            onChange={v =>
              set("content.solution.paragraphs", v.split("\n").filter(Boolean))
            }
          />
          <ImageField
            label="Solution Image"
            value={content.solution.imageUrl}
            onChange={v => set("content.solution.imageUrl", v)}
          />
        </Panel>

        <Panel title="Lists & Repeaters">
          <Repeater
            title="Pain Points"
            items={content.painPoints}
            onChange={v => set("content.painPoints", v)}
          />
          <Repeater
            title="Benefits"
            items={content.benefits}
            onChange={v => set("content.benefits", v)}
          />
          <Repeater
            title="Curriculum"
            items={content.curriculum}
            onChange={v => set("content.curriculum", v)}
          />
          <Repeater
            title="Bonuses"
            items={content.bonuses}
            onChange={v => set("content.bonuses", v)}
          />
          <Repeater
            title="Testimonials"
            items={content.testimonials}
            onChange={v => set("content.testimonials", v)}
          />
        </Panel>

        <Panel title="Mentor">
          <Field
            label="Name"
            value={content.mentor.name}
            onChange={v => set("content.mentor.name", v)}
          />
          <Field
            label="Professional Title"
            value={content.mentor.title}
            onChange={v => set("content.mentor.title", v)}
          />
          <Field
            label="Headline"
            value={content.mentor.headline}
            onChange={v => set("content.mentor.headline", v)}
          />
          <TextArea
            label="Description"
            value={content.mentor.description}
            onChange={v => set("content.mentor.description", v)}
          />
          <TextArea
            label="Extended Description"
            value={content.mentor.extendedDescription}
            onChange={v => set("content.mentor.extendedDescription", v)}
          />
          <Field
            label="Proof Label"
            value={content.mentor.proofLabel}
            onChange={v => set("content.mentor.proofLabel", v)}
          />
          <ImageField
            label="Mentor Image"
            value={content.mentor.imageUrl}
            onChange={v => set("content.mentor.imageUrl", v)}
          />
        </Panel>

        <Panel title="FAQ">
          <Repeater
            title="FAQ Items"
            kind="faq"
            items={content.faq}
            onChange={v => set("content.faq", v)}
          />
        </Panel>

        <Panel title="Floating CTA">
          <Toggle
            label="Enabled"
            checked={content.floatingCta.enabled}
            onChange={v => set("content.floatingCta.enabled", v)}
          />
          <Field
            label="Title"
            value={content.floatingCta.title}
            onChange={v => set("content.floatingCta.title", v)}
          />
          <Field
            label="Subtitle"
            value={content.floatingCta.subtitle}
            onChange={v => set("content.floatingCta.subtitle", v)}
          />
          <Field
            label="Original Price"
            type="number"
            min="0"
            value={content.floatingCta.originalPrice}
            onChange={v => set("content.floatingCta.originalPrice", v)}
          />
          <Field
            label="Current Price"
            type="number"
            min="0"
            value={content.floatingCta.currentPrice}
            onChange={v => set("content.floatingCta.currentPrice", v)}
          />
          <Field
            label="CTA Label"
            value={content.floatingCta.ctaLabel}
            onChange={v => set("content.floatingCta.ctaLabel", v)}
          />
          <Field
            label="Optional Custom CTA URL"
            value={content.floatingCta.ctaUrl}
            onChange={v => set("content.floatingCta.ctaUrl", v)}
            help="Kosongkan untuk menggunakan Central Payment URL."
          />
          <Field
            label="Optional Icon"
            value={content.floatingCta.icon}
            onChange={v => set("content.floatingCta.icon", v)}
          />
        </Panel>

        <Panel
          title="Floating Notification"
          description="Gunakan informasi nyata; jangan membuat aktivitas pembelian palsu."
        >
          <Toggle
            label="Enabled"
            checked={content.notificationSettings.enabled}
            onChange={v => set("content.notificationSettings.enabled", v)}
          />
          <Field
            label="Initial Delay (ms)"
            type="number"
            min="0"
            value={content.notificationSettings.initialDelayMs}
            onChange={v =>
              set("content.notificationSettings.initialDelayMs", v)
            }
          />
          <Field
            label="Interval (ms)"
            type="number"
            min="8000"
            value={content.notificationSettings.intervalMs}
            onChange={v => set("content.notificationSettings.intervalMs", v)}
          />
          <Repeater
            title="Notifications"
            kind="notification"
            items={content.notificationSettings.items}
            onChange={v => set("content.notificationSettings.items", v)}
          />
        </Panel>

        <Panel title="Announcement & Countdown">
          <Toggle
            label="Announcement Enabled"
            checked={content.announcement.enabled}
            onChange={v => set("content.announcement.enabled", v)}
          />
          <Field
            label="Main Text"
            value={content.announcement.mainText}
            onChange={v => set("content.announcement.mainText", v)}
          />
          <Field
            label="Highlight Text"
            value={content.announcement.highlightText}
            onChange={v => set("content.announcement.highlightText", v)}
          />
          <Field
            label="CTA Label"
            value={content.announcement.ctaLabel}
            onChange={v => set("content.announcement.ctaLabel", v)}
          />
          <Field
            label="Optional CTA URL"
            value={content.announcement.ctaUrl}
            onChange={v => set("content.announcement.ctaUrl", v)}
          />
          <Toggle
            label="Countdown Enabled"
            checked={content.countdown.enabled}
            onChange={v => set("content.countdown.enabled", v)}
          />
          <Field
            label="Actual End Date & Time"
            type="datetime-local"
            value={content.countdown.endDateTime}
            onChange={v => set("content.countdown.endDateTime", v)}
          />
          <Field
            label="Countdown Label"
            value={content.countdown.label}
            onChange={v => set("content.countdown.label", v)}
          />
          <Field
            label="Expired Text"
            value={content.countdown.expiredText}
            onChange={v => set("content.countdown.expiredText", v)}
          />
        </Panel>

        <Panel title="Section Visibility & Order">
          <div className="admin-visibility admin-field--wide">
            {visibleKeys.map(key => (
              <Toggle
                key={key}
                label={key}
                checked={content.sectionVisibility[key]}
                onChange={v => set(`content.sectionVisibility.${key}`, v)}
              />
            ))}
          </div>
          <div className="admin-section-order admin-field--wide">
            {content.sectionOrder.map((key, index) => (
              <div key={key}>
                <span>
                  {index + 1}. {key}
                </span>
                <button
                  type="button"
                  onClick={() => moveSection(index, -1)}
                  disabled={index === 0}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(index, 1)}
                  disabled={index === content.sectionOrder.length - 1}
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="SEO">
          <Field
            label="SEO Title"
            value={content.seo.title}
            onChange={v => set("content.seo.title", v)}
          />
          <TextArea
            label="Meta Description"
            value={content.seo.metaDescription}
            onChange={v => set("content.seo.metaDescription", v)}
          />
          <Field
            label="OG Title"
            value={content.seo.ogTitle}
            onChange={v => set("content.seo.ogTitle", v)}
          />
          <TextArea
            label="OG Description"
            value={content.seo.ogDescription}
            onChange={v => set("content.seo.ogDescription", v)}
          />
          <ImageField
            label="OG Image"
            value={content.seo.ogImage}
            onChange={v => set("content.seo.ogImage", v)}
          />
          <Field
            label="Canonical URL"
            value={content.seo.canonicalUrl}
            onChange={v => set("content.seo.canonicalUrl", v)}
          />
        </Panel>
        <div className="admin-save-footer">
          <button
            className="button button--primary"
            type="submit"
            disabled={saving}
          >
            <Save size={16} /> {saving ? "Menyimpan…" : "Save Class"}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
