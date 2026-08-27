// StarHustler style contract: the Kelas route is the exact expanded destination of the homepage's Daftar Kelas Online catalogue.
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import CourseCatalogue from "../components/CourseCatalogue.jsx";

export default function ClassesPage() {
  return (
    <div className="site-page classes-page">
      <Navbar />
      <main><CourseCatalogue standalone /></main>
      <Footer />
    </div>
  );
}
