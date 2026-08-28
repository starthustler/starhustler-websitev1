// StarHustler style contract: article details read like calm, practical field notes for Indonesian AI builders.
import { ArrowLeft, ArrowRight, Check, CircleDot, Clock3, Sparkles } from "lucide-react";
import { useRoute } from "wouter";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import { PrimaryButton } from "../components/PrimaryButton.jsx";
import { getArticleBySlug } from "../data/blogArticles.js";
import "../styles/blogArticle.css";
import NotFoundPage from "./NotFoundPage.jsx";

export default function BlogArticlePage() {
  const [, params] = useRoute("/blog/:slug");
  const article = getArticleBySlug(params?.slug);

  if (!article) return <NotFoundPage />;

  return (
    <div className="interior-page article-detail-page">
      <Navbar />
      <main>
        <section className="article-detail-hero">
          <div className="article-detail-hero__shell">
            <div className="article-detail-hero__copy">
              <a className="article-back-link" href="/blog"><ArrowLeft size={17} /> Semua catatan</a>
              <p className="page-hero__eyebrow"><CircleDot size={12} /> {article.category}</p>
              <h1>{article.title}</h1>
              <p className="article-detail-hero__lead">{article.lead}</p>
              <div className="article-detail-meta">
                <span><Clock3 size={15} /> {article.readTime}</span>
                <span>{article.publishedAt}</span>
              </div>
            </div>
            <div className={`article-detail-hero__visual article-detail-hero__visual--${article.accent}`} aria-hidden="true">
              <span className="article-detail-hero__orbit article-detail-hero__orbit--one" />
              <span className="article-detail-hero__orbit article-detail-hero__orbit--two" />
              <span className="article-detail-hero__number">{article.number}</span>
              <div className="article-detail-hero__visual-copy"><Sparkles size={34} /><span>Field<br />Notes</span></div>
              <span className="article-detail-hero__spark">✦</span>
            </div>
          </div>
        </section>

        <article className="article-detail-content">
          <div className="article-detail-content__topline"><span>STARHUSTLER NOTES</span><span>{article.number}</span></div>
          <p className="article-detail-content__intro">{article.lead}</p>
          {article.sections.map((section, sectionIndex) => (
            <section className="article-detail-section" key={section.heading}>
              <div className="article-detail-section__index">{String(sectionIndex + 1).padStart(2, "0")}</div>
              <div>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.steps && (
                  <ol className="article-detail-steps">
                    {section.steps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}
                  </ol>
                )}
              </div>
            </section>
          ))}
          <aside className="article-takeaway">
            <Check size={20} />
            <div><p className="eyebrow">Inti Catatan</p><p>{article.takeaway}</p></div>
          </aside>
        </article>

        <section className="article-next-step">
          <div className="article-next-step__shell">
            <div><p className="eyebrow">Lanjutkan dengan Praktik</p><h2>Belajar yang berguna selalu dimulai dari langkah kecil.</h2><p>Pilih kelas yang membantumu mengubah catatan ini menjadi sistem kerja yang lebih nyata.</p></div>
            <PrimaryButton href="/kelas" arrow>Lihat Kelas</PrimaryButton>
          </div>
        </section>

        <nav className="article-detail-footer-nav" aria-label="Navigasi artikel">
          <a href="/blog"><ArrowLeft size={18} /> Kembali ke semua catatan</a>
          <a href="/kelas">Mulai belajar <ArrowRight size={18} /></a>
        </nav>
      </main>
      <Footer />
    </div>
  );
}
