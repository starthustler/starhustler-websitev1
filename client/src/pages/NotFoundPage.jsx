// StarHustler style contract: a missed route still returns visitors to a confident, clear next step in the learning ecosystem.
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { PrimaryButton } from "../components/PrimaryButton.jsx";

export default function NotFoundPage() {
  return <div className="interior-page"><Navbar /><main className="not-found-page"><p className="eyebrow">404</p><h1>Halaman ini belum menemukan orbitnya.</h1><p>Gunakan menu untuk kembali ke kelas, komunitas, atau catatan Starthustler.</p><PrimaryButton href="/" arrow>Kembali ke Beranda</PrimaryButton></main><Footer /></div>;
}
