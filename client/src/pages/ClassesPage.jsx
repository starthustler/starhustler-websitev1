// StarHustler style contract: the class catalogue feels like a practical launchpad—confident, legible, and driven by real output.
import { ArrowRight, BookOpen, Check, Compass, MonitorPlay, Rocket, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import PageHero from "../components/PageHero.jsx";
import { PrimaryButton, SecondaryButton } from "../components/PrimaryButton.jsx";

const heroImage = "/manus-storage/starhustler-kelas-hero_335db9e0.png";
const classes = [
  { number: "01", title: "Solopreneur Class", detail: "Dari ide sampai terjual", text: "Rancang arah usaha, uji ide, dan bangun cara kerja yang tidak bergantung pada tim besar.", icon: Compass },
  { number: "02", title: "AI Vibe Coding", detail: "Dari kebutuhan sampai prototipe", text: "Belajar menerjemahkan kebutuhan bisnis menjadi produk digital dengan bantuan AI.", icon: MonitorPlay },
  { number: "03", title: "Content System", detail: "Dari pesan sampai ritme konten", text: "Bangun sistem konten yang tetap punya suara manusia, namun lebih ringan dijalankan.", icon: Sparkles },
];

export default function ClassesPage() {
  return (
    <div className="interior-page classes-page">
      <Navbar />
      <main>
        <PageHero eyebrow="Kelas Online" variant="paths" title={<>Belajar untuk <span>membuat sesuatu bergerak.</span></>} description="Pilih kelas yang membantu kamu memulai dari pekerjaan nyata: membangun ide, produk, sistem, dan cara kerja yang lebih mandiri." image={heroImage}>
          <PrimaryButton href="#pilih-kelas" arrow>Lihat Kelas</PrimaryButton>
          <SecondaryButton href="#cara-belajar" play>Cara Belajar</SecondaryButton>
        </PageHero>

        <section className="interior-section section-shell" id="pilih-kelas">
          <div className="section-intro section-intro--split"><div><p className="eyebrow">Pilih Jalur</p><h2>Kelas yang dimulai dari kebutuhanmu.</h2></div><p>Kamu tidak perlu menunggu semuanya sempurna. Mulai dari satu persoalan yang paling dekat dengan pekerjaan atau rencana bisnismu hari ini.</p></div>
          <div className="class-path-grid">{classes.map(({ number, title, detail, text, icon: Icon }) => <article className="class-path-card" key={title}><div className="class-path-card__top"><span>{number}</span><Icon size={25} /></div><p>{detail}</p><h3>{title}</h3><p className="class-path-card__text">{text}</p><a href="/kelas#cara-belajar">Lihat cara belajarnya <ArrowRight size={17} /></a></article>)}</div>
        </section>

        <section className="process-band" id="cara-belajar"><div className="process-band__shell"><div className="process-band__copy"><p className="eyebrow">Cara Belajar</p><h2>Lebih sedikit teori yang mengambang. Lebih banyak praktik yang bisa dibawa pulang.</h2></div><div className="process-steps"><article><span>01</span><h3>Pahami konteks</h3><p>Mulai dari situasi dan tujuan yang sedang kamu hadapi.</p></article><article><span>02</span><h3>Buat output</h3><p>Ubah materi menjadi draft, sistem, atau prototipe yang nyata.</p></article><article><span>03</span><h3>Teruskan ritmenya</h3><p>Bawa hasil belajarmu ke komunitas dan pekerjaan sehari-hari.</p></article></div></div></section>

        <section className="interior-section section-shell editorial-split"><div className="editorial-split__art editorial-split__art--navy"><BookOpen size={49} /><span>Build<br />with intent.</span></div><div className="editorial-split__copy"><p className="eyebrow">Satu Langkah Awal</p><h2>Belum yakin harus mulai dari mana?</h2><p>Gunakan daftar kelas sebagai pintu masuk. Pilih yang paling dekat dengan output yang ingin kamu miliki dalam beberapa minggu ke depan.</p><ul className="check-list check-list--interior"><li><Check size={18} /> Materi yang dekat dengan praktik bisnis</li><li><Check size={18} /> Cocok untuk ritme belajar mandiri</li><li><Check size={18} /> Terhubung dengan ekosistem Starthustler</li></ul><PrimaryButton href="/komunitas" arrow>Masuk ke Komunitas</PrimaryButton></div></section>
      </main>
      <Footer />
    </div>
  );
}
