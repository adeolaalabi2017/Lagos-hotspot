"use client";

import React, { useEffect } from "react";
import { RouterProvider, useRouter, type Route } from "@/lib/router";
import { useAuthStore } from "@/lib/auth-store";
import { useBookmarkStore } from "@/lib/bookmark-store";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ConvexClientProvider } from "@/components/convex-provider";
import HomePage from "@/components/home/HomePage";
import GridListingsPage from "@/components/listings/GridListingsPage";
import SingleListingPage from "@/components/listings/SingleListingPage";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHome from "@/components/dashboard/DashboardHome";
import DashboardProfile from "@/components/dashboard/DashboardProfile";
import DashboardBookmarks from "@/components/dashboard/DashboardBookmarks";
import DashboardListings from "@/components/dashboard/DashboardListings";
import DashboardMessages from "@/components/dashboard/DashboardMessages";
import DashboardReservations from "@/components/dashboard/DashboardReservations";
import DashboardReviews from "@/components/dashboard/DashboardReviews";
import DashboardAddListing from "@/components/dashboard/DashboardAddListing";
import DashboardAnalytics from "@/components/dashboard/DashboardAnalytics";
import LoginPage from "@/components/pages/LoginPage";
import RegisterPage from "@/components/pages/RegisterPage";
import ForgotPasswordPage from "@/components/pages/ForgotPasswordPage";
import AboutUsPage from "@/components/pages/AboutUsPage";
import BlogPage from "@/components/pages/BlogPage";
import BlogDetailPage from "@/components/pages/BlogDetailPage";
import ContactUsPage from "@/components/pages/ContactUsPage";
import PricingPage from "@/components/pages/PricingPage";
import PrivacyPolicyPage from "@/components/pages/PrivacyPolicyPage";
import HelpCenterPage from "@/components/pages/HelpCenterPage";
import HelpArticlePage from "@/components/pages/HelpArticlePage";
import TermsOfServicePage from "@/components/pages/TermsOfServicePage";
import ErrorPage from "@/components/pages/ErrorPage";
import FAQPage from "@/components/pages/FAQPage";
import { AdminHotspotsPage } from "@/components/admin/AdminHotspotsPage";
import { AdminCsvImportPage } from "@/components/admin/AdminCsvImportPage";
import { AdminReviewsPage } from "@/components/admin/AdminReviewsPage";
import { AdminUsersPage } from "@/components/admin/AdminUsersPage";
import { AdminReportsPage } from "@/components/admin/AdminReportsPage";
import { AdminActivityLogPage } from "@/components/admin/AdminActivityLogPage";
import { ErrorBoundary } from "@/components/error-boundary";

const dashboardRoutes: Route[] = [
  "dashboard",
  "dashboard-profile",
  "dashboard-saved",
  "dashboard-reviews",
  "dashboard-messages",
  "dashboard-my-spots",
  "dashboard-add-spot",
  "dashboard-analytics",
  "dashboard-reservations",
];

const adminRoutes: Route[] = [
  "admin",
  "admin-listings",
  "admin-import",
  "admin-reviews",
  "admin-users",
  "admin-reports",
  "admin-activity-log",
];

const authRoutes: Route[] = [
  "login",
  "register",
  "forgot-password",
];

function AppContent() {
  const { route, navigate } = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const isDashboard = dashboardRoutes.includes(route);
  const isAdmin = adminRoutes.includes(route);
  const isAuth = authRoutes.includes(route);

  // Auth guard: redirect to login if trying to access dashboard without auth
  useEffect(() => {
    if (isDashboard && !isAuthenticated) {
      navigate("login");
    }
  }, [isDashboard, isAuthenticated, navigate]);

  // Re-hydrate bookmarks when auth state flips (login/logout).
  useEffect(() => {
    void useBookmarkStore.getState().refresh();
  }, [isAuthenticated]);

  // If not authenticated and on dashboard route, show nothing while redirecting
  if (isDashboard && !isAuthenticated) {
    return null;
  }

  // Determine navbar variant based on route
  const navbarVariant = route === "home" ? "transparent" : "solid";
  // Negative top margin so hero slides behind transparent navbar
  const transparentOffset = navbarVariant === "transparent" ? " -mt-16 lg:-mt-[72px]" : "";

  const renderDashboardPage = () => {
    switch (route) {
      case "dashboard":
        return <DashboardHome />;
      case "dashboard-profile":
        return <DashboardProfile />;
      case "dashboard-saved":
        return <DashboardBookmarks />;
      case "dashboard-reviews":
        return <DashboardReviews />;
      case "dashboard-messages":
        return <DashboardMessages />;
      case "dashboard-reservations":
        return <DashboardReservations />;
      case "dashboard-my-spots":
        return <DashboardListings />;
      case "dashboard-add-spot":
        return <DashboardAddListing />;
      case "dashboard-analytics":
        return <DashboardAnalytics />;
      default:
        return <DashboardHome />;
    }
  };

  const renderAdminPage = () => {
    switch (route) {
      case "admin-listings":
      case "admin":
        return <AdminHotspotsPage />;
      case "admin-import":
        return <AdminCsvImportPage />;
      case "admin-reviews":
        return <AdminReviewsPage />;
      case "admin-users":
        return <AdminUsersPage />;
      case "admin-reports":
        return <AdminReportsPage />;
      case "admin-activity-log":
        return <AdminActivityLogPage />;
      default:
        return <AdminHotspotsPage />;
    }
  };

  const renderPage = () => {
    switch (route) {
      case "home":
        return <HomePage />;
      case "explore":
        return <GridListingsPage />;
      case "hotspot":
        return <SingleListingPage />;
      case "login":
        return <LoginPage />;
      case "register":
        return <RegisterPage />;
      case "forgot-password":
        return <ForgotPasswordPage />;
      case "about-us":
        return <AboutUsPage />;
      case "blog":
        return <BlogPage />;
      case "blog-detail":
        return <BlogDetailPage />;
      case "contact-us":
        return <ContactUsPage />;
      case "pricing":
        return <PricingPage />;
      case "privacy-policy":
        return <PrivacyPolicyPage />;
      case "help-center":
        return <HelpCenterPage />;
      case "help-article":
        return <HelpArticlePage />;
      case "terms-of-service":
        return <TermsOfServicePage />;
      case "error":
        return <ErrorPage />;
      case "faq":
        return <FAQPage />;
      default:
        return <ErrorPage />;
    }
  };

  // Dashboard - sidebar layout
  if (isDashboard) {
    return (
      <ErrorBoundary>
        <DashboardLayout activeRoute={route}>
          {renderDashboardPage()}
        </DashboardLayout>
      </ErrorBoundary>
    );
  }

  // Admin - own layout, no public chrome
  if (isAdmin) {
    return (
      <ErrorBoundary>
        <main id="main-content">{renderAdminPage()}</main>
      </ErrorBoundary>
    );
  }

  // Auth pages - navbar but no footer, centered layout
  if (isAuth) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col">
          <Navbar variant="solid" />
          <main id="main-content" className="flex-1">{renderPage()}</main>
        </div>
      </ErrorBoundary>
    );
  }

  // Standard pages - navbar + footer
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <Navbar variant={navbarVariant} />
        <main id="main-content" className={`flex-1${transparentOffset}`}>{renderPage()}</main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default function Home() {
  return (
    <ErrorBoundary>
      <ConvexClientProvider>
        <RouterProvider>
          <AppContent />
        </RouterProvider>
      </ConvexClientProvider>
    </ErrorBoundary>
  );
}
