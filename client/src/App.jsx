// StarHustler style contract: every route extends the same navy, white, vivid-blue editorial learning system.
import { lazy, Suspense } from "react";
import ManagedClassPage from "./pages/ManagedClassPage.jsx";
import { Route, Switch } from "wouter";
import MetaPixel from "./components/MetaPixel.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const ClassesPage = lazy(() => import("./pages/ClassesPage.jsx"));
const CompanyTrainingPage = lazy(() => import("./pages/CompanyTrainingPage.jsx"));
const CommunityPage = lazy(() => import("./pages/CommunityPage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const BlogPage = lazy(() => import("./pages/BlogPage.jsx"));
const BlogArticlePage = lazy(() => import("./pages/BlogArticlePage.jsx"));
const AdminClassesPage = lazy(() => import("./pages/AdminClassesPage.jsx"));
const AdminClassEditorPage = lazy(() => import("./pages/AdminClassEditorPage.jsx"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage.jsx"));
const AdminSettingsPage = lazy(() => import("./pages/AdminSettingsPage.jsx"));
const AdminBlogPage = lazy(() => import("./pages/AdminBlogPage.jsx"));
const AdminBlogEditorPage = lazy(() => import("./pages/AdminBlogEditorPage.jsx"));
const AdminOrdersPage = lazy(() => import("./pages/AdminOrdersPage.jsx"));
const PaymentStatusPage = lazy(() => import("./pages/PaymentStatusPage.jsx"));
const StudentActivationPage = lazy(() => import("./pages/StudentActivationPage.jsx"));
const StudentClassesPage = lazy(() => import("./pages/StudentClassesPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

export default function App() {
  return (
    <>
    <MetaPixel />
    <Suspense fallback={null}>
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
        {params => {
          window.location.replace(`/kelas/${params.slug}#daftar-kelas`);
          return null;
        }}
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
    </Suspense>
    </>
  );
}
