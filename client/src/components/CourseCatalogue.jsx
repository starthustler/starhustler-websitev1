// StarHustler style contract: this shared catalogue preserves the homepage's practical, editorial course-card rhythm everywhere it appears.
import { ArrowRight, Bot, PanelTop, Rocket, Users } from "lucide-react";
import SectionHeading from "./SectionHeading.jsx";
import { PrimaryButton, SecondaryButton } from "./PrimaryButton.jsx";

const COURSE_IMAGE = "/manus-storage/starhustler-course-creators_4af6efe2.png";
const courses = [
  { heading: "Solopreneur Class", title: "Solopreneur Class: Dari Ide Sampai Terjual", instructor: "Andre Tuwan, Abdul Arfan, Septianus", icon: Rocket, position: "0% center" },
  { heading: "Cara Setup Hermes Agent", title: "Cara Setup Hermes Agent", instructor: "Dhiya Fakhar Nafi", icon: Bot, position: "50% center" },
  { heading: "Membuat Konten Media Sosial dengan AI", title: "Membuat Konten Media Sosial dengan AI", instructor: "Filbert", icon: PanelTop, position: "100% center" },
];

export default function CourseCatalogue({ standalone = false }) {
  return (
    <section className={`courses-section section-shell${standalone ? " courses-section--standalone" : ""}`} id="kelas">
      <div className="courses-header">
        <SectionHeading title="Daftar Kelas Online" />
        <a href="#kelas" className="text-link">Gabung Sekarang <ArrowRight size={17} /></a>
      </div>
      <div className="course-grid">
        {courses.map(({ heading, title, instructor, icon: Icon, position }, index) => (
          <article className={`course-card course-card--${index + 1}`} key={title}>
            <div className="course-art" style={{ backgroundImage: `linear-gradient(180deg, rgba(11,19,48,.0), rgba(11,19,48,.54)), url(${COURSE_IMAGE})`, backgroundPosition: position }}>
              <span className="course-icon"><Icon size={25} /></span>
              <p>{heading}</p>
              <span className="course-orbit" aria-hidden="true" />
            </div>
            <div className="course-info">
              <div className="instructor"><span aria-hidden="true"><Users size={11} /></span><small>{instructor}</small></div>
              <h3>{title}</h3>
              <PrimaryButton href="#ebook">Daftar Kelas</PrimaryButton>
            </div>
          </article>
        ))}
      </div>
      {!standalone && <div className="center-action"><SecondaryButton href="/kelas" className="secondary-dark">Lihat Lainnya <ArrowRight size={16} /></SecondaryButton></div>}
    </section>
  );
}
