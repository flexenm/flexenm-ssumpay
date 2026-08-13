import type { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useMe } from "@/hooks/useMe";

import AdminLayout from "@/components/layout/AdminLayout";

import AdminLoginPage from "@/pages/auth/AdminLoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import AdminOrdersPage from "@/pages/orders/AdminOrdersPage";
import AdminProductsPage from "@/pages/products/AdminProductsPage";
import AdminMembersPage from "@/pages/members/AdminMembersPage";
import AdminNoticesPage from "@/pages/notices/AdminNoticesPage";
import AdminNoticeFormPage from "@/pages/notices/AdminNoticeFormPage";
import AdminInquiriesPage from "@/pages/inquiries/AdminInquiriesPage";
import AdminInquiryDetailPage from "@/pages/inquiries/AdminInquiryDetailPage";

// 토큰이 HttpOnly 쿠키라 JS 는 로그인 여부를 알 수 없다 — 판정은 전적으로 서버 /me 응답이다.
// useMe 가 401 을 에러가 아닌 null(비로그인)로 돌려주므로 로딩 → 로그인 여부 두 단계로 끝난다.
function AdminGuard({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading } = useMe();
  if (isLoading) return null;
  if (!isLoggedIn) return <Navigate to="/signin" replace />;
  return children;
}

// 전용 도메인(admin.flextv.co.kr)이라 /admin prefix 없이 루트에 붙인다.
// 로그인은 가드 밖이어야 하므로 레이아웃의 자식이 아닌 형제 라우트로 둔다.
export const router = createBrowserRouter([
  { path: "/signin", element: <AdminLoginPage /> },
  {
    path: "/",
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "orders", element: <AdminOrdersPage /> },
      { path: "products", element: <AdminProductsPage /> },
      { path: "members", element: <AdminMembersPage /> },
      { path: "notices", element: <AdminNoticesPage /> },
      { path: "notices/new", element: <AdminNoticeFormPage /> },
      { path: "notices/:id/edit", element: <AdminNoticeFormPage /> },
      { path: "inquiries", element: <AdminInquiriesPage /> },
      { path: "inquiries/:id", element: <AdminInquiryDetailPage /> },
    ],
  },
]);
