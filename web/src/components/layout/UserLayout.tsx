import { Outlet, Link, useNavigate } from 'react-router-dom'

export default function UserLayout() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('token')

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-[60px] items-center justify-between border-b border-gray-200 bg-white px-10">
        <Link to="/" className="text-[22px] font-bold text-blue-600">ssumpay</Link>
        <nav className="flex items-center gap-6">
          <Link to="/customer" className="text-sm text-gray-700">고객센터</Link>
          {isLoggedIn ? (
            <>
              <Link to="/mypage" className="rounded-full border border-blue-600 px-4 py-1.5 text-sm text-blue-600">마이페이지</Link>
              <button onClick={logout} className="cursor-pointer rounded-full border-0 bg-slate-800 px-4 py-1.5 text-sm text-white">로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/register" className="rounded-full border border-blue-600 px-4 py-1.5 text-sm text-blue-600">회원가입</Link>
              <Link to="/login" className="rounded-full bg-blue-600 px-4 py-1.5 text-sm text-white">로그인</Link>
            </>
          )}
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-slate-800 px-10 py-8 text-[13px] text-slate-400">
        <div className="mx-auto max-w-[1200px]">
          <p>업체명 | 대표자명: 000 &nbsp; 사업자등록번호: 00000 &nbsp; 주소: 000000 &nbsp; Tel: 00000000</p>
          <div className="mt-3 flex gap-5">
            {['이용약관', '개인정보처리방침', '고객센터', '사업자정보'].map(t => (
              <Link key={t} to="/customer" className="text-slate-400">{t}</Link>
            ))}
          </div>
          <p className="mt-3">© 2026 ssumpay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
