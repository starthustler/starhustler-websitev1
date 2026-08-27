// StarHustler style contract: the About page pairs clarity of purpose with a human, founder-led editorial voice.
import { ArrowRight, CheckCircle2, Compass, HeartHandshake, Rocket } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import PageHero from "../components/PageHero.jsx";
import { PrimaryButton } from "../components/PrimaryButton.jsx";

const heroImage = "/manus-storage/starhustler-about-page-v2_98c18321.png";
const principles = [["Manusia tetap memegang arah", "AI adalah alat untuk mempercepat eksekusi, bukan pengganti visi dan pertimbangan manusia.", Compass], ["Belajar harus melahirkan gerak", "Materi terbaik adalah materi yang membuat seseorang mampu mencoba sesuatu setelah sesi berakhir.", Rocket], ["Kemandirian tumbuh lewat dukungan", "Bertumbuh sendiri akan lebih mungkin ketika ada ruang belajar dan percakapan yang saling menguatkan.", HeartHandshake]];

export default function AboutPage() {
  return (
    <div className="interior-page about-page">
      <Navbar />
      <main>
        <PageHero eyebrow="Tentang Starthustler" tone="light" variant="founders" title={<>Membuka jalan bagi <span>orang yang ingin membangun sendiri.</span></>} description="Kami percaya teknologi yang tepat dapat membantu lebih banyak orang mengubah keahlian, pengalaman, dan gagasan menjadi usaha yang bergerak." image={heroImage}>
          <PrimaryButton href="/komunitas" arrow>Kenal Komunitas</PrimaryButton>
        </PageHero>

        <section className="interior-section section-shell about-statement"><div><p className="eyebrow">Yang Kami Percaya</p><h2>AI tidak menggantikan ambisi. AI memberi ruang untuk ambisi bergerak lebih jauh.</h2></div><p>StarHustler adalah ruang belajar untuk orang yang tidak ingin menunggu kondisi sempurna sebelum memulai. Kami membantu setiap anggota membangun fondasi, cara berpikir, dan sistem yang bisa mereka lanjutkan sendiri.</p></section>

        <section className="principle-section"><div className="principle-section__shell"><p className="eyebrow">Prinsip Kerja</p><div className="principle-list">{principles.map(([title, text, Icon], index) => <article key={title}><span>0{index + 1}</span><Icon size={30} /><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></div></section>

        <section className="interior-section section-shell founder-panel"><div className="founder-panel__title"><p className="eyebrow">Dibangun Bersama</p><h2>Untuk orang yang ingin menulis jalannya sendiri.</h2></div><div className="founder-panel__copy"><p>Starthustler lahir dari keyakinan sederhana: banyak orang punya kemampuan untuk membangun sesuatu yang berarti, tetapi membutuhkan peta, alat, dan ruang untuk bertumbuh.</p><PrimaryButton href="/company-training" arrow>Untuk Tim Anda</PrimaryButton></div></section>
      </main>
      <Footer />
    </div>
  );
}
