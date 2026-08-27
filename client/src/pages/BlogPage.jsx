// StarHustler style contract: the Blog page is a clean editorial shelf of practical notes for Indonesian AI builders.
import { ArrowRight, BookOpen, CircleDot, PenLine, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import PageHero from "../components/PageHero.jsx";
import { PrimaryButton } from "../components/PrimaryButton.jsx";

const heroImage = "/manus-storage/starhustler-blog-page-v2_1bec9887.png";
const articles = [
  ["Cara berpikir sebelum memilih tool AI", "Jangan mulai dari tool. Mulai dari pekerjaan yang ingin kamu ringankan.", "Cara Kerja"],
  ["Membuat ide bisnis terasa lebih kecil", "Pecah ide besar menjadi keputusan kecil yang bisa diuji minggu ini.", "Memulai"],
  ["Personal branding yang tidak terasa memaksa", "Cari sudut pandang yang lahir dari pengalaman, bukan dari tuntutan untuk selalu tampil.", "Personal Brand"],
  ["Sistem konten untuk builder yang sibuk", "Bangun ritme yang menolong kamu konsisten tanpa menghabiskan seluruh energimu.", "Content"],
];

export default function BlogPage() {
  return (
    <div className="interior-page blog-page">
      <Navbar />
      <main>
        <PageHero eyebrow="Catatan untuk Builder" variant="notes" title={<>Ide, catatan, dan <span>cara kerja yang bisa dicoba.</span></>} description="Blog Starthustler berisi sudut pandang praktis untuk membantu kamu membuat keputusan yang lebih tenang ketika membangun dengan AI." image={heroImage}>
          <PrimaryButton href="#catatan" arrow>Mulai Membaca</PrimaryButton>
        </PageHero>

        <section className="interior-section section-shell" id="catatan"><div className="section-intro section-intro--split"><div><p className="eyebrow">Pilih Bacaan</p><h2>Untuk dibaca, dipikirkan, lalu dicoba.</h2></div><div className="topic-pills"><span>Memulai</span><span>AI Workflow</span><span>Personal Brand</span><span>Business</span></div></div><div className="article-grid">{articles.map(([title, text, topic], index) => <article className="article-card" key={title}><div className={`article-card__visual article-card__visual--${index + 1}`}><span>{String(index + 1).padStart(2, "0")}</span><PenLine size={32} /></div><p className="article-card__topic"><CircleDot size={13} /> {topic}</p><h3>{title}</h3><p>{text}</p><a href="/kelas">Buka Catatan <ArrowRight size={16} /></a></article>)}</div></section>

        <section className="blog-resource"><div className="blog-resource__shell"><div><BookOpen size={31} /><p className="eyebrow">Resource Pendamping</p><h2>Mulai dengan panduan yang lebih sederhana.</h2><p>Temukan titik awal untuk mengubah ide yang masih mentah menjadi langkah pertama yang bisa kamu ambil.</p></div><PrimaryButton href="/#ebook" arrow>Lihat Ebook</PrimaryButton></div></section>

        <section className="interior-section section-shell editorial-split editorial-split--reverse"><div className="editorial-split__copy"><p className="eyebrow">Dari Catatan ke Praktik</p><h2>Kalau sudah tahu yang ingin dicoba, lanjutkan ke kelas.</h2><p>Setiap kelas dirancang untuk membawa kamu dari pemahaman menuju output yang lebih konkret dan bisa dilanjutkan.</p><PrimaryButton href="/kelas" arrow>Lihat Kelas</PrimaryButton></div><div className="editorial-split__art editorial-split__art--blue"><Sparkles size={46} /><span>Read.<br />Try.<br />Build.</span></div></section>
      </main>
      <Footer />
    </div>
  );
}
