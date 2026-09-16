// StarHustler style contract: this shared catalogue preserves the homepage's practical, editorial course-card rhythm everywhere it appears.
import { ArrowRight, Rocket, Users } from "lucide-react";
import { DEFAULT_CLASS_RECORDS } from "@shared/classContent";
import SectionHeading from "./SectionHeading.jsx";
import { PrimaryButton, SecondaryButton } from "./PrimaryButton.jsx";
import { trpc } from "../lib/trpc";

const COURSE_IMAGE = "/assets/starhustler-course-creators_4af6efe2.webp";
export default function CourseCatalogue({ standalone = false }) {
  const query = trpc.classes.list.useQuery(undefined, {
    retry: 1,
    placeholderData: DEFAULT_CLASS_RECORDS,
  });
  const records = query.data?.length ? query.data : DEFAULT_CLASS_RECORDS;
  const courses = records.map((item, index) => ({
    heading: item.content.hero.eyebrow || item.name,
    title: item.name,
    instructor: item.content.mentor.name || "StartHustler",
    icon: Rocket,
    position: index === 0 ? "0% center" : "center",
    image: index === 0 ? COURSE_IMAGE : item.content.hero.imageUrl,
    href: `/kelas/${item.slug}`,
  }));
  return (
    <section
      className={`courses-section section-shell${standalone ? " courses-section--standalone" : ""}`}
      id="kelas"
    >
      <div className="courses-header">
        <SectionHeading title="Daftar Kelas Online" />
        <a href="#kelas" className="text-link">
          Gabung Sekarang <ArrowRight size={17} />
        </a>
      </div>
      <div className="course-grid">
        {courses.map(
          (
            { heading, title, instructor, icon: Icon, position, image, href },
            index
          ) => (
            <article
              className={`course-card course-card--${index + 1}`}
              key={title}
            >
              <div
                className="course-art"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(11,19,48,.0), rgba(11,19,48,.54)), url(${image})`,
                  backgroundPosition: position,
                }}
              >
                <span className="course-icon">
                  <Icon size={25} />
                </span>
                <p>{heading}</p>
                <span className="course-orbit" aria-hidden="true" />
              </div>
              <div className="course-info">
                <div className="instructor">
                  <span aria-hidden="true">
                    <Users size={11} />
                  </span>
                  <small>{instructor}</small>
                </div>
                <h3>{title}</h3>
                <PrimaryButton href={href}>Daftar Kelas</PrimaryButton>
              </div>
            </article>
          )
        )}
      </div>
      {!standalone && (
        <div className="center-action">
          <SecondaryButton href="/kelas" className="secondary-dark">
            Lihat Lainnya <ArrowRight size={16} />
          </SecondaryButton>
        </div>
      )}
    </section>
  );
}
