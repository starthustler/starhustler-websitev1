// StarHustler style contract: the navbar is a calm, legible dark-navy anchor that connects every editorial route.
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { BrandLogo } from "./BrandLogo.jsx";
import { PrimaryButton } from "./PrimaryButton.jsx";

const navItems = [
  ["Beranda", "/"],
  ["Kelas", "/kelas"],
  ["Company Training", "/company-training"],
  ["Komunitas", "/komunitas"],
  ["Tentang Kami", "/tentang-kami"],
  ["Blog", "/blog"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="nav-shell">
        <BrandLogo light />
        <nav className="desktop-nav" aria-label="Navigasi utama">
          {navItems.map(([label, href]) => (
            <a className={location === href ? "is-active" : ""} href={href} key={label}>{label}</a>
          ))}
        </nav>
        <div className="desktop-cta"><PrimaryButton href="/kelas">Gabung Sekarang</PrimaryButton></div>
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? "Tutup menu" : "Buka menu"} aria-expanded={open}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div className="mobile-nav" aria-label="Navigasi seluler">
          {navItems.map(([label, href]) => <a className={location === href ? "is-active" : ""} href={href} onClick={closeMenu} key={label}>{label}</a>)}
          <PrimaryButton href="/kelas" className="mobile-nav__cta">Gabung Sekarang</PrimaryButton>
        </div>
      )}
    </header>
  );
}
