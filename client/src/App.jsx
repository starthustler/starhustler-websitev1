// StarHustler style contract: every route extends the same navy, white, vivid-blue editorial learning system.
import Home from "./pages/Home.jsx";
import ClassesPage from "./pages/ClassesPage.jsx";
import CompanyTrainingPage from "./pages/CompanyTrainingPage.jsx";
import CommunityPage from "./pages/CommunityPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import BlogArticlePage from "./pages/BlogArticlePage.jsx";
import ManagedClassPage from "./pages/ManagedClassPage.jsx";
import AdminClassesPage from "./pages/AdminClassesPage.jsx";
import AdminClassEditorPage from "./pages/AdminClassEditorPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AdminSettingsPage from "./pages/AdminSettingsPage.jsx";
import AdminBlogPage from "./pages/AdminBlogPage.jsx";
import AdminBlogEditorPage from "./pages/AdminBlogEditorPage.jsx";
import AdminOrdersPage from "./pages/AdminOrdersPage.jsx";
import ClassRegistrationPage from "./pages/ClassRegistrationPage.jsx";
import PaymentStatusPage from "./pages/PaymentStatusPage.jsx";
import StudentActivationPage from "./pages/StudentActivationPage.jsx";
import StudentClassesPage from "./pages/StudentClassesPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import { Route, Switch } from "wouter";
import MetaPixel from "./components/MetaPixel.jsx";

export default function App() {
  return (
    <>
    <MetaPixel />
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/kelas" component={ClassesPage} />
      <Route path="/kelas/solopreneur-class">
        {() => {
          window.location.replace("/kelas/kelas-solopreneur");
          return null;
        }}
      </Route>
      <Route path="/kelas/:slug/daftar">
        {params => <ClassRegistrationPage slug={params.slug} />}
      </Route>
      <Route path="/kelas/:slug">
        {params => <ManagedClassPage slug={params.slug} />}
      </Route>
      <Route path="/admin/kelas" component={AdminClassesPage} />
      <Route path="/admin/kelas/new">
        {() => <AdminClassEditorPage id="new" />}
      </Route>
      <Route path="/admin/kelas/:id/edit">
        {params => <AdminClassEditorPage id={params.id} />}
      </Route>
      <Route path="/admin/blog" component={AdminBlogPage} />
      <Route path="/admin/blog/new">
        {() => <AdminBlogEditorPage id="new" />}
      </Route>
      <Route path="/admin/blog/:id/edit">
        {params => <AdminBlogEditorPage id={params.id} />}
      </Route>
      <Route path="/admin/settings" component={AdminSettingsPage} />
      <Route path="/admin/orders" component={AdminOrdersPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/pembayaran/:orderId">
        {params => <PaymentStatusPage orderId={params.orderId} />}
      </Route>
      <Route path="/akun/aktivasi/:token">
        {params => <StudentActivationPage token={params.token} />}
      </Route>
      <Route path="/akun/kelas" component={StudentClassesPage} />
      <Route path="/company-training" component={CompanyTrainingPage} />
      <Route path="/komunitas" component={CommunityPage} />
      <Route path="/tentang-kami" component={AboutPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogArticlePage} />
      <Route component={NotFoundPage} />
    </Switch>
    </>
  );
}
