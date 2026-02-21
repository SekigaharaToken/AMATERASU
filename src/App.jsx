import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Home, ArrowLeftRight } from "lucide-react";
import { Header } from "./components/layout/Header.jsx";
import { Footer } from "./components/layout/Footer.jsx";
import { BottomNav } from "./components/layout/BottomNav.jsx";
import { PageWrapper } from "./components/layout/PageWrapper.jsx";
import { NetworkGuardBanner } from "./components/layout/NetworkGuardBanner.jsx";
import { ErrorBoundary } from "./components/layout/ErrorBoundary.jsx";
import { LoginModal } from "./components/auth/LoginModal.jsx";
import { Skeleton } from "./components/ui/skeleton.jsx";
import HomePage from "./pages/HomePage.jsx";

const SwapPage = lazy(() => import("./pages/SwapPage.jsx"));
const AdminPage = import.meta.env.DEV
  ? lazy(() => import("./pages/AdminPage.jsx"))
  : null;

function App() {
  return (
    <div className="flex min-h-svh flex-col">
      <NetworkGuardBanner />
      <Header />
      <ErrorBoundary>
        <PageWrapper>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/swap" element={<SwapPage />} />
              {import.meta.env.DEV && AdminPage && (
                <Route path="/admin" element={<AdminPage />} />
              )}
            </Routes>
          </Suspense>
        </PageWrapper>
      </ErrorBoundary>
      <Footer />
      <BottomNav
        items={[
          { to: "/", icon: Home, labelKey: "nav.home" },
          { to: "/swap", icon: ArrowLeftRight, labelKey: "nav.swap" },
        ]}
      />
      <LoginModal />
    </div>
  );
}

export default App;
