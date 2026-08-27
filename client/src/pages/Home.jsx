// StarHustler style contract: build an asymmetric, portrait-led Indonesian edtech narrative in navy, white, black, and electric blue.
import { useState } from "react";
import { ArrowRight, BookOpen, BookMarked, Bot, BriefcaseBusiness, Check, ChevronDown, CircleCheck, Crown, GraduationCap, Layers3, MessageCircle, PanelTop, Quote, Rocket, Send, Sparkles, Users, UsersRound } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import { PrimaryButton, SecondaryButton } from "../components/PrimaryButton.jsx";

const ASSETS = { hero: "/manus-storage/starhustler-hero-founder_7e51a4c1.png", about: "/manus-storage/starhustler-about-founders_9d74897f.png", benefit: "/manus-storage/starhustler-benefits-mentor_fdf27b2f.png", courses: "/manus-storage/starhustler-course-creators_4af6efe2.png" };
const programs = [
  { icon: GraduationCap, title: "Kelas Intensif", text: "Belajar langsung bersama praktisi." },
  { icon: Users, title: "Komunitas", text: "Ruang tumbuh bersama sesama builder." },
  { icon: BriefcaseBusiness, title: "Company Training", text: "Upgrade skill tim secara terarah." },
  { icon: BookMarked, title: "Workshop", text: "Satu topik, langsung bisa dipraktikkan." },
  { icon: UsersRound, title: "Mentoring", text: "Peta jalan yang relevan untuk bisnismu." },
];
const benefits = [
  ["Belajar Sambil Tanya", "Diskusi langsung agar setiap materi benar-benar bisa dipakai.", MessageCircle],
  ["Komunitas yang Hidup", "Dapat teman bertumbuh, rekan uji ide, dan support system.", Users],
  ["Mentorship Langsung", "Akses insight dari praktisi yang pernah membangun dari nol.", Crown],
  ["Update Selalu", "Materi mengikuti tools AI yang benar-benar dipakai hari ini.", Sparkles],
  ["Proyek dengan Studi Kasus", "Bukan sekadar paham, tetapi punya hasil untuk ditunjukkan.", Layers3],
  ["Peluang Kolaborasi", "Bertemu talenta dan peluang baru dari jejaring komunitas.", Rocket],
];
const courses = [
  { title: "Solopreneur Class", instructor: "Rizki Nugraha", descriptor: "Dari ide ke bisnis yang bergerak", icon: Rocket, position: "0% center", avatar: "RN" },
  { title: "Cara Jadi AI Agency", instructor: "Nadine Aulia", descriptor: "Bangun layanan AI yang relevan", icon: Bot, position: "50% center", avatar: "NA" },
  { title: "Memulai Konten dengan AI", instructor: "Dimas Pratama", descriptor: "Konsisten membuat konten cerdas", icon: PanelTop, position: "100% center", avatar: "DP" },
];
const checklist = ["Kurikulum yang terstruktur", "Mentorship langsung dari praktisi", "Webinar skill baru tiap bulan", "Komunitas yang saling support", "Studi kasus dari bisnis yang nyata", "Selalu update AI tools terbaru", "Belajar personal branding untuk mendapatkan trust customer"];
const faqs = [
  ["Apa itu solopreneur?", "Solopreneur adalah individu yang membangun dan menjalankan bisnis secara mandiri, sambil memanfaatkan sistem, komunitas, dan teknologi untuk bergerak lebih cepat."],
  ["Apa bedanya solopreneur di StarHustler dengan solopreneur pada umumnya?", "Di sini kamu belajar menggunakan AI dan kerangka praktis untuk mengubah keahlian menjadi penawaran, proses, dan aset bisnis yang bisa tumbuh."],
  ["Saya masih kerja kantoran, apakah bisa ikut kelas ini?", "Bisa. Materinya dirancang untuk diterapkan bertahap dan membantu kamu membangun fondasi bisnis di luar jam kerja."],
  ["Saya tidak punya latar belakang coding, apakah bisa?", "Bisa. Kelas memprioritaskan cara berpikir, penggunaan tools, dan eksekusi praktis; bukan kemampuan teknis yang rumit."],
  ["Saya belum punya ide bisnis, apakah tetap bisa bergabung?", "Tentu. Kamu akan menguji kekuatan pribadi, memetakan masalah pasar, lalu menyusun ide yang layak dijalankan."],
  ["Berapa lama waktu yang saya butuhkan sampai menguasai ilmu ini?", "Kecepatan setiap orang berbeda. Fokus kami adalah memberi jalur praktik yang jelas agar kamu mulai mendapatkan progres sejak materi pertama."],
];

