import type { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { getAccessToken, removeAccessToken } from "@/utils/cookie";
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

// 가드는 쿠키 존재만 보지 않고 서버 /me 응답으로 실제 인증 상태를 확인한다.
// 순서 주의: 쿠키 체크를 먼저(없으면 즉시 리다이렉트) → 그다음 로딩 → 에러 판정.
// enabled:false 인 쿼리는 v5 에서 status:'pending' 이라, 쿠키 체크가 앞서지 않으면
// 무한 로딩에 빠진다.
function UserGuard({ children }: { children: ReactNode }) {
  const { isPending, isError, data } = useMe();
  if (!getAccessToken()) return <Navigate to="/signin" replace />;
  if (isPending) return null;
  if (isError || !data) {
    removeAccessToken();
    return <Navigate to="/signin" replace />;
  }
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
