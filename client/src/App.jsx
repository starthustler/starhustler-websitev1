// StarHustler style contract: every route extends the same navy, white, vivid-blue editorial learning system.
import Home from "./pages/Home.jsx";
import ClassesPage from "./pages/ClassesPage.jsx";
import CompanyTrainingPage from "./pages/CompanyTrainingPage.jsx";
import CommunityPage from "./pages/CommunityPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import BlogArticlePage from "./pages/BlogArticlePage.jsx";
import SolopreneurClassPage from "./pages/SolopreneurClassPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import { Route, Switch } from "wouter";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/kelas" component={ClassesPage} />
      <Route path="/kelas/solopreneur-class" component={SolopreneurClassPage} />
      <Route path="/company-training" component={CompanyTrainingPage} />
      <Route path="/komunitas" component={CommunityPage} />
      <Route path="/tentang-kami" component={AboutPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogArticlePage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
