import type { ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import UserLayout from '../components/layout/UserLayout'
import AdminLayout from '../components/layout/AdminLayout'

import HomePage from '../pages/user/home/HomePage'
import LoginPage from '../pages/user/auth/LoginPage'
import RegisterPage from '../pages/user/auth/RegisterPage'
import ForgotPasswordPage from '../pages/user/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/user/auth/ResetPasswordPage'
import ProductsPage from '../pages/user/products/ProductsPage'
import OrderPage from '../pages/user/order/OrderPage'
import OrderCompletePage from '../pages/user/order/OrderCompletePage'
import MyPage from '../pages/user/mypage/MyPage'
import CustomerCenterPage from '../pages/user/customer/CustomerCenterPage'
import NoticeDetailPage from '../pages/user/customer/NoticeDetailPage'
import InquiryFormPage from '../pages/user/customer/InquiryFormPage'
import InquiryDetailPage from '../pages/user/customer/InquiryDetailPage'

import AdminLoginPage from '../pages/admin/auth/AdminLoginPage'
import DashboardPage from '../pages/admin/dashboard/DashboardPage'
import AdminOrdersPage from '../pages/admin/orders/AdminOrdersPage'
import AdminProductsPage from '../pages/admin/products/AdminProductsPage'
import AdminMembersPage from '../pages/admin/members/AdminMembersPage'
import AdminNoticesPage from '../pages/admin/notices/AdminNoticesPage'
import AdminInquiriesPage from '../pages/admin/inquiries/AdminInquiriesPage'
import AdminInquiryDetailPage from '../pages/admin/inquiries/AdminInquiryDetailPage'

const isUser = () => !!localStorage.getItem('token')
const isAdmin = () => !!localStorage.getItem('adminToken')

function UserGuard({ children }: { children: ReactNode }) {
  return isUser() ? children : <Navigate to="/login" replace />
}

function AdminGuard({ children }: { children: ReactNode }) {
  return isAdmin() ? children : <Navigate to="/admin/login" replace />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <UserLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'order/:productId', element: <UserGuard><OrderPage /></UserGuard> },
      { path: 'order/complete/:orderNo', element: <UserGuard><OrderCompletePage /></UserGuard> },
      { path: 'mypage', element: <UserGuard><MyPage /></UserGuard> },
      { path: 'customer', element: <CustomerCenterPage /> },
      { path: 'customer/notices/:id', element: <NoticeDetailPage /> },
      { path: 'customer/inquiries/new', element: <UserGuard><InquiryFormPage /></UserGuard> },
      { path: 'mypage/inquiries/:id', element: <UserGuard><InquiryDetailPage /></UserGuard> },
    ],
  },
  { path: '/admin/login', element: <AdminLoginPage /> },
  {
    path: '/admin',
    element: <AdminGuard><AdminLayout /></AdminGuard>,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'members', element: <AdminMembersPage /> },
      { path: 'notices', element: <AdminNoticesPage /> },
      { path: 'inquiries', element: <AdminInquiriesPage /> },
      { path: 'inquiries/:id', element: <AdminInquiryDetailPage /> },
    ],
  },
])
