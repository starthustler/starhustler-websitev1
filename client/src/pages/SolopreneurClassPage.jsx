import { ArrowRight, Check, Play, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { PrimaryButton, SecondaryButton } from "../components/PrimaryButton.jsx";

const ASSETS = {
 idea: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663103122812/qMVpcqeyowcgpnzh.webp",
  finance: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663103122812/QXaiRNsKUVeNqeLt.webp",
  coding: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663103122812/MpuZefECsUMNWyEl.webp",
  instructor: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663103122812/cWajMpqmaSJAlBlN.webp",
  ebook: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663103122812/UYQFNKEWgFEGvhtB.webp",
};

const benefits = [
  "Praktik langsung bersama mentor",
  "Akses rekaman kelas",
  "Masuk ke grup komunitas Premium",
  "Bahan untuk memulai proyek pertama",
  "Belajar Prakterk dari studi kasus nyata",
  "Membuka Framework berpikir dalam Menangkap Peluang",
];

export default function SolopreneurClassPage() {
  return (
    <div className="site-page class-detail-page">
      <Navbar />
      <main>
        <section className="class-detail-hero">
          <div className="class-detail-hero__copy">
            <p className="eyebrow"><Sparkles size={15} /> Solopreneur Class</p>
            <h1>Satu aplikasi sederhana, 1 juta lebih download, Potensi cuan miliaran</h1>
            <div className="class-detail-meta"><span>AUG<br /><b>28</b></span><span>Senin, 28 Agustus 2026<br />19.00 - 21.00</span><span>Live via Zoom<br /><small>Diberikan setelah peserta masuk ke grup komunitas</small></span></div>
            <PrimaryButton href="#daftar-kelas">Daftar Kelas <ArrowRight size={16} /></PrimaryButton>
          </div>
          <div className="class-detail-hero__art"><img src={ASSETS.hero} alt="Solopreneur reviewing an app idea" /></div>
        </section>

        <section className="class-detail-intro section-shell">
          <p>Selama dua jam, kamu akan diajak melihat cara seorang solopreneur menemukan peluang dari masalah sehari hari, mengubahnya menjadi ide aplikasi, lalu mulai membangunnya dengan bantuan AI.</p>
          <div className="class-detail-intro__grid"><div><h2>Kita tidak akan membahas teori bisnis yang berputar putar.</h2><p>Kita akan membedah sebuah studi kasus aplikasi sederhana yang sudah dipakai lebih dari 1 juta orang, kemudian melihat bagaimana produk seperti itu bisa dibuat, dikembangkan, dan diuji peluang bisnisnya.</p></div><div><h2>Cocok Untuk Siapa ?</h2><p>Kelas ini cocok untuk kamu yang ingin mulai membangun produk sendiri tanpa harus menunggu punya tim, kantor, atau kemampuan coding, benar benar bisa dimulai dari nol.</p></div></div>
          <div className="center-action" id="daftar-kelas"><PrimaryButton href="#promo">Daftar Kelas <ArrowRight size={16} /></PrimaryButton></div>
        </section>

        <section className="class-detail-split section-shell"><div className="class-detail-split__copy"><h2>Ternyata, aplikasi sederhana bisa dipakai jutaan orang.</h2><p>Coba lihat pola ini. Sebuah aplikasi pencatatan keuangan yang tampilannya sederhana bisa mencapai 1 juta lebih download di Play Store. Fungsinya dekat dengan kehidupan sehari hari, masalah yang diselesaikan jelas, dan orang bisa langsung memakainya tanpa perlu belajar lama.</p><p>Aplikasi seperti ini mungkin tidak terlihat heboh. Tidak ada efek 3D. Tidak ada fitur yang membuat orang berkata, “Wah, secanggih itu?”</p><h3>1 juta lebih download</h3><p>Namun justru di situlah peluangnya. Banyak produk digital yang menghasilkan bukan karena rumit, melainkan karena menyelesaikan satu masalah dengan cara yang mudah dipahami.</p><p>Angka ini menunjukkan bahwa produk sederhana pun bisa menemukan pasar yang besar ketika masalahnya nyata dan solusinya mudah digunakan.</p></div><div className="class-detail-split__media"><img src={ASSETS.finance} alt="Simple finance app product story" /></div></section>

        <section className="class-detail-calculation section-shell"><div><h2>Berapa potensi penghasilannya?</h2><p>Sekarang kita hitung hitungannya. Siapkan kalkulator !</p><p>Ini adalah simulasi sederhana berdasarkan studi kasus yang kita bahas di kelas. Jika sebuah aplikasi memiliki 1 juta download dan 5 persen penggunanya memilih fitur premium dengan harga 45 ribu rupiah.</p></div><div className="calculation-box"><p>1.000.000 download × 5 persen pengguna premium × 45.000 rupiah = 50.000 pengguna premium × 45.000 rupiah =</p><strong>2.250.000.000 rupiah</strong><em>atau “Dua koma dua lima miliar rupiah”</em></div><p className="class-detail-note">Angkanya memang bikin berhenti scroll. Namun perlu dicatat, ini simulasi pendapatan kotor, bukan janji pendapatan secara instan. Hasil nyata bergantung pada kualitas produk, jumlah pengguna aktif, tingkat konversi, biaya platform, pajak, pemasaran, dan banyak faktor lain.</p><p>Yang ingin kita pelajari bukan cara mengejar angka secara membabi buta. Kita ingin memahami bagaimana produk kecil dapat dibangun, diuji, dan dikembangkan menjadi aset digital.</p><div className="center-action"><PrimaryButton href="#promo">Daftar Kelas <ArrowRight size={16} /></PrimaryButton></div></section>

        <section className="class-detail-split class-detail-split--reverse section-shell"><div className="class-detail-split__copy"><h2>Seriusan ini? Bikinnya susah, ya?</h2><p>Dulu, bikin aplikasi berarti harus punya skill coding. Sekarang, pintu masuknya sudah berubah.</p><p>Kamu tidak harus menjadi programmer senior untuk mulai membuat produk digital. Dengan bantuan Codex dari ChatGPT, kamu bisa menjelaskan ide dengan bahasa sehari hari, meminta bantuan menyusun fitur, mencoba alur aplikasi, dan memperbaiki masalah secara bertahap.</p><p>Di kelas ini, Abdul Arfan akan menunjukkan cara berpikirnya saat mengubah ide menjadi produk. Kamu akan melihat prosesnya secara langsung step by step.</p><p>Tetap ada hal yang perlu dipelajari. Kamu perlu bisa menjelaskan kebutuhan produk, mengecek hasil AI, mencoba aplikasinya, dan berani memperbaiki bagian yang belum berjalan. AI membantu mengerjakan bagian teknis, tetapi arah produknya tetap datang dari kamu.</p></div><div className="class-detail-split__media"><img src={ASSETS.coding} alt="AI-assisted coding workspace" /></div></section>

        <section className="class-detail-mentor section-shell"><div><h2>Bukan sekadar teori. Mentor kita pernah menjual produk buatannya sendiri</h2><p>Abdul Arfan adalah programmer berpengalaman yang sudah bekerja di bidang teknologi selama bertahun tahun. Ia pernah menjadi Software Engineer di beberapa perusahaan teknologi, termasuk Bank Aladin Syariah, dan saat ini berperan sebagai Information Technology Development Manager.</p><p>Di luar pekerjaan profesionalnya, Arfan juga membangun produk digital sendiri. Salah satu aplikasi sederhananya pernah diunduh 5 juta orang dan menghasilkan sekitar 700 juta rupiah.</p></div><div className="class-detail-mentor__card"><img src={ASSETS.instructor} alt="Abdul Arfan, instructor" /><h3>Pemateri telah membuktikannya !</h3></div><div className="center-action"><PrimaryButton href="#promo">Daftar Kelas <ArrowRight size={16} /></PrimaryButton></div></section>

        <section className="class-detail-benefits"><div className="section-shell"><h2>Kalau begitu, apa yang akan saya dapatkan?</h2><div className="benefit-grid">{benefits.map((benefit) => <div key={benefit}><Check size={18} /><span>{benefit}</span></div>)}</div><div className="class-detail-proof-grid" aria-label="Praktik dan akses yang diberikan dalam kelas">{["Praktik langsung bersama mentor", "Akses rekaman kelas", "Masuk ke grup komunitas Premium", "Bahan untuk memulai proyek pertama", "Belajar Prakterk dari studi kasus nyata", "Membuka Framework berpikir dalam Menangkap Peluang"].map((label) => <div className="class-detail-proof-card" key={`proof-${label}`}><span className="class-detail-proof-chart"><i /></span><small>{label}</small></div>)}</div><div className="center-action"><PrimaryButton href="#promo">Daftar Kelas <ArrowRight size={16} /></PrimaryButton></div></div></section>

        <section className="class-detail-promo section-shell" id="promo"><div><p className="eyebrow">Ada promo, tidak?</p><h2>Ambil paket bundling kelas online dan ebook “Memulai Solopreneur” karya Andre Tuwan</h2><p>Kelas online : 150 ribu rupiah<br />Ebook “Memulai Solopreneur”: 150 ribu rupiah<br />Total nilai: 300 ribu rupiah<br />Harga bundling bulan ini: 200 ribu rupiah<br />Hemat 100 ribu rupiah.</p><div className="class-detail-actions"><PrimaryButton href="#daftar-kelas">Saya Mau Paket Bundling 200k</PrimaryButton><SecondaryButton href="#daftar-kelas">Saya Mau Kelas Saja 150k</SecondaryButton></div></div><img src={ASSETS.ebook} alt="Memulai Solopreneur ebook bundle" /></section>

        <section className="class-detail-ebook section-shell"><div><h2>Apa yang ada dalam buku ini?</h2><h3>Produk sudah jadi, tapi orang belum tahu siapa yang membuatnya? Di situlah personal branding ikut bermain</h3><p>Ebook “Memulai Solopreneur” membantu kamu memahami langkah awal membangun usaha sendiri, mulai dari menemukan arah, membangun kepercayaan, sampai berani memperkenalkan apa yang kamu kerjakan.</p><p>Andre Tuwan dikenal sebagai kreator edukasi keuangan dengan kanal YouTube yang memiliki sekitar 139 ribu subscriber. Ia pernah bekerja di dunia perbankan dan kemudian memilih membangun jalannya sendiri sebagai kreator dan solopreneur.</p><p>Buku ini cocok dibaca bersamaan dengan kelas. Kelas membantu kamu melihat cara membuat produk. Ebook membantu kamu memikirkan cara membawa diri, membangun kepercayaan, dan memperkenalkan produk tersebut kepada orang lain.</p></div><div className="class-detail-ebook__visual"><img src={ASSETS.ebook} alt="Memulai Solopreneur ebook" /></div><div className="center-action"><PrimaryButton href="#promo">Saya Mau Paket Bundling 200k</PrimaryButton></div></section>

        <section className="class-detail-about section-shell"><div><p className="eyebrow">Tentang Pengajar</p><h2>Abdul Arfan, programmer yang ikut turun tangan membangun produknya sendiri</h2><p>Abdul Arfan memiliki pengalaman profesional di bidang software engineering, arsitektur sistem, pengembangan aplikasi, dan pengelolaan teknologi. Dalam perjalanan kariernya, ia pernah bekerja sebagai Software Engineer di Bumblebee Tech, OVO, Security Research Labs, dan Bank Aladin Syariah. Ia juga pernah menjadi Principal Engineer dan kini menjabat sebagai Information Technology Development Manager.</p><p>Namun pengalaman yang paling relevan untuk kelas ini adalah pengalamannya membuat dan menjual produk digital sendiri. Ia pernah membangun aplikasi yang diunduh 5 juta orang dengan penghasilan sekitar 700 juta rupiah. Sekarang, ia akan menunjukkan bagaimana AI bisa membantu lebih banyak orang masuk ke dunia pembuatan produk digital.</p></div><img src={ASSETS.instructor} alt="Abdul Arfan" /></section>

        <section className="class-detail-starhustler"><div className="section-shell"><p className="eyebrow">Tentang StartHustler</p><p>StartHustler adalah komunitas Solopreneur dan tempat belajar bagi siapa saja yang ingin membangun usaha sendiri dengan bantuan AI.</p><p>Fokusnya sederhana. Kamu belajar menemukan peluang, membangun produk, memperkenalkan produk, dan bertumbuh bersama orang lain yang sedang menempuh jalan serupa.</p><PrimaryButton href="/komunitas">Join Komunitas Free <ArrowRight size={16} /></PrimaryButton></div></section>
      </main>
      <Footer />
    </div>
  );
}