function SmallLogo({ label, mark }) { return <div className="partner-logo"><span>{mark}</span><b>{label}</b></div>; }
function OrbitDot({ icon: Icon, title, text, position }) { return <article className={`orbit-dot ${position}`}><span className="orbit-dot__icon"><Icon size={19} /></span><div><h3>{title}</h3><p>{text}</p></div></article>; }

export default function Home() {
  const [openFaq, setOpenFaq] = useState(0);
  const [newsletterStatus, setNewsletterStatus] = useState("");
  function subscribe(event) { event.preventDefault(); setNewsletterStatus("Terima kasih. Ebook panduan akan segera dikirim ke email kamu."); }

  return (
    <div className="site-page">
      <Navbar />
      <main>
        <section className="hero" id="beranda">
          <div className="hero-constellation constellation-one" aria-hidden="true" /><div className="hero-constellation constellation-two" aria-hidden="true" />
          <div className="hero-shell">
            <div className="hero-copy">
              <p className="hero-kicker"><Sparkles size={15} /> Komunitas dan Kelas AI untuk Solopreneur Indonesia!</p>
              <h1>Bangun dan Jalankan Bisnismu dengan <span>Memanfaatkan AI</span></h1>
              <p className="hero-body">“Human Creates The Vision, AI Handles The Execution.” Bangun sekarang dari jadi bagian dari komunitas solopreneur yang akan berjuang bersama.</p>
              <p className="hero-italic">Bukan sekadar belajar AI, kami ajarkan cara <em>menggunakannya untuk memulai bisnis.</em></p>
              <div className="hero-actions"><PrimaryButton href="#kelas" arrow>Mulai Belajar</PrimaryButton><SecondaryButton href="#tentang" play>Kenali Kami</SecondaryButton></div>
              <div className="hero-pulse"><span className="pulse" /> Belajar bersama builder yang serius bergerak.</div>
            </div>
            <div className="hero-art"><div className="hero-image-frame"><img src={ASSETS.hero} alt="Mentor StarHustler menunjuk ke materi kelas AI" /></div><span className="hero-star star-a">✦</span><span className="hero-star star-b">✦</span><div className="hero-orbit orbit-a" aria-hidden="true" /><div className="hero-orbit orbit-b" aria-hidden="true" /></div>
          </div>
          <svg className="hero-wave" viewBox="0 0 1440 86" preserveAspectRatio="none" aria-hidden="true"><path fill="#FFFFFF" d="M0,53 C225,100 410,11 658,54 C903,96 1123,16 1440,56 L1440,86 L0,86 Z" /></svg>
        </section>

        <section className="partner-strip" aria-label="Tools yang dipelajari"><div className="partner-shell"><p>Ekosistem belajar kami membantumu memahami tools yang sedang mengubah cara bisnis bekerja.</p><div className="partners"><SmallLogo mark="◉" label="ChatGPT" /><SmallLogo mark="✣" label="Claude" /><SmallLogo mark="▰" label="Cursor" /><SmallLogo mark="◆" label="Lovable" /><SmallLogo mark="✹" label="Higgsfield" /></div></div></section>

        <section className="about section-shell" id="tentang">
          <div className="about-visual"><div className="about-image about-image--primary"><img src={ASSETS.about} alt="Dua founder StarHustler" /></div><div className="about-image about-image--cutout"><img src={ASSETS.about} alt="Founder StarHustler" /></div><span className="about-dot" aria-hidden="true" /></div>
          <div className="about-copy"><SectionHeading eyebrow="Tentang Kami" title="Belajar untuk bergerak, bukan sekadar tahu." /><p>StarHustler adalah komunitas dan tempat belajar bagi para solopreneur yang ingin menciptakan bisnis dengan memanfaatkan kekuatan AI secara nyata. Kami percaya ide yang baik perlu proses yang bisa dieksekusi.</p><div className="founder-list"><article><CircleCheck size={21} /><div><h3>Andre Gunawan</h3><p>Founder sekaligus coach yang memadukan strategi bisnis dengan implementasi AI yang dapat digunakan hari ini.</p></div></article><article><CircleCheck size={21} /><div><h3>Reynold Simamora</h3><p>Penggerak program yang merancang jalan belajar berbasis praktik dan kolaborasi komunitas.</p></div></article></div><PrimaryButton href="#program" arrow>Kenali StarHustler</PrimaryButton></div>
        </section>

        <section className="program-section section-shell" id="program"><SectionHeading eyebrow="Program Kami" title="Pilih ruang belajar yang membuat langkahmu lebih terarah." description="Kami percaya setiap orang punya cara bergerak. Karena itu, program dirancang agar bisa kamu pilih sesuai momentum." /><div className="program-layout"><div className="program-lead"><span className="program-star" aria-hidden="true">✦</span><p>Yang kamu butuhkan bukan materi lebih banyak.</p><h3>Yang kamu butuhkan adalah cara untuk mulai.</h3><PrimaryButton href="#kelas">Lihat Semua Program</PrimaryButton></div><div className="program-grid">{programs.map(({ icon: Icon, title, text }, index) => <article className="program-card" key={title}><span className="program-card__index">0{index + 1}</span><span className="program-card__icon"><Icon size={23} /></span><h3>{title}</h3><p>{text}</p><span className="program-card__path" aria-hidden="true" /></article>)}</div></div></section>

        <section className="why-section" id="komunitas"><div className="why-shell"><SectionHeading eyebrow="Kenapa StarHustler?" title="Tidak hanya belajar. Kamu punya tempat untuk bertumbuh." center light /><div className="orbit-layout"><div className="orbit-ring orbit-ring--outer" aria-hidden="true" /><div className="orbit-ring orbit-ring--inner" aria-hidden="true" /><div className="benefit-portrait"><img src={ASSETS.benefit} alt="Member StarHustler yang sedang memikirkan strategi bisnis" /></div>{benefits.map(([title, text, Icon], index) => <OrbitDot key={title} icon={Icon} title={title} text={text} position={`orbit-${index + 1}`} />)}</div></div><svg className="navy-wave navy-wave--bottom" viewBox="0 0 1440 86" preserveAspectRatio="none" aria-hidden="true"><path fill="#FFFFFF" d="M0,30 C238,84 446,6 702,41 C973,80 1190,24 1440,5 L1440,86 L0,86 Z" /></svg></section>

        <section className="courses-section section-shell" id="kelas"><div className="courses-header"><SectionHeading eyebrow="Daftar Kelas Online" title="Kelas yang dibuat untuk hasil nyata." /><a href="#kelas" className="text-link">Lihat kelas lainnya <ArrowRight size={17} /></a></div><div className="course-grid">{courses.map(({ title, instructor, descriptor, icon: Icon, position, avatar }, index) => <article className={`course-card course-card--${index + 1}`} key={title}><div className="course-art" style={{ backgroundImage: `linear-gradient(180deg, rgba(11,19,48,.0), rgba(11,19,48,.54)), url(${ASSETS.courses})`, backgroundPosition: position }}><span className="course-icon"><Icon size={25} /></span><p>Kelas Online</p><span className="course-orbit" aria-hidden="true" /></div><div className="course-info"><div className="instructor"><span>{avatar}</span><small>oleh {instructor}</small></div><h3>{title}</h3><p>{descriptor}</p><div className="course-path"><span>Pelajari</span><i /><span>Praktik</span><i /><span>Jalankan</span></div><PrimaryButton href="#ebook">Daftar Kelas</PrimaryButton></div></article>)}</div><div className="center-action"><SecondaryButton href="#kelas" className="secondary-dark">Lihat Lainnya <ArrowRight size={16} /></SecondaryButton></div></section>

        <section className="difference-section section-shell"><div className="difference-visual"><div className="difference-photo difference-photo--back"><img src={ASSETS.courses} alt="Mentor mengajar di komunitas StarHustler" /></div><div className="difference-photo difference-photo--front"><img src={ASSETS.about} alt="Praktisi bisnis dalam komunitas StarHustler" /></div></div><div className="difference-copy"><SectionHeading eyebrow="Cara Belajar" title="Apa yang Membuat StarHustler Berbeda?" /><div className="stats-row"><div className="stat-ring"><b>30%</b><span>Teori</span></div><div className="stat-ring stat-ring--filled"><b>70%</b><span>Praktek</span></div></div><ul className="check-list">{checklist.map((item) => <li key={item}><Check size={17} /><span>{item}</span></li>)}</ul><PrimaryButton href="#kelas" arrow>Mulai Sekarang</PrimaryButton></div></section>

        <section className="faq-section section-shell" id="faq"><div className="faq-copy"><SectionHeading eyebrow="Masih Punya Pertanyaan?" title="Pertanyaan yang Sering Muncul" /><div className="faq-list">{faqs.map(([question, answer], index) => { const isOpen = openFaq === index; return <article className={`faq-item ${isOpen ? "faq-item--open" : ""}`} key={question}><button onClick={() => setOpenFaq(isOpen ? -1 : index)} aria-expanded={isOpen}><span className="faq-number">{String(index + 1).padStart(2, "0")}</span><span>{question}</span><ChevronDown size={19} /></button>{isOpen && <div className="faq-answer"><p>{answer}</p></div>}</article>; })}</div></div><aside className="faq-aside"><div className="faq-portrait"><img src={ASSETS.hero} alt="Mentor StarHustler siap menjawab pertanyaan" /></div><span className="faq-spark faq-spark--one">✦</span><span className="faq-spark faq-spark--two">✦</span></aside></section>

        <section className="ebook-section" id="ebook"><div className="ebook-shell"><div className="ebook-copy"><p className="ebook-kicker"><BookOpen size={17} /> Ebook Gratis untukmu</p><h2>Panduan Memulai sebagai Solopreneur</h2><p>Pelajari langkah awal membangun usaha sendiri, mulai dari menemukan ide sampai berani menawarkan ke pasar. Praktis, ringkas, dan ditulis untuk kamu yang ingin mulai sekarang.</p><form onSubmit={subscribe} className="ebook-form"><label className="sr-only" htmlFor="ebook-email">Alamat email</label><input id="ebook-email" required type="email" placeholder="Ketik email address" /><button type="submit">Download <Send size={15} /></button></form>{newsletterStatus && <p className="form-confirmation" role="status">{newsletterStatus}</p>}</div><div className="book-stack" aria-label="Ilustrasi tumpukan buku panduan"><div className="book book--one"><span>BUILD</span><b>IDEAS</b></div><div className="book book--two"><span>START</span><b>SMART</b></div><div className="book book--three"><span>MAKE</span><b>MOVES</b></div></div></div></section>

        <section className="ready-section"><div className="ready-orbit ready-orbit--one" aria-hidden="true" /><div className="ready-orbit ready-orbit--two" aria-hidden="true" /><div className="ready-shell"><div className="ready-portrait"><img src={ASSETS.courses} alt="Kreator yang siap menjalankan ide bisnis" /></div><div className="ready-copy"><p className="eyebrow">Sudah saatnya bergerak</p><h2>Masih Ragu?</h2><p>Semua langkah besar berangkat dari satu keputusan sederhana: mulai mencoba dan terus membangun.</p><PrimaryButton href="#kelas" arrow>Mulai dari Sini</PrimaryButton></div><div className="ready-quote"><Quote size={28} /><p>“Mulai kecil. Belajar cepat. Bangun yang berguna.”</p></div></div></section>
      </main>
      <Footer />
    </div>
  );
}
