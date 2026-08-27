// StarHustler style contract: the community page feels warm and human within the crisp navy-and-blue editorial brand system.
import { ArrowRight, Check, MessageCircle, Rocket, Sparkles, UsersRound } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import PageHero from "../components/PageHero.jsx";
import { PrimaryButton } from "../components/PrimaryButton.jsx";

const heroImage = "/manus-storage/starhustler-community-page-v2_ba443ece.png";
const habits = [["Bertukar konteks", "Cerita tentang tantangan dan proses lebih berguna daripada jawaban instan.", MessageCircle], ["Menjaga momentum", "Belajar lebih mudah diteruskan ketika ada ruang untuk kembali dan bertanya.", Sparkles], ["Membuka peluang", "Pertemuan yang baik sering berawal dari percakapan kecil antar builder.", Rocket]];

export default function CommunityPage() {
  return (
    <div className="interior-page community-page">
      <Navbar />
      <main>
        <PageHero eyebrow="Komunitas" variant="community" title={<>Ruang untuk terus <span>bergerak bersama.</span></>} description="Starthustler mempertemukan orang-orang yang sedang membangun jalannya sendiri dan ingin belajar AI dengan cara yang praktis." image={heroImage}>
          <PrimaryButton href="/kelas" arrow>Lihat Kelas</PrimaryButton>
        </PageHero>

        <section className="interior-section section-shell community-manifesto"><div className="community-manifesto__lead"><p className="eyebrow">Bukan Sekadar Grup</p><h2>Tempat untuk membawa pertanyaan yang belum selesai.</h2><p>Di sini, proses membangun bukan sesuatu yang perlu disembunyikan. Kamu bisa datang dengan ide mentah, tantangan yang rumit, atau rasa ingin tahu yang baru mulai tumbuh.</p></div><div className="community-manifesto__quote"><UsersRound size={35} /><p>Belajar sendiri tidak berarti harus berjalan sendirian.</p></div></section>

        <section className="community-rhythm"><div className="community-rhythm__shell"><div><p className="eyebrow">Ritme Komunitas</p><h2>Ada alasan untuk kembali, mencoba, lalu berbagi lagi.</h2></div><div className="rhythm-list">{habits.map(([title, text, Icon], index) => <article key={title}><span>0{index + 1}</span><Icon size={27} /><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></div></section>

        <section className="interior-section section-shell editorial-split"><div className="principle-grid"><article><Check size={20} /><p>Datang dengan rasa ingin tahu.</p></article><article><Check size={20} /><p>Berbagi konteks sebelum meminta jawaban.</p></article><article><Check size={20} /><p>Merayakan kemajuan yang kecil tetapi nyata.</p></article></div><div className="editorial-split__copy"><p className="eyebrow">Cara Kita Bertemu</p><h2>Komunitas yang tidak menuntut kamu sudah jadi ahli.</h2><p>Kamu cukup membawa niat untuk mencoba. Dari sana, kelas, diskusi, dan proyek kecil bisa bertumbuh menjadi cara kerja yang lebih kuat.</p><PrimaryButton href="/kelas" arrow>Mulai dari Kelas</PrimaryButton></div></section>
      </main>
      <Footer />
    </div>
  );
}
