// StarHustler style contract: the navbar is a calm, legible dark-navy anchor above the high-energy hero campaign field.
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "./BrandLogo.jsx";
import { PrimaryButton } from "./PrimaryButton.jsx";

const navItems = [
  ["Beranda", "#beranda"],
  ["Kelas", "#kelas"],
  ["Company Training", "#program"],
  ["Komunitas", "#komunitas"],
  ["Tentang Kami", "#tentang"],
  ["Blog", "#faq"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="nav-shell">
        <BrandLogo light />
        <nav className="desktop-nav" aria-label="Navigasi utama">
          {navItems.map(([label, href]) => (
            <a href={href} key={label}>{label}</a>
          ))}
        </nav>
        <div className="desktop-cta"><PrimaryButton href="#kelas">Gabung Sekarang</PrimaryButton></div>
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? "Tutup menu" : "Buka menu"} aria-expanded={open}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div className="mobile-nav" aria-label="Navigasi seluler">
          {navItems.map(([label, href]) => <a href={href} onClick={closeMenu} key={label}>{label}</a>)}
          <PrimaryButton href="#kelas" className="mobile-nav__cta">Gabung Sekarang</PrimaryButton>
        </div>
      )}
    </header>
  );
}
