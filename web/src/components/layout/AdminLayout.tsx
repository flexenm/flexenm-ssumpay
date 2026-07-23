import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'

const menus = [
  { path: '/admin/dashboard', label: '대시보드' },
  { path: '/admin/orders', label: '주문/충전 관리' },
  { path: '/admin/products', label: '상품 관리' },
  { path: '/admin/members', label: '회원 관리' },
  { path: '/admin/notices', label: '공지사항 관리' },
  { path: '/admin/inquiries', label: '1:1 문의 관리' },
]

interface AdminInfo {
  name?: string
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const admin = JSON.parse(localStorage.getItem('adminInfo') || '{}') as AdminInfo

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminInfo')
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-[200px] flex-col bg-slate-800 text-white">
        <div className="border-b border-slate-700 px-5 py-6 text-lg font-bold">ssumpay ADMIN</div>
        <nav className="flex-1 py-3">
          {menus.map(m => {
            const active = pathname.startsWith(m.path)
            return (
              <Link
                key={m.path}
                to={m.path}
                className={`block px-5 py-2.5 text-sm ${active ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              >
                {m.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-slate-700 px-5 py-4 text-[13px] text-slate-400">
          <div>{admin.name || 'Admin'}</div>
          <button onClick={logout} className="mt-2 cursor-pointer border-none bg-transparent p-0 text-[13px] text-red-500">로그아웃</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-slate-50 p-8">
        <Outlet />
      </main>
    </div>
  )
}
