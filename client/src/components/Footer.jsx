// StarHustler style contract: the footer continues the confident navy campaign field with compact practical pathways and white type.
import { Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { BrandLogo } from "./BrandLogo.jsx";

const columns = [
  { title: "Quick Link", links: ["Beranda", "Kelas Online", "Mentor", "Blog"] },
  { title: "Company", links: ["Tentang Kami", "Company Training", "Hubungi Kami", "Kebijakan Privasi"] },
  { title: "Social", links: ["Instagram", "LinkedIn", "YouTube", "TikTok"] },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-intro">
          <BrandLogo light />
          <p>Komunitas belajar AI yang membantu solopreneur mengubah ide menjadi bisnis yang bergerak.</p>
          <form className="footer-subscribe" onSubmit={(event) => event.preventDefault()}>
            <label className="sr-only" htmlFor="footer-email">Alamat email</label>
            <input id="footer-email" type="email" placeholder="Email kamu" />
            <button type="submit" aria-label="Daftar newsletter"><Mail size={16} /></button>
          </form>
        </div>
        <div className="footer-contact">
          <h3>Get in Touch</h3>
          <p><MapPin size={16} /> Jakarta, Indonesia</p>
          <p><Phone size={16} /> +62 811 2040 824</p>
          <p><Mail size={16} /> hello@starhustler.id</p>
          <div className="social-row" aria-label="Sosial media">
            <a href="#instagram" aria-label="Instagram"><Instagram size={17} /></a>
            <a href="#linkedin" aria-label="LinkedIn"><Linkedin size={17} /></a>
            <a href="#youtube" aria-label="YouTube"><Youtube size={18} /></a>
          </div>
        </div>
        {columns.map((column) => (
          <div className="footer-column" key={column.title}>
            <h3>{column.title}</h3>
            {column.links.map((link) => <a key={link} href="#beranda">{link}</a>)}
          </div>
        ))}
      </div>
      <div className="footer-copyright">© 2026 StarHustler. All rights reserved.</div>
    </footer>
  );
}
