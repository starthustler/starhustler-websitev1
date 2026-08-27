// StarHustler style contract: the footer continues the confident navy campaign field with compact practical pathways and white type.
import { Instagram, Linkedin, Mail, MapPin, Youtube } from "lucide-react";
import { BrandLogo } from "./BrandLogo.jsx";

const columns = [{ title: "Quick Link", links: ["Beranda", "Kelas", "Blog", "Community", "Tentang Kami", "Company Training"] }];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-intro">
          <BrandLogo light />
          <p>“Human Creates The Vision, AI Handles The Execution”</p>
          <form className="footer-subscribe" onSubmit={(event) => event.preventDefault()}>
            <label className="sr-only" htmlFor="footer-email">Email Address</label>
            <Mail className="subscribe-icon" size={19} aria-hidden="true" />
            <input id="footer-email" type="email" placeholder="Email Address" />
            <button type="submit" aria-label="Subscribe">Subscribe</button>
          </form>
        </div>
        <div className="footer-contact">
          <h3>Get in Touch</h3>
          <p><Mail size={16} /> hello@starthustler.com</p>
          <p><MapPin size={16} /> Jl. Kemang Utara No. 19A, Kec. Mampang Prapatan Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta</p>
          <h3>Social Media</h3>
          <div className="social-row" aria-label="Social Media">
            <a href="#instagram" aria-label="Instagram"><Instagram size={17} /></a>
            <a href="#linkedin" aria-label="LinkedIn"><Linkedin size={17} /></a>
            <a href="#youtube" aria-label="YouTube"><Youtube size={18} /></a>
          </div>
        </div>
        {columns.map((column) => (
          <div className="footer-column" key={column.title}>
            <h3>{column.title}</h3>
            <nav className="footer-link-grid" aria-label={column.title}>
              {column.links.map((link) => <a key={link} href="#beranda">{link}</a>)}
            </nav>
          </div>
        ))}
      </div>
      <div className="footer-copyright">Copyright © Starthustler all rights reserved.</div>
    </footer>
  );
}
