// StarHustler style contract: the Blog page is a clean editorial shelf of practical notes for Indonesian AI builders.
import { ArrowRight, BookOpen, CircleDot, PenLine, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import PageHero from "../components/PageHero.jsx";
import { PrimaryButton } from "../components/PrimaryButton.jsx";
import { articles } from "../data/blogArticles.js";

const heroImage = "/manus-storage/starhustler-blog-page-v2_1bec9887.png";

export default function BlogPage() {
  return (
    <div className="interior-page blog-page">
      <Navbar />
      <main>
        <PageHero eyebrow="Catatan untuk Builder" variant="notes" title={<>Ide, catatan, dan <span>cara kerja yang bisa dicoba.</span></>} description="Blog StarHustler berisi sudut pandang praktis untuk membantu kamu membuat keputusan yang lebih tenang ketika membangun dengan AI." image={heroImage}>
          <PrimaryButton href="#catatan" arrow>Mulai Membaca</PrimaryButton>
        </PageHero>

        <section className="interior-section section-shell" id="catatan">
          <div className="section-intro section-intro--split">
            <div><p className="eyebrow">Pilih Bacaan</p><h2>Untuk dibaca, dipikirkan, lalu dicoba.</h2></div>
            <div className="topic-pills"><span>Memulai</span><span>AI Workflow</span><span>Personal Brand</span><span>Content</span></div>
          </div>
          <div className="article-grid">
            {articles.map((article, index) => (
              <article className="article-card" key={article.slug}>
                <div className={`article-card__visual article-card__visual--${index + 1}`}><span>{article.number}</span><PenLine size={32} /></div>
                <p className="article-card__topic"><CircleDot size={13} /> {article.category}</p>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <a href={`/blog/${article.slug}`} aria-label={`Buka catatan: ${article.title}`}>Buka Catatan <ArrowRight size={16} /></a>
              </article>
            ))}
          </div>
        </section>

        <section className="blog-resource"><div className="blog-resource__shell"><div><BookOpen size={31} /><p className="eyebrow">Resource Pendamping</p><h2>Mulai dengan panduan yang lebih sederhana.</h2><p>Temukan titik awal untuk mengubah ide yang masih mentah menjadi langkah pertama yang bisa kamu ambil.</p></div><PrimaryButton href="/#ebook" arrow>Lihat Ebook</PrimaryButton></div></section>

        <section className="interior-section section-shell editorial-split editorial-split--reverse"><div className="editorial-split__copy"><p className="eyebrow">Dari Catatan ke Praktik</p><h2>Kalau sudah tahu yang ingin dicoba, lanjutkan ke kelas.</h2><p>Setiap kelas dirancang untuk membawa kamu dari pemahaman menuju output yang lebih konkret dan bisa dilanjutkan.</p><PrimaryButton href="/kelas" arrow>Lihat Kelas</PrimaryButton></div><div className="editorial-split__art editorial-split__art--blue"><Sparkles size={46} /><span>Read.<br />Try.<br />Build.</span></div></section>
      </main>
      <Footer />
    </div>
  );
}
