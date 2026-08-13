import type { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { getAdminAccessToken, removeAdminAccessToken } from "@/utils/cookie";
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

// 가드는 쿠키 존재만 보지 않고 서버 /me 응답으로 실제 인증 상태를 확인한다.
// 순서 주의: 쿠키 체크를 먼저(없으면 즉시 리다이렉트) → 그다음 로딩 → 에러 판정.
// enabled:false 인 쿼리는 v5 에서 status:'pending' 이라, 쿠키 체크가 앞서지 않으면
// 무한 로딩에 빠진다.
function AdminGuard({ children }: { children: ReactNode }) {
  const { isPending, isError, data } = useMe();
  if (!getAdminAccessToken()) return <Navigate to="/signin" replace />;
  if (isPending) return null;
  if (isError || !data) {
    removeAdminAccessToken();
    return <Navigate to="/signin" replace />;
  }
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
