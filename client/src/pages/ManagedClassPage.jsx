import { useEffect, useRef } from "react";
import { ArrowRight, Check, Gift, Pencil, Sparkles } from "lucide-react";
import { DEFAULT_CLASS_RECORDS, formatRupiah } from "@shared/classContent";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { PrimaryButton } from "../components/PrimaryButton.jsx";
import { trpc } from "../lib/trpc";
import ClassVideo from "../components/class/ClassVideo.jsx";
import ClassFaq from "../components/class/ClassFaq.jsx";
import ClassSeo from "../components/class/ClassSeo.jsx";
import ClassCheckoutSection from "../components/class/ClassCheckoutSection.jsx";
import {
  AnnouncementBar,
  FloatingCta,
  FloatingNotification,
} from "../components/class/ClassConversion.jsx";
import { useMetaTracking } from "../lib/metaTracking.js";

const fallbackRecord = slug => {
  const record = DEFAULT_CLASS_RECORDS.find(item => item.slug === slug);
  return record ? { ...record, id: 0 } : null;
};
const active = items => (items || []).filter(item => item.enabled);

function ManagedListSection({
  className = "",
  eyebrow,
  title,
  items,
  icon = Check,
}) {
  const Icon = icon;
  const visible = active(items);
  if (!visible.length) return null;
  return (
    <section className={`class-managed-list section-shell ${className}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <div className="class-managed-list__grid">
        {visible.map(item => (
          <article key={item.id}>
            <Icon size={20} />
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

export default function ManagedClassPage({ slug }) {
  const preview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "1";
  const publicQuery = trpc.classes.bySlug.useQuery(
    { slug },
    { enabled: !preview, retry: 1 }
  );
  const previewQuery = trpc.classAdmin.bySlug.useQuery(
    { slug },
    { enabled: preview, retry: false }
  );
  const authQuery = trpc.auth.me.useQuery(undefined, { retry: false });
  const meta = useMetaTracking();
  const trackedView = useRef("");
  const queried = preview ? previewQuery.data : publicQuery.data;
  const record = queried || (!preview ? fallbackRecord(slug) : null);
  const loading = preview ? previewQuery.isLoading : publicQuery.isLoading;
  const c = record
    ? slug === "kelas-solopreneur-salinan-711032"
      ? {
          ...record.content,
          mentor: {
            ...record.content.mentor,
            imageUrl: "/assets/bukan-sekadar-teori.png",
          },
        }
      : record.content
    : null;

  useEffect(() => {
    if (!record || !c || preview || trackedView.current === slug) return;
    trackedView.current = slug;
    void meta.track("ViewContent", {
      content_name: record.name,
      content_ids: [slug],
      content_type: "product",
      value: c.pricing.sellingPrice,
      currency: "IDR",
    });
  }, [record?.id, slug, preview]);

  if (!record || !c) {
    return (
      <div className="site-page class-detail-page">
        <Navbar />
        <main className="class-state section-shell">
          <h1>{loading ? "Memuat kelas…" : "Kelas tidak ditemukan"}</h1>
          {preview && previewQuery.error && (
            <p>Preview hanya dapat dibuka oleh admin yang sudah login.</p>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  const checkoutUrl = "#daftar-kelas";
  const eventData = {
    content_name: record.name,
    content_ids: [slug],
    content_type: "product",
    value: c.pricing.sellingPrice,
    currency: "IDR",
  };
  const handlePaymentClick = event => {
    if (event.defaultPrevented) return;
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      void meta.track("InitiateCheckout", eventData);
      return;
    }
    event.preventDefault();
    void meta.track("InitiateCheckout", eventData);
    document.getElementById("daftar-kelas")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const cta = label => (
    <PrimaryButton
      href={checkoutUrl}
      onClick={handlePaymentClick}
    >
      {label || c.hero.primaryCtaLabel}
      <ArrowRight size={16} />
    </PrimaryButton>
  );
  const visibility = c.sectionVisibility;
  const sectionMap = {
    video: visibility.video && <ClassVideo key="video" config={c.video} />,
    intro: visibility.intro && (
      <section key="intro" className="class-detail-intro section-shell">
        <p>{c.intro.lead}</p>
        <div className="class-detail-intro__grid">
          <div>
            <h2>{c.intro.firstTitle}</h2>
            <p>{c.intro.firstBody}</p>
          </div>
          <div>
            <h2>{c.intro.secondTitle}</h2>
            <p>{c.intro.secondBody}</p>
          </div>
        </div>
        <div className="center-action">{cta()}</div>
      </section>
    ),
    painPoints: visibility.painPoints && (
      <ManagedListSection
        key="painPoints"
        eyebrow="Tantangan"
        title="Apa yang sering menghambat kita untuk mulai?"
        items={c.painPoints}
      />
    ),
    story: visibility.story && (
      <section key="story" className="class-detail-split section-shell">
        <div className="class-detail-split__copy">
          <h2>{c.story.title}</h2>
          {c.story.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {c.story.highlight && <h3>{c.story.highlight}</h3>}
        </div>
        <div className="class-detail-split__media">
          <img src={c.story.imageUrl} alt={c.story.title} loading="lazy" />
        </div>
      </section>
    ),
    calculation: visibility.calculation && (
      <section
        key="calculation"
        className="class-detail-calculation section-shell"
      >
        <div>
          <h2>{c.calculation.title}</h2>
          <p>{c.calculation.description}</p>
        </div>
        <div className="calculation-box">
          <p>{c.calculation.formula}</p>
          <strong>{c.calculation.result}</strong>
          <em>{c.calculation.resultWords}</em>
        </div>
        <p className="class-detail-note">{c.calculation.disclaimer}</p>
        <p>{c.calculation.closing}</p>
        <div className="center-action">{cta()}</div>
      </section>
    ),
    solution: visibility.solution && (
      <section
        key="solution"
        className="class-detail-split class-detail-split--reverse section-shell"
      >
        <div className="class-detail-split__copy">
          <h2>{c.solution.title}</h2>
          {c.solution.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="class-detail-split__media">
          <img
            src={c.solution.imageUrl}
            alt={c.solution.title}
            loading="lazy"
          />
        </div>
      </section>
    ),
    benefits: visibility.benefits && (
      <section key="benefits" className="class-detail-benefits">
        <div className="section-shell">
          <h2>Kalau begitu, apa yang akan saya dapatkan?</h2>
          <div className="benefit-grid">
            {active(c.benefits).map(item => (
              <div key={item.id}>
                <Check size={18} />
                <span>{item.title}</span>
              </div>
            ))}
          </div>
          <div className="center-action">{cta()}</div>
        </div>
      </section>
    ),
    curriculum: visibility.curriculum && (
      <ManagedListSection
        key="curriculum"
        className="class-managed-list--soft"
        eyebrow="Kurikulum"
        title="Yang akan kamu pelajari"
        items={c.curriculum}
      />
    ),
    bonuses: visibility.bonuses && (
      <ManagedListSection
        key="bonuses"
        eyebrow="Bonus"
        title="Pendamping untuk membantumu mulai"
        items={c.bonuses}
        icon={Gift}
      />
    ),
    mentor: visibility.mentor && (
      <section key="mentor" className="class-detail-mentor section-shell">
        <div>
          <p className="eyebrow">Tentang Pengajar</p>
          <h2>{c.mentor.headline}</h2>
          <p>{c.mentor.description}</p>
          <p>{c.mentor.extendedDescription}</p>
          <h3>{c.mentor.name}</h3>
          <p>{c.mentor.title}</p>
        </div>
        <div className="class-detail-mentor__card">
          <img src={c.mentor.imageUrl} alt={c.mentor.name} loading="lazy" />
          <h3>{c.mentor.proofLabel}</h3>
        </div>
        <div className="center-action">{cta()}</div>
      </section>
    ),
    testimonials: visibility.testimonials && (
      <ManagedListSection
        key="testimonials"
        eyebrow="Cerita Peserta"
        title="Pengalaman peserta"
        items={c.testimonials}
      />
    ),
    pricing: visibility.pricing && (
      <section
        key="pricing"
        className="class-detail-promo section-shell"
        id="pricing"
      >
        <div>
          <p className="eyebrow">{c.pricing.promoLabel}</p>
          <h2>{c.pricing.bundlingLabel}</h2>
          <p>{c.pricing.supportingText}</p>
          <div className="class-price">
            <strong>{formatRupiah(c.pricing.sellingPrice)}</strong>
            {c.pricing.originalPrice > c.pricing.sellingPrice && (
              <s>{formatRupiah(c.pricing.originalPrice)}</s>
            )}
          </div>
          <div className="class-detail-actions">
            {cta("Saya Mau Paket Bundling 200k")}
          </div>
        </div>
        {c.ebook.enabled && (
          <img src={c.ebook.imageUrl} alt={c.ebook.title} loading="lazy" />
        )}
      </section>
    ),
    faq: visibility.faq && <ClassFaq key="faq" items={c.faq} />,
    finalCta: visibility.finalCta && (
      <section key="finalCta" className="class-detail-starhustler">
        <div className="section-shell">
          <p className="eyebrow">StartHustler</p>
          <h2>{c.finalCta.title}</h2>
          <p>{c.finalCta.description}</p>
          {cta(c.finalCta.ctaLabel)}
        </div>
      </section>
    ),
  };

  const orderedSections = [];
  let checkoutAdded = false;
  for (const key of c.sectionOrder || []) {
    if (key === "faq" && !checkoutAdded) {
      orderedSections.push(<ClassCheckoutSection key="checkout" record={record} slug={slug} content={c} />);
      checkoutAdded = true;
    }
    if (sectionMap[key]) orderedSections.push(sectionMap[key]);
    if (key === "mentor" && !checkoutAdded) {
      orderedSections.push(<ClassCheckoutSection key="checkout" record={record} slug={slug} content={c} />);
      checkoutAdded = true;
    }
  }
  if (!checkoutAdded) {
    orderedSections.push(<ClassCheckoutSection key="checkout" record={record} slug={slug} content={c} />);
  }

  return (
    <div
      className={`site-page class-detail-page${c.floatingCta.enabled ? " has-class-floating-cta" : ""}`}
    >
      <ClassSeo seo={c.seo} faq={c.faq} />
      <AnnouncementBar
        config={{ ...c.announcement, ctaUrl: checkoutUrl }}
        paymentUrl={checkoutUrl}
        onPaymentClick={handlePaymentClick}
      />
      <Navbar />
      <main>
        {visibility.hero !== false && (
          <section className="class-detail-hero">
            <div className="class-detail-hero__copy">
              <p className="eyebrow">
                <Sparkles size={15} /> {c.hero.eyebrow}
              </p>
              <h1>{c.hero.headline}</h1>
              {c.hero.description && (
                <p className="class-hero-description">{c.hero.description}</p>
              )}
              <div className="class-detail-meta">
                <span>{c.hero.dateBadge}</span>
                <span>{c.hero.scheduleText}</span>
                <span>{c.hero.deliveryText}</span>
              </div>
              {cta()}
            </div>
            <div className="class-detail-hero__art">
              <img
                src={c.hero.imageUrl}
                alt={c.hero.headline}
                fetchPriority="high"
              />
            </div>
          </section>
        )}
        {orderedSections}
      </main>
      <Footer />
      {authQuery.data?.role === "admin" && record.id > 0 && (
        <a
          className="class-admin-quick-edit"
          href={`/admin/kelas/${record.id}/edit`}
        >
          <Pencil size={15} /> Edit Kelas
        </a>
      )}
      <FloatingNotification
        settings={c.notificationSettings}
        paymentUrl={checkoutUrl}
        hasFloatingCta={c.floatingCta.enabled}
        onPaymentClick={handlePaymentClick}
      />
      <FloatingCta
        config={{ ...c.floatingCta, ctaUrl: checkoutUrl }}
        countdown={c.countdown}
        paymentUrl={checkoutUrl}
        onPaymentClick={handlePaymentClick}
      />
    </div>
  );
}
