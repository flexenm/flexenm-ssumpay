import type { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useMe } from "@/hooks/useMe";

import UserLayout from "@/components/layout/UserLayout";

import HomePage from "@/pages/home/HomePage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import ProductsPage from "@/pages/products/ProductsPage";
import OrderPage from "@/pages/order/OrderPage";
import OrderCompletePage from "@/pages/order/OrderCompletePage";
import MyPage from "@/pages/mypage/MyPage";
import CustomerCenterPage from "@/pages/customer/CustomerCenterPage";
import NoticeDetailPage from "@/pages/customer/NoticeDetailPage";
import InquiryFormPage from "@/pages/customer/InquiryFormPage";
import InquiryDetailPage from "@/pages/customer/InquiryDetailPage";

// 토큰이 HttpOnly 쿠키라 JS 는 로그인 여부를 알 수 없다 — 판정은 전적으로 서버 /me 응답이다.
// useMe 가 401 을 에러가 아닌 null(비로그인)로 돌려주므로 로딩 → 로그인 여부 두 단계로 끝난다.
function UserGuard({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading } = useMe();
  if (isLoading) return null;
  if (!isLoggedIn) return <Navigate to="/signin" replace />;
  return children;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "signin", element: <LoginPage /> },
      { path: "signup", element: <RegisterPage /> },
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
      { path: "cs", element: <CustomerCenterPage /> },
      { path: "cs/notices/:id", element: <NoticeDetailPage /> },
      {
        path: "cs/inquiries/new",
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
]);
