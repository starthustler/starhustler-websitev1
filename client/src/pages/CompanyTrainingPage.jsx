// StarHustler style contract: the company-training page is a focused B2B editorial pitch—practical outcomes, no inflated promises.
import { ArrowRight, BriefcaseBusiness, Check, Lightbulb, Mail, UsersRound, Workflow } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import PageHero from "../components/PageHero.jsx";
import { PrimaryButton } from "../components/PrimaryButton.jsx";

const heroImage = "/assets/starhustler-company-training-v2_448b3dfa.webp";
const formats = [
  ["Workshop Intensif", "Sesi terarah untuk menyamakan cara pandang dan langsung mencoba alur kerja baru.", Lightbulb],
  ["Sprint Praktik", "Pendampingan singkat yang membantu tim membawa persoalan nyata ke meja belajar.", Workflow],
  ["Learning Series", "Rangkaian sesi untuk membangun kebiasaan baru secara bertahap dan tetap relevan.", UsersRound],
];

export default function CompanyTrainingPage() {
  return (
    <div className="interior-page company-page">
      <Navbar />
      <main>
        <PageHero eyebrow="Company Training" tone="light" variant="team" title={<>AI yang <span>masuk ke cara kerja tim.</span></>} description="StarHustler membantu tim memahami dan mencoba alat AI melalui kasus kerja yang nyata, bukan sekadar sesi presentasi." image={heroImage} imageClassName="page-hero__media--lifted">
          <PrimaryButton href="#diskusi" arrow>Mulai Diskusi</PrimaryButton>
        </PageHero>

        <section className="interior-section section-shell"><div className="section-intro"><p className="eyebrow">Dibuat untuk Tim</p><h2>Bukan pelatihan satu arah.</h2><p>Setiap sesi dibangun di sekitar konteks tim: proses yang masih lambat, peluang yang belum dieksplorasi, atau cara kerja yang ingin dibuat lebih jelas.</p></div><div className="outcome-grid"><article><BriefcaseBusiness size={28} /><h3>Berangkat dari pekerjaan nyata</h3><p>Kami memulai dari persoalan yang benar-benar dihadapi tim, bukan dari contoh yang jauh dari keseharian.</p></article><article><Workflow size={28} /><h3>Mencoba dengan aman</h3><p>Tim punya ruang untuk menguji alur kerja dan cara berpikir baru sebelum membawanya ke proses utama.</p></article><article><UsersRound size={28} /><h3>Menciptakan bahasa bersama</h3><p>Pelatihan menjadi titik temu antara bisnis, kreatif, dan teknologi agar proses berikutnya lebih lancar.</p></article></div></section>

        <section className="format-section"><div className="format-section__shell"><div><p className="eyebrow">Format Fleksibel</p><h2>Disesuaikan dengan ritme tim, bukan sebaliknya.</h2></div><div className="format-stack">{formats.map(([title, text, Icon], index) => <article key={title}><span>0{index + 1}</span><Icon size={24} /><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></div></section>

        <section className="interior-section section-shell editorial-split editorial-split--reverse" id="diskusi"><div className="editorial-split__copy"><p className="eyebrow">Mulai dari Percakapan</p><h2>Ceritakan konteks timmu.</h2><p>Kirimkan gambaran singkat tentang tim, tantangan, dan jenis output yang ingin didorong. Kami akan membantu menyusun titik awal pembicaraan.</p><PrimaryButton href="mailto:hello@starthustler.com" arrow>Hubungi Kami</PrimaryButton></div><div className="enquiry-panel"><Mail size={32} /><p>hello@starthustler.com</p><span>Company Training / Starthustler</span></div></section>
      </main>
      <Footer />
    </div>
  );
}
