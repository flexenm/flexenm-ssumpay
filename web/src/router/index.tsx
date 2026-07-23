import type { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import {
  getAccessToken,
  getAdminAccessToken,
  removeAccessToken,
  removeAdminAccessToken,
} from "@/utils/cookie";
import { useMe } from "@/hooks/useMe";
import { useAdminMe } from "@/hooks/useAdminMe";

import UserLayout from "@/components/layout/UserLayout";
import AdminLayout from "@/components/layout/AdminLayout";

import HomePage from "@/pages/user/home/HomePage";
import LoginPage from "@/pages/user/auth/LoginPage";
import RegisterPage from "@/pages/user/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/user/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/user/auth/ResetPasswordPage";
import ProductsPage from "@/pages/user/products/ProductsPage";
import OrderPage from "@/pages/user/order/OrderPage";
import OrderCompletePage from "@/pages/user/order/OrderCompletePage";
import MyPage from "@/pages/user/mypage/MyPage";
import CustomerCenterPage from "@/pages/user/customer/CustomerCenterPage";
import NoticeDetailPage from "@/pages/user/customer/NoticeDetailPage";
import InquiryFormPage from "@/pages/user/customer/InquiryFormPage";
import InquiryDetailPage from "@/pages/user/customer/InquiryDetailPage";

import AdminLoginPage from "@/pages/admin/auth/AdminLoginPage";
import DashboardPage from "@/pages/admin/dashboard/DashboardPage";
import AdminOrdersPage from "@/pages/admin/orders/AdminOrdersPage";
import AdminProductsPage from "@/pages/admin/products/AdminProductsPage";
import AdminMembersPage from "@/pages/admin/members/AdminMembersPage";
import AdminNoticesPage from "@/pages/admin/notices/AdminNoticesPage";
import AdminNoticeFormPage from "@/pages/admin/notices/AdminNoticeFormPage";
import AdminInquiriesPage from "@/pages/admin/inquiries/AdminInquiriesPage";
import AdminInquiryDetailPage from "@/pages/admin/inquiries/AdminInquiryDetailPage";

// 가드는 쿠키 존재만 보지 않고 서버 /me 응답으로 실제 인증 상태를 확인한다.
// 순서 주의: 쿠키 체크를 먼저(없으면 즉시 리다이렉트) → 그다음 로딩 → 에러 판정.
// enabled:false 인 쿼리는 v5 에서 status:'pending' 이라, 쿠키 체크가 앞서지 않으면
// 무한 로딩에 빠진다.
function UserGuard({ children }: { children: ReactNode }) {
  const { isPending, isError, data } = useMe();
  if (!getAccessToken()) return <Navigate to="/login" replace />;
  if (isPending) return null;
  if (isError || !data) {
    removeAccessToken();
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminGuard({ children }: { children: ReactNode }) {
  const { isPending, isError, data } = useAdminMe();
  if (!getAdminAccessToken()) return <Navigate to="/admin/login" replace />;
  if (isPending) return null;
  if (isError || !data) {
    removeAdminAccessToken();
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/:category", element: <ProductsPage /> },
      { path: "products/:category/:sub", element: <ProductsPage /> },
      {
        path: "order/:productId",
        element: (
          <UserGuard>
            <OrderPage />
          </UserGuard>
        ),
      },
      {
        path: "order/complete/:orderNo",
        element: (
          <UserGuard>
            <OrderCompletePage />
          </UserGuard>
        ),
      },
      {
        path: "mypage",
        element: (
          <UserGuard>
            <MyPage />
          </UserGuard>
        ),
      },
      { path: "customer", element: <CustomerCenterPage /> },
      { path: "customer/notices/:id", element: <NoticeDetailPage /> },
      {
        path: "customer/inquiries/new",
        element: (
          <UserGuard>
            <InquiryFormPage />
          </UserGuard>
        ),
      },
      {
        path: "mypage/inquiries/:id",
        element: (
          <UserGuard>
            <InquiryDetailPage />
          </UserGuard>
        ),
      },
    ],
  },
  { path: "/admin/login", element: <AdminLoginPage /> },
  {
    path: "/admin",
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
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
