// StarHustler style contract: build an asymmetric, portrait-led Indonesian edtech narrative in navy, white, black, and electric blue.
import { useState } from "react";
import { ArrowRight, BookOpen, BookMarked, Bot, BriefcaseBusiness, Check, ChevronDown, CircleCheck, Crown, GraduationCap, Layers3, MessageCircle, PanelTop, Quote, Rocket, Send, Sparkles, Users, UsersRound } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import { PrimaryButton, SecondaryButton } from "../components/PrimaryButton.jsx";

const ASSETS = { hero: "/manus-storage/starhustler-hero-founder_7e51a4c1.png", about: "/manus-storage/starhustler-about-founders_9d74897f.png", andre: "/manus-storage/andre-founder_a326359d.svg", septianus: "/manus-storage/septianus-founder_fe165f47.svg", benefit: "/manus-storage/starhustler-benefits-mentor_fdf27b2f.png", courses: "/manus-storage/starhustler-course-creators_4af6efe2.png" };
const programs = [
  { icon: GraduationCap, title: "Personal Branding" },
  { icon: Users, title: "AI Vibe Coding" },
  { icon: BriefcaseBusiness, title: "Social Media Management" },
  { icon: BookMarked, title: "AI Product Development" },
  { icon: UsersRound, title: "AI Entrepreneurship" },
];
const benefits = [
  ["Belajar Sambil Tetap Kerja", "Materi bisa diakses kapan saja, cocok untuk kamu yang waktunya terbatas", MessageCircle],
  ["Komunitas yang Saling Dukung", "Terhubung dengan sesama solopreneur yang paham perjuangan memulai dari nol", Users],
  ["Mentorship Langsung dari Praktisi", "Dibimbing oleh Andre dan Angga yang sudah menjalani sendiri jalan ini", Crown],
  ["Update Materi Setiap Bulan", "Tools dan strategi AI berkembang cepat, kamu selalu dapat versi terbaru", Sparkles],
  ["Praktek dengan Study Case", "Kamu langsung membangun produk dan sistem bisnis selama belajar", Layers3],
  ["Peluang Kolaborasi Sesama Member", "Terbuka kesempatan kerja sama dengan member dan mitra Starthustler lainnya", Rocket],
];
const courses = [
  { heading: "Solopreneur Class", title: "Solopreneur Class: Dari Ide Sampai Terjual", instructor: "Andre Tuwan, Abdul Arfan, Septianus", icon: Rocket, position: "0% center" },
  { heading: "Cara Setup Hermes Agent", title: "Cara Setup Hermes Agent", instructor: "Dhiya Fakhar Nafi", icon: Bot, position: "50% center" },
  { heading: "Membuat Konten Media Sosial dengan AI", title: "Membuat Konten Media Sosial dengan AI", instructor: "Filbert", icon: PanelTop, position: "100% center" },
];
const checklist = ["Kurikulum yang terstruktur", "Mentorship langsung dari praktisi", "Webinar skill baru tiap bulan", "Komunitas yang saling suportif", "Studi kasus dari bisnis yang nyata", "Selalu update AI tools terbaru", "Belajar personal branding untuk mendapatkan trust customer"];
const faqs = [
  ["Apa itu solopreneur?", "Solopreneur adalah seseorang yang membangun dan menjalankan bisnisnya sendiri tanpa tim besar, memanfaatkan teknologi untuk menggantikan peran yang biasanya dikerjakan banyak orang."],
  ["Apa bedanya solopreneur di Starthustler dengan solopreneur pada umumnya?", "Di Starthustler, solopreneur dimaknai sebagai perpaduan antara kemampuan bisnis, penguasaan AI, pemahaman dasar programming, dan strategi marketing. Empat hal ini yang membuat satu orang bisa menjalankan bisnis selayaknya sebuah tim"],
  ["Saya masih kerja kantoran, apakah bisa ikut kelas ini?", "Bisa. Materi dirancang fleksibel dan bisa diakses kapan saja, cocok untuk kamu yang masih menjalankan pekerjaan utama sambil membangun usaha sampingan."],
  ["Saya tidak punya latar belakang coding, apakah akan kesulitan?", "Tidak perlu khawatir. Kelas AI Vibe Coding dirancang untuk pemula, kamu akan belajar membuat produk digital dengan bantuan AI tanpa harus menghafal bahasa pemrograman."],
  ["Saya belum punya ide bisnis, apakah tetap bisa bergabung?", "Tentu. Solopreneur Class akan membantu kamu menemukan dan memvalidasi ide sejak awal sampai siap dijual."],
  ["Berapa lama waktu yang saya butuhkan setiap minggu untuk belajar?", "Kamu bisa menyesuaikan sendiri sesuai waktu luang. Materi tersedia dalam format yang bisa dipelajari sedikit demi sedikit tanpa mengganggu pekerjaan utama."],
  ["Apakah ada pendampingan setelah kelas selesai?", "Ada. Kamu tetap menjadi bagian dari komunitas Starthustler dan bisa terus bertanya, berdiskusi, serta mengikuti update materi terbaru."],
];

function SmallLogo({ label, mark }) { return <div className="partner-logo"><span>{mark}</span><b>{label}</b></div>; }
function OrbitDot({ icon: Icon, title, text, position }) { return <article className={`orbit-dot ${position}`}><span className="orbit-dot__icon"><Icon size={19} /></span><div><h3>{title}</h3><p>{text}</p></div></article>; }

export default function Home() {
  const [openFaq, setOpenFaq] = useState(0);
  function subscribe(event) { event.preventDefault(); }

  return (
    <div className="site-page">
      <Navbar />
      <main>
        <section className="hero" id="beranda">
          <div className="hero-constellation constellation-one" aria-hidden="true" /><div className="hero-constellation constellation-two" aria-hidden="true" />
          <div className="hero-shell">
            <div className="hero-copy">
              <p className="hero-kicker"><Sparkles size={15} /> “Komunitas dan Kelas AI untuk Solopreneur Indonesia”</p>
              <h1>Bangun dan Jalankan Bisnismu dengan <span>Menggunakan AI</span></h1>
              <p className="hero-italic">“Human Creates The Vision, AI Handles The Execution”</p>
              <p className="hero-body">Gabung sekarang dan jadi bagian dari komunitas solopreneur dan terus berkembang bersama.</p>
              <div className="hero-actions"><PrimaryButton href="#kelas" arrow>Gabung Sekarang</PrimaryButton><SecondaryButton href="#program" play>Lihat Program</SecondaryButton></div>
            </div>
            <div className="hero-art"><div className="hero-image-frame"><img src={ASSETS.hero} alt="Mentor StarHustler menunjuk ke materi kelas AI" /></div><span className="hero-star star-a">✦</span><span className="hero-star star-b">✦</span><div className="hero-orbit orbit-a" aria-hidden="true" /><div className="hero-orbit orbit-b" aria-hidden="true" /></div>
          </div>
          <svg className="hero-wave" viewBox="0 0 1440 86" preserveAspectRatio="none" aria-hidden="true"><path fill="#FFFFFF" d="M0,53 C225,100 410,11 658,54 C903,96 1123,16 1440,56 L1440,86 L0,86 Z" /></svg>
        </section>

        <section className="partner-strip" aria-label="Ekosistem AI yang Akan Kamu Kuasai"><div className="partner-shell"><div><h2>Ekosistem AI yang Akan Kamu Kuasai</h2><p>Bayar Sekali, Belajar dengan Tools yang Sama Dipakai Praktisi</p><small>Starthustler membekali kamu dengan tools AI dan infrastruktur yang dipakai solopreneur profesional untuk membangun serta menjalankan bisnisnya sendiri</small></div><div className="partners"><SmallLogo mark="◉" label="ChatGPT" /><SmallLogo mark="✣" label="Claude" /><SmallLogo mark="▰" label="CURSOR" /><SmallLogo mark="◆" label="Lovable" /><SmallLogo mark="✹" label="Higgsfield" /></div></div></section>

        <section className="about section-shell" id="tentang">
          <div className="about-visual"><div className="about-image about-image--primary"><img src={ASSETS.andre} alt="Andre Elausta Tuwan" /></div><div className="about-image about-image--cutout"><img src={ASSETS.septianus} alt="Septianus Angga" /></div><span className="about-dot" aria-hidden="true" /></div>
          <div className="about-copy"><SectionHeading title="Tentang Kami" /><p>Starthustler adalah komunitas dan tempat belajar bagi siapa saja yang ingin membangun usaha sendiri dengan bantuan AI. Kami percaya setiap orang bisa menjalankan bisnisnya sendiri tanpa harus punya tim besar, modal besar, atau latar belakang teknis, selama tahu cara memanfaatkan teknologi yang tepat.</p><h3>Starthustler didirikan oleh:</h3><div className="founder-list"><article><CircleCheck size={21} /><div><h3>Andre Elausta Tuwan</h3><p>Financial influencer dan mantan pegawai bank yang memilih resign untuk membangun bisnisnya sendiri. Aktif membagikan edukasi keuangan dan strategi solopreneur kepada ribuan followers</p></div></article><article><CircleCheck size={21} /><div><h3>Septianus Angga</h3><p>Entrepreneur dengan pengalaman lebih dari 10 tahun membangun dan menjalankan berbagai bisnis. Memahami langsung tantangan yang dihadapi solopreneur mulai dari nol hingga berkembang.</p></div></article></div><PrimaryButton href="#program" arrow>Gabung Sekarang</PrimaryButton></div>
        </section>

        <section className="program-section section-shell" id="program"><SectionHeading title="Program Kami" description="Lima Pilar Menuju Solopreneur yang Mandiri" /><div className="program-layout"><div className="program-lead"><span className="program-star" aria-hidden="true">✦</span><p>Lima Pilar Menuju Solopreneur yang Mandiri</p><h3>Lima Pilar Menuju Solopreneur yang Mandiri</h3><PrimaryButton href="#kelas">Lihat Semua Program</PrimaryButton></div><div className="program-grid">{programs.map(({ icon: Icon, title }, index) => <article className="program-card" key={title}><span className="program-card__index">0{index + 1}</span><span className="program-card__icon"><Icon size={23} /></span><h3>{title}</h3><span className="program-card__path" aria-hidden="true" /></article>)}</div></div></section>

        <section className="why-section" id="komunitas"><div className="why-shell"><SectionHeading title="Kenapa Starthustler?" center light /><div className="orbit-layout"><div className="orbit-ring orbit-ring--outer" aria-hidden="true" /><div className="orbit-ring orbit-ring--inner" aria-hidden="true" /><div className="benefit-portrait"><img src={ASSETS.benefit} alt="" /></div>{benefits.map(([title, text, Icon], index) => <OrbitDot key={title} icon={Icon} title={title} text={text} position={`orbit-${index + 1}`} />)}</div></div><svg className="navy-wave navy-wave--bottom" viewBox="0 0 1440 86" preserveAspectRatio="none" aria-hidden="true"><path fill="#FFFFFF" d="M0,30 C238,84 446,6 702,41 C973,80 1190,24 1440,5 L1440,86 L0,86 Z" /></svg></section>

        <section className="courses-section section-shell" id="kelas"><div className="courses-header"><SectionHeading title="Daftar Kelas Online" /><a href="#kelas" className="text-link">Gabung Sekarang <ArrowRight size={17} /></a></div><div className="course-grid">{courses.map(({ heading, title, instructor, icon: Icon, position }, index) => <article className={`course-card course-card--${index + 1}`} key={title}><div className="course-art" style={{ backgroundImage: `linear-gradient(180deg, rgba(11,19,48,.0), rgba(11,19,48,.54)), url(${ASSETS.courses})`, backgroundPosition: position }}><span className="course-icon"><Icon size={25} /></span><p>{heading}</p><span className="course-orbit" aria-hidden="true" /></div><div className="course-info"><div className="instructor"><span aria-hidden="true"><Users size={11} /></span><small>{instructor}</small></div><h3>{title}</h3><PrimaryButton href="#ebook">Daftar Kelas</PrimaryButton></div></article>)}</div><div className="center-action"><SecondaryButton href="#kelas" className="secondary-dark">Lihat Lainnya <ArrowRight size={16} /></SecondaryButton></div></section>

        <section className="difference-section section-shell"><div className="difference-visual"><div className="difference-photo difference-photo--back"><img src={ASSETS.courses} alt="" /></div><div className="difference-photo difference-photo--front"><img src={ASSETS.about} alt="" /></div></div><div className="difference-copy"><SectionHeading title="Apa yang Membuat Starthustler Berbeda?" /><div className="stats-row"><div className="stat-ring"><b>30%</b><span>Teori</span></div><div className="stat-ring stat-ring--filled"><b>70%</b><span>Praktek</span></div></div><ul className="check-list">{checklist.map((item) => <li key={item}><Check size={17} /><span>{item}</span></li>)}</ul><PrimaryButton href="#kelas" arrow>Gabung Sekarang</PrimaryButton></div></section>

        <section className="faq-section section-shell" id="faq"><div className="faq-copy"><SectionHeading title="Frequently Asked Questions" /><div className="faq-list">{faqs.map(([question, answer], index) => { const isOpen = openFaq === index; return <article className={`faq-item ${isOpen ? "faq-item--open" : ""}`} key={question}><button onClick={() => setOpenFaq(isOpen ? -1 : index)} aria-expanded={isOpen}><span className="faq-number">{String(index + 1).padStart(2, "0")}</span><span>{question}</span><ChevronDown size={19} /></button>{isOpen && <div className="faq-answer"><p>{answer}</p></div>}</article>; })}</div></div><aside className="faq-aside"><div className="faq-portrait"><img src={ASSETS.hero} alt="" /></div><span className="faq-spark faq-spark--one">✦</span><span className="faq-spark faq-spark--two">✦</span></aside></section>

        <section className="ebook-section" id="ebook"><div className="ebook-shell"><div className="ebook-copy"><h2>Ebook Gratis: Panduan Memulai sebagai Solopreneur</h2><p className="ebook-kicker"><BookOpen size={17} /> Ditulis Langsung oleh Andre Elausta Tuwan</p><p>Pelajari langkah awal membangun usaha sendiri, mulai dari menemukan ide sampai berani mengambil keputusan pertama. Ebook ini merangkum pengalaman Andre keluar dari dunia perbankan dan membangun jalannya sendiri sebagai solopreneur.</p><form onSubmit={subscribe} className="ebook-form"><label className="sr-only" htmlFor="ebook-email">Enter your email address</label><input id="ebook-email" required type="email" placeholder="Enter your email address" /><button type="submit">Download <Send size={15} /></button></form></div><div className="book-stack" aria-hidden="true"><div className="book book--one" /><div className="book book--two" /><div className="book book--three" /></div></div></section>

        <section className="ready-section"><div className="ready-orbit ready-orbit--one" aria-hidden="true" /><div className="ready-orbit ready-orbit--two" aria-hidden="true" /><div className="ready-shell"><div className="ready-portrait"><img src={ASSETS.courses} alt="" /></div><div className="ready-copy"><h2>Masih Ragu?</h2><p>Ratusan solopreneur lain memulai dari titik yang sama seperti kamu sekarang. Bedanya, mereka memilih untuk mulai lebih dulu.</p><PrimaryButton href="#kelas" arrow>Gabung Sekarang</PrimaryButton></div><div className="ready-quote" aria-hidden="true"><Quote size={28} /></div></div></section>
      </main>
      <Footer />
    </div>
  );
}
